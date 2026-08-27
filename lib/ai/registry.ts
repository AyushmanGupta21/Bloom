import { AIProvider, BloomModel } from './types';
import { NvidiaProvider } from './providers/nvidia/chat';
import { OpenRouterProvider } from './providers/openrouter/client';

class AIModelRegistry {
  private nvidiaProvider: NvidiaProvider;
  private openRouterProvider: OpenRouterProvider;

  constructor() {
    this.nvidiaProvider = new NvidiaProvider();
    this.openRouterProvider = new OpenRouterProvider();
  }

  public getNvidiaProvider(): NvidiaProvider {
    return this.nvidiaProvider;
  }

  public getOpenRouterProvider(): OpenRouterProvider {
    return this.openRouterProvider;
  }

  /**
   * Retrieves all available Bloom models across configured providers
   */
  public async getAllModels(): Promise<BloomModel[]> {
    const nvidiaModels = await this.nvidiaProvider.listModels();
    const openRouterModels = await this.openRouterProvider.listModels();

    // Prioritize NVIDIA NIM models
    return [...nvidiaModels, ...openRouterModels];
  }

  /**
   * Finds a model by its Bloom ID (e.g. 'bloom-reason') or canonical ID
   */
  public async findModel(modelIdOrCanonical?: string): Promise<{ model: BloomModel; provider: AIProvider }> {
    const allModels = await this.getAllModels();

    if (!modelIdOrCanonical) {
      // Default to Bloom Reason (Nemotron 70B) or first available default
      const defaultModel = allModels.find((m) => m.isDefault) || allModels[0];
      const provider = defaultModel.provider === 'nvidia' ? this.nvidiaProvider : this.openRouterProvider;
      return { model: defaultModel, provider };
    }

    const search = modelIdOrCanonical.trim().toLowerCase();
    const found = allModels.find(
      (m) =>
        m.id.toLowerCase() === search ||
        m.canonicalModelId.toLowerCase() === search ||
        m.displayName.toLowerCase() === search ||
        m.shortName.toLowerCase() === search
    );

    if (found) {
      const provider = found.provider === 'nvidia' ? this.nvidiaProvider : this.openRouterProvider;
      return { model: found, provider };
    }

    // If not found in normalized list, dynamically wrap it as an NVIDIA model
    const fallbackNvidia = allModels.find((m) => m.provider === 'nvidia') || allModels[0];
    return {
      model: {
        ...fallbackNvidia,
        id: modelIdOrCanonical,
        canonicalModelId: modelIdOrCanonical,
        displayName: `Bloom (${modelIdOrCanonical})`,
      },
      provider: this.nvidiaProvider,
    };
  }
}

export const modelRegistry = new AIModelRegistry();
