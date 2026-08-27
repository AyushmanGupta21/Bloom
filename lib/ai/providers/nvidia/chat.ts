import { AIProvider, BloomModel, ChatChunk, ChatRequest, ChatResult } from '../../types';
import { NvidiaClient } from './client';
import { discoverNvidiaModels } from './models';

export class NvidiaProvider implements AIProvider {
  public id: 'nvidia' = 'nvidia';
  public name: string = 'NVIDIA NIM';
  private client: NvidiaClient;

  constructor(apiKey?: string, baseUrl?: string) {
    this.client = new NvidiaClient(apiKey, baseUrl);
  }

  public isConfigured(): boolean {
    return this.client.isConfigured();
  }

  public async listModels(): Promise<BloomModel[]> {
    return discoverNvidiaModels(this.client);
  }

  public async chat(request: ChatRequest, model: BloomModel): Promise<ChatResult> {
    return this.client.createChatCompletion(request, model.canonicalModelId);
  }

  public async *streamChat(request: ChatRequest, model: BloomModel): AsyncIterable<ChatChunk> {
    yield* this.client.streamChatCompletion(request, model.canonicalModelId);
  }
}
