import { ChatRequest, ChatChunk, ChatResult, UsageMetadata } from '../../types';
import { BloomAIError, normalizeNvidiaError } from './errors';

// In-memory rate limiting / concurrency tracking
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  activeRequests: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();
const MAX_CONCURRENT_REQUESTS = 5;
const MAX_RPM = 20; // 20 requests per minute
const REFILL_INTERVAL_MS = 60000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(key);

  if (!bucket) {
    bucket = { tokens: MAX_RPM, lastRefill: now, activeRequests: 0 };
    rateLimitBuckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed > REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_RPM;
    bucket.lastRefill = now;
  }

  if (bucket.activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return false;
  }

  if (bucket.tokens <= 0) {
    return false;
  }

  bucket.tokens -= 1;
  bucket.activeRequests += 1;
  return true;
}

function releaseRateLimit(key: string) {
  const bucket = rateLimitBuckets.get(key);
  if (bucket && bucket.activeRequests > 0) {
    bucket.activeRequests -= 1;
  }
}

export class NvidiaClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultTimeoutMs: number = 90000; // 90s for large reasoning generations

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || '';
    this.baseUrl = (baseUrl || process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Safe fetch with exponential retry and backoff for 429/503/network errors
   */
  private async fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (response.ok) {
          return response;
        }

        // Check if retryable (429 or 5xx)
        if (response.status === 429 || response.status >= 500 || response.status === 408) {
          const retryAfterHeader = response.headers.get('Retry-After');
          let delayMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : Math.pow(2, attempt) * 1000 + Math.random() * 500;
          if (isNaN(delayMs) || delayMs <= 0) delayMs = 2000;

          if (attempt < maxRetries) {
            console.warn(`[NVIDIA NIM] Request returned ${response.status}. Retrying attempt ${attempt + 1}/${maxRetries} in ${delayMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
        }

        // Non-retryable error or exhausted retries
        const errJson = await response.json().catch(() => ({}));
        throw normalizeNvidiaError(errJson, response.status);
      } catch (err: any) {
        lastError = err;
        if (err instanceof BloomAIError && !err.retryable) {
          throw err;
        }
        if (attempt < maxRetries) {
          const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    throw normalizeNvidiaError(lastError);
  }

  /**
   * Fetch list of models from GET /v1/models
   */
  public async getModels(): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const response = await this.fetchWithRetry(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data?.data || [];
  }

  /**
   * Non-streaming chat completion
   */
  public async createChatCompletion(request: ChatRequest, canonicalModelId: string, rateLimitKey: string = 'global'): Promise<ChatResult> {
    if (!this.isConfigured()) {
      throw new BloomAIError('NVIDIA API Key is missing. Please set NVIDIA_API_KEY in .env.local.', 'AUTHENTICATION_FAILED', 401, false, 'nvidia');
    }

    if (!checkRateLimit(rateLimitKey)) {
      throw new BloomAIError('Rate limit exceeded. Please wait a few moments before making another generation request.', 'RATE_LIMITED', 429, true, 'nvidia');
    }

    try {
      const payload: any = {
        model: canonicalModelId,
        messages: request.messages,
        stream: false,
      };

      if (request.temperature !== undefined) payload.temperature = request.temperature;
      if (request.top_p !== undefined) payload.top_p = request.top_p;
      if (request.max_tokens !== undefined) payload.max_tokens = request.max_tokens;
      if (request.stop) payload.stop = request.stop;

      const response = await this.fetchWithRetry(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: request.signal,
      });

      const json = await response.json();
      const choice = json.choices?.[0];
      const message = choice?.message || {};

      const usage: UsageMetadata = {
        promptTokens: json.usage?.prompt_tokens || 0,
        completionTokens: json.usage?.completion_tokens || 0,
        totalTokens: json.usage?.total_tokens || 0,
      };

      return {
        id: json.id || `gen_${Date.now()}`,
        content: message.content || '',
        reasoning: message.reasoning || message.reasoning_content || undefined,
        role: message.role || 'assistant',
        finishReason: choice?.finish_reason || 'stop',
        usage,
        toolCalls: message.tool_calls,
        rawModelId: canonicalModelId,
        bloomModelId: request.model,
      };
    } finally {
      releaseRateLimit(rateLimitKey);
    }
  }

  /**
   * Streaming chat completion returning an AsyncIterable of ChatChunk
   */
  public async *streamChatCompletion(request: ChatRequest, canonicalModelId: string, rateLimitKey: string = 'global'): AsyncIterable<ChatChunk> {
    if (!this.isConfigured()) {
      throw new BloomAIError('NVIDIA API Key is missing. Please set NVIDIA_API_KEY in .env.local.', 'AUTHENTICATION_FAILED', 401, false, 'nvidia');
    }

    if (!checkRateLimit(rateLimitKey)) {
      throw new BloomAIError('Rate limit reached. Please allow the current generation to finish before starting a new one.', 'RATE_LIMITED', 429, true, 'nvidia');
    }

    try {
      const payload: any = {
        model: canonicalModelId,
        messages: request.messages,
        stream: true,
      };

      if (request.temperature !== undefined) payload.temperature = request.temperature;
      if (request.top_p !== undefined) payload.top_p = request.top_p;
      if (request.max_tokens !== undefined) payload.max_tokens = request.max_tokens;
      if (request.stop) payload.stop = request.stop;

      const response = await this.fetchWithRetry(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: request.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new BloomAIError('Failed to read response stream from NVIDIA NIM.', 'STREAM_INTERRUPTED', 500, true, 'nvidia');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // SSE comment or empty line

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const choice = parsed.choices?.[0];
              const delta = choice?.delta;

              if (delta) {
                const chunk: ChatChunk = {
                  id: parsed.id || `chunk_${Date.now()}`,
                  delta: {
                    content: delta.content || '',
                    reasoning: delta.reasoning_content || delta.reasoning || undefined,
                    role: delta.role,
                    tool_calls: delta.tool_calls,
                  },
                  finishReason: choice?.finish_reason || null,
                  usage: parsed.usage
                    ? {
                        promptTokens: parsed.usage.prompt_tokens || 0,
                        completionTokens: parsed.usage.completion_tokens || 0,
                        totalTokens: parsed.usage.total_tokens || 0,
                      }
                    : undefined,
                };

                yield chunk;
              }
            } catch (jsonErr) {
              // Ignore partial JSON parse chunks
            }
          }
        }
      }
    } finally {
      releaseRateLimit(rateLimitKey);
    }
  }
}
