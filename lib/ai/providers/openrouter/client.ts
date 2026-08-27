import { AIProvider, BloomModel, ChatChunk, ChatRequest, ChatResult } from '../../types';
import { BloomAIError } from '../nvidia/errors';

export class OpenRouterProvider implements AIProvider {
  public id: 'openrouter' = 'openrouter';
  public name: string = 'OpenRouter';
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async listModels(): Promise<BloomModel[]> {
    return [
      {
        id: 'bloom-gpt4o',
        canonicalModelId: 'openai/gpt-4o',
        displayName: 'Bloom GPT-4o',
        shortName: 'GPT-4o',
        description: 'OpenAI GPT-4o high-intelligence multimodal model.',
        badge: '★ Flagship',
        provider: 'openrouter',
        publisher: 'OpenAI',
        family: 'gpt-4o',
        capabilities: {
          chat: true,
          completion: true,
          responses: false,
          streaming: true,
          vision: true,
          reasoning: false,
          toolCalling: true,
          codeGeneration: true,
          structuredOutput: true,
        },
        contextWindow: 128000,
        maxOutputTokens: 4096,
        pricingTier: 'pro',
      },
      {
        id: 'bloom-deepseek-chat',
        canonicalModelId: 'deepseek/deepseek-chat',
        displayName: 'Bloom DeepSeek (OpenRouter)',
        shortName: 'DeepSeek',
        description: 'DeepSeek Chat general-purpose generation model.',
        badge: '⚡ Fast',
        provider: 'openrouter',
        publisher: 'DeepSeek',
        family: 'deepseek-v3',
        capabilities: {
          chat: true,
          completion: true,
          responses: false,
          streaming: true,
          vision: false,
          reasoning: false,
          toolCalling: true,
          codeGeneration: true,
          structuredOutput: true,
        },
        contextWindow: 65536,
        maxOutputTokens: 4096,
        pricingTier: 'free',
      },
    ];
  }

  public async chat(request: ChatRequest, model: BloomModel): Promise<ChatResult> {
    if (!this.isConfigured()) {
      throw new BloomAIError('OpenRouter API key is missing. Set OPENROUTER_API_KEY in .env.local', 'AUTHENTICATION_FAILED', 401, false, 'openrouter');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Bloom',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.canonicalModelId,
        messages: request.messages,
        stream: false,
        max_tokens: request.max_tokens || 4000,
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new BloomAIError(errJson?.error?.message || 'OpenRouter request failed', 'PROVIDER_UNAVAILABLE', response.status, true, 'openrouter');
    }

    const json = await response.json();
    const choice = json.choices?.[0];
    const message = choice?.message || {};

    return {
      id: json.id || `openrouter_${Date.now()}`,
      content: message.content || '',
      role: message.role || 'assistant',
      finishReason: choice?.finish_reason || 'stop',
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens || 0,
            completionTokens: json.usage.completion_tokens || 0,
            totalTokens: json.usage.total_tokens || 0,
          }
        : undefined,
      rawModelId: model.canonicalModelId,
      bloomModelId: model.id,
    };
  }

  public async *streamChat(request: ChatRequest, model: BloomModel): AsyncIterable<ChatChunk> {
    if (!this.isConfigured()) {
      throw new BloomAIError('OpenRouter API key is missing. Set OPENROUTER_API_KEY in .env.local', 'AUTHENTICATION_FAILED', 401, false, 'openrouter');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Bloom',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.canonicalModelId,
        messages: request.messages,
        stream: true,
        max_tokens: request.max_tokens || 4000,
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new BloomAIError(errJson?.error?.message || 'OpenRouter stream request failed', 'PROVIDER_UNAVAILABLE', response.status, true, 'openrouter');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new BloomAIError('Failed to read stream from OpenRouter', 'STREAM_INTERRUPTED', 500, true, 'openrouter');
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
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === '[DONE]') return;

          try {
            const parsed = JSON.parse(dataStr);
            const choice = parsed.choices?.[0];
            const delta = choice?.delta;

            if (delta) {
              yield {
                id: parsed.id || `chunk_${Date.now()}`,
                delta: {
                  content: delta.content || '',
                  role: delta.role,
                },
                finishReason: choice?.finish_reason || null,
              };
            }
          } catch (e) {
            // Ignore partial SSE chunk
          }
        }
      }
    }
  }
}
