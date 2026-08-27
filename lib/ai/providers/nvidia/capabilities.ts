import { ModelCapability } from '../../types';

export function detectModelCapabilities(modelId: string, rawModelData?: any): {
  capabilities: ModelCapability;
  contextWindow: number;
  maxOutputTokens: number;
  publisher: string;
  family: string;
} {
  const id = modelId.toLowerCase();

  // Determine publisher & family
  let publisher = 'NVIDIA';
  if (id.startsWith('meta/') || id.includes('llama')) publisher = 'Meta';
  else if (id.startsWith('qwen/') || id.includes('qwen')) publisher = 'Qwen';
  else if (id.startsWith('deepseek') || id.includes('deepseek')) publisher = 'DeepSeek';
  else if (id.startsWith('mistral') || id.includes('mistral') || id.includes('mixtral')) publisher = 'Mistral';
  else if (id.startsWith('google/') || id.includes('gemma')) publisher = 'Google';
  else if (id.startsWith('microsoft/') || id.includes('phi')) publisher = 'Microsoft';
  else if (id.startsWith('openai/')) publisher = 'OpenAI';
  else if (id.startsWith('nvidia/')) publisher = 'NVIDIA';

  const family = id.split('/')[1] || id;

  // Determine Vision capability
  const isVision =
    id.includes('vision') ||
    id.includes('vl') ||
    id.includes('vlm') ||
    id.includes('neva') ||
    id.includes('kosmos') ||
    id.includes('fuyu') ||
    id.includes('deplot') ||
    rawModelData?.capabilities?.vision === true;

  // Determine Reasoning capability
  const isReasoning =
    id.includes('r1') ||
    id.includes('reason') ||
    id.includes('nemotron') ||
    id.includes('deepseek-r1') ||
    id.includes('qwq') ||
    rawModelData?.capabilities?.reasoning === true;

  // Determine Code Generation capability
  const isCode =
    id.includes('coder') ||
    id.includes('code') ||
    id.includes('instruct') ||
    id.includes('chat') ||
    id.includes('nemotron') ||
    id.includes('llama') ||
    id.includes('deepseek');

  // Determine Tool Calling capability
  const isToolCalling =
    id.includes('nemotron') ||
    id.includes('llama-3.3') ||
    id.includes('llama-3.1') ||
    id.includes('mistral-large') ||
    id.includes('qwen2.5-72b');

  // Determine Context Window & Max Tokens
  let contextWindow = 128000;
  let maxOutputTokens = 4096;

  if (id.includes('405b') || id.includes('128k') || id.includes('llama-3.1') || id.includes('llama-3.3') || id.includes('qwen2.5')) {
    contextWindow = 131072;
    maxOutputTokens = 8192;
  } else if (id.includes('deepseek')) {
    contextWindow = 65536;
    maxOutputTokens = 8192;
  } else if (id.includes('mistral-large')) {
    contextWindow = 128000;
    maxOutputTokens = 8192;
  } else if (id.includes('gemma') || id.includes('phi')) {
    contextWindow = 8192;
    maxOutputTokens = 4096;
  }

  return {
    capabilities: {
      chat: true,
      completion: true,
      responses: true,
      streaming: true,
      vision: isVision,
      reasoning: isReasoning,
      toolCalling: isToolCalling,
      codeGeneration: isCode,
      structuredOutput: true,
    },
    contextWindow,
    maxOutputTokens,
    publisher,
    family,
  };
}
