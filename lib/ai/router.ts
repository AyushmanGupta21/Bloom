import { BloomModel, ChatChunk, ChatRequest, ChatResult } from './types';
import { modelRegistry } from './registry';
import { BloomAIError } from './providers/nvidia/errors';

export class AIRouter {
  // NVIDIA NIM is the primary (and only) generation engine. If the selected
  // model is unavailable/deprecated, we fall back to the fast default NVIDIA
  // model rather than an external provider (which requires paid credits and
  // adds latency + failure). This keeps everything on the NVIDIA key.
  private static readonly DEFAULT_FAST_MODEL = 'bloom-reason';

  /**
   * Routes a non-streaming chat request. NVIDIA-only with a same-provider fallback
   * to the fast default model if the requested one is unavailable.
   */
  public static async executeChat(request: ChatRequest): Promise<ChatResult> {
    const { model, provider } = await modelRegistry.findModel(request.model);

    try {
      return await provider.chat(request, model);
    } catch (primaryErr: any) {
      console.warn(`[AIRouter] Provider ${provider.name} failed for ${model.displayName}:`, primaryErr?.message);

      // Same-provider fallback to the fast default NVIDIA model (no external providers).
      const isModelIssue = primaryErr?.code === 'MODEL_UNAVAILABLE';
      if (isModelIssue && model.id !== this.DEFAULT_FAST_MODEL) {
        console.info('[AIRouter] Falling back to fast default NVIDIA model...');
        const fallback = await modelRegistry.findModel(this.DEFAULT_FAST_MODEL);
        return await fallback.provider.chat(request, fallback.model);
      }

      throw primaryErr;
    }
  }

  /**
   * Routes a streaming chat request. NVIDIA-only with a same-provider fallback
   * to the fast default model if the requested one is unavailable.
   */
  public static async *executeStream(request: ChatRequest): AsyncIterable<ChatChunk> {
    const { model, provider } = await modelRegistry.findModel(request.model);

    try {
      yield* provider.streamChat(request, model);
    } catch (primaryErr: any) {
      console.warn(`[AIRouter Stream] Provider ${provider.name} failed for ${model.displayName}:`, primaryErr?.message);

      // Same-provider fallback to the fast default NVIDIA model (no external providers).
      const isModelIssue = primaryErr?.code === 'MODEL_UNAVAILABLE';
      if (isModelIssue && model.id !== this.DEFAULT_FAST_MODEL) {
        console.info('[AIRouter Stream] Falling back to fast default NVIDIA model...');
        const fallback = await modelRegistry.findModel(this.DEFAULT_FAST_MODEL);
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
