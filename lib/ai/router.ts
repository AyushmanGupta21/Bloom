import { BloomModel, ChatChunk, ChatRequest, ChatResult } from './types';
import { modelRegistry } from './registry';
import { BloomAIError } from './providers/nvidia/errors';

export class AIRouter {
  /**
   * Routes a non-streaming chat request with automatic fallback
   */
  public static async executeChat(request: ChatRequest): Promise<ChatResult> {
    const { model, provider } = await modelRegistry.findModel(request.model);

    try {
      return await provider.chat(request, model);
    } catch (primaryErr: any) {
      console.warn(`[AIRouter] Primary provider ${provider.name} failed for ${model.displayName}:`, primaryErr?.message);

      // Attempt graceful fallback if primary provider was NVIDIA and failed with a retryable or unavailability error
      if (provider.id === 'nvidia' && modelRegistry.getOpenRouterProvider().isConfigured()) {
        console.info('[AIRouter] Attempting automatic failover to OpenRouter fallback...');
        const fallback = await modelRegistry.findModel('bloom-gpt4o');
        return await fallback.provider.chat(request, fallback.model);
      }

      throw primaryErr;
    }
  }

  /**
   * Routes a streaming chat request with automatic fallback
   */
  public static async *executeStream(request: ChatRequest): AsyncIterable<ChatChunk> {
    const { model, provider } = await modelRegistry.findModel(request.model);

    try {
      yield* provider.streamChat(request, model);
    } catch (primaryErr: any) {
      console.warn(`[AIRouter Stream] Provider ${provider.name} failed for ${model.displayName}:`, primaryErr?.message);

      if (provider.id === 'nvidia' && modelRegistry.getOpenRouterProvider().isConfigured()) {
        console.info('[AIRouter Stream] Attempting automatic failover stream to OpenRouter fallback...');
        const fallback = await modelRegistry.findModel('bloom-gpt4o');
        yield* fallback.provider.streamChat(request, fallback.model);
        return;
      }

      throw primaryErr;
    }
  }

  /**
   * Returns current active model metadata for a given model ID
   */
  public static async getModelDetails(modelId?: string): Promise<BloomModel> {
    const { model } = await modelRegistry.findModel(modelId);
    return model;
  }
}
