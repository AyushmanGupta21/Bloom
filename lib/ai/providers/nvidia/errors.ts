export type BloomErrorCode =
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_FAILED'
  | 'MODEL_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'CONTEXT_LIMIT'
  | 'TIMEOUT'
  | 'STREAM_INTERRUPTED'
  | 'PROVIDER_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export class BloomAIError extends Error {
  code: BloomErrorCode;
  status?: number;
  retryable: boolean;
  provider: string;

  constructor(message: string, code: BloomErrorCode, status?: number, retryable: boolean = false, provider: string = 'nvidia') {
    super(message);
    this.name = 'BloomAIError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.provider = provider;
  }
}

export function normalizeNvidiaError(error: any, status?: number): BloomAIError {
  if (error instanceof BloomAIError) {
    return error;
  }

  const rawMessage = typeof error === 'string' ? error : error?.message || error?.error?.message || 'An unexpected AI generation error occurred';
  const statusCode = status || error?.status || 500;

  if (statusCode === 401 || statusCode === 403 || rawMessage.toLowerCase().includes('api key') || rawMessage.toLowerCase().includes('unauthorized')) {
    return new BloomAIError(
      'NVIDIA NIM authentication failed. Please check that NVIDIA_API_KEY is configured correctly.',
      'AUTHENTICATION_FAILED',
      statusCode,
      false,
      'nvidia'
    );
  }

  if (statusCode === 429 || rawMessage.toLowerCase().includes('rate limit') || rawMessage.toLowerCase().includes('quota')) {
    return new BloomAIError(
      'NVIDIA NIM rate limit exceeded. Please wait a moment before trying again.',
      'RATE_LIMITED',
      429,
      true,
      'nvidia'
    );
  }

  if (statusCode === 404 || statusCode === 410 || rawMessage.toLowerCase().includes('model not found') || rawMessage.toLowerCase().includes('does not exist') || rawMessage.toLowerCase().includes('end of life') || rawMessage.toLowerCase().includes('no longer available')) {
    return new BloomAIError(
      'The requested AI model is unavailable or has been deprecated. Attempting fallback.',
      'MODEL_UNAVAILABLE',
      statusCode,
      true,
      'nvidia'
    );
  }

  if (statusCode === 408 || rawMessage.toLowerCase().includes('timeout') || rawMessage.toLowerCase().includes('timed out')) {
    return new BloomAIError(
      'Generation request timed out. Please retry with a shorter prompt or simpler request.',
      'TIMEOUT',
      408,
      true,
      'nvidia'
    );
  }

  if (statusCode === 400 && (rawMessage.toLowerCase().includes('context length') || rawMessage.toLowerCase().includes('maximum context'))) {
    return new BloomAIError(
      'The conversation context exceeds the model\'s maximum context window.',
      'CONTEXT_LIMIT',
      400,
      false,
      'nvidia'
    );
  }

  if (statusCode >= 500) {
    return new BloomAIError(
      'NVIDIA NIM server error occurred. Automatic failover or retry will be attempted.',
      'PROVIDER_UNAVAILABLE',
      statusCode,
      true,
      'nvidia'
    );
  }

  return new BloomAIError(rawMessage, 'UNKNOWN_ERROR', statusCode, false, 'nvidia');
}
