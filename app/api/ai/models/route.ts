import { NextResponse } from 'next/server';
import { modelRegistry } from '@/lib/ai/registry';

export async function GET() {
  try {
    const models = await modelRegistry.getAllModels();
    const defaultModel = models.find((m) => m.isDefault) || models[0];

    return NextResponse.json({
      models,
      defaultModelId: defaultModel?.id || 'bloom-reason',
      providers: {
        nvidia: modelRegistry.getNvidiaProvider().isConfigured(),
        openrouter: modelRegistry.getOpenRouterProvider().isConfigured(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/ai/models] Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve AI models catalog', details: error?.message },
      { status: 500 }
    );
  }
}
