export type ProviderType = 'nvidia' | 'openrouter';

export type ModelCapability = {
  chat: boolean;
  completion: boolean;
  responses: boolean;
  streaming: boolean;
  vision: boolean;
  reasoning: boolean;
  toolCalling: boolean;
  codeGeneration: boolean;
  structuredOutput: boolean;
};

export type BloomModel = {
  id: string; // e.g. "bloom-reason", "bloom-swift", "bloom-code"
  canonicalModelId: string; // e.g. "nvidia/llama-3.1-nemotron-70b-instruct"
  displayName: string; // "Bloom Reason"
  shortName: string; // "Reason"
  description: string;
  badge?: string; // "⚡ Fast", "◈ Deep", "⌘ Code", "◉ Vision", "★ Flagship"
  provider: ProviderType;
  publisher?: string; // "NVIDIA", "Meta", "Qwen", "DeepSeek", "Mistral", "OpenAI"
  family?: string;
  capabilities: ModelCapability;
  contextWindow: number;
  maxOutputTokens: number;
  isDefault?: boolean;
  pricingTier?: 'free' | 'pro';
};

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
  name?: string;
};

export type ChatRequest = {
  model: string; // Can be bloom model id or canonical model id
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  response_format?: { type: 'json_object' | 'text' };
  tools?: any[];
  tool_choice?: any;
  signal?: AbortSignal;
};

export type UsageMetadata = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ChatChunk = {
  id: string;
  delta: {
    content?: string;
    reasoning?: string;
    role?: string;
    tool_calls?: any[];
  };
  finishReason?: string | null;
  usage?: UsageMetadata;
};

export type ChatResult = {
  id: string;
  content: string;
  reasoning?: string;
  role: string;
  finishReason: string;
  usage?: UsageMetadata;
  toolCalls?: any[];
  rawModelId: string;
  bloomModelId: string;
};

export type AIProvider = {
  id: ProviderType;
  name: string;
  listModels(): Promise<BloomModel[]>;
  chat(request: ChatRequest, model: BloomModel): Promise<ChatResult>;
  streamChat(request: ChatRequest, model: BloomModel): AsyncIterable<ChatChunk>;
  isConfigured(): boolean;
};

export type GenerationRecord = {
  generationId: string;
  projectId?: string;
  frameId?: string;
  userId?: string;
  provider: ProviderType;
  modelId: string;
  canonicalModelId: string;
  displayName: string;
  prompt: string;
  output?: string;
  reasoning?: string;
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  durationMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  finishReason?: string;
  error?: string;
  createdOn?: Date;
};
