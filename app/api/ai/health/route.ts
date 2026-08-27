import { NextResponse } from 'next/server';
import { modelRegistry } from '@/lib/ai/registry';

export async function GET() {
  const nvidia = modelRegistry.getNvidiaProvider();
  const openrouter = modelRegistry.getOpenRouterProvider();

  return NextResponse.json({
    status: 'ok',
    providers: {
      nvidia: {
        configured: nvidia.isConfigured(),
        endpoint: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      },
      openrouter: {
        configured: openrouter.isConfigured(),
      },
    },
    timestamp: new Date().toISOString(),
  });
}
