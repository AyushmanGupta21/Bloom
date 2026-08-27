import { BloomModel } from '../../types';
import { NvidiaClient } from './client';
import { getCuratedNvidiaModels, mapNvidiaToBloomModel } from './naming';

interface CachedModels {
  timestamp: number;
  models: BloomModel[];
}

let cachedDiscovery: CachedModels | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Discovers available models from NVIDIA NIM /v1/models endpoint dynamically
 * and normalizes them into BloomModel objects.
 */
export async function discoverNvidiaModels(client?: NvidiaClient): Promise<BloomModel[]> {
  const now = Date.now();

  // Return cached models if still fresh
  if (cachedDiscovery && now - cachedDiscovery.timestamp < CACHE_TTL_MS && cachedDiscovery.models.length > 0) {
    return cachedDiscovery.models;
  }

  const nvidiaClient = client || new NvidiaClient();

  if (!nvidiaClient.isConfigured()) {
    // Return curated list if API key is not yet set
    return getCuratedNvidiaModels();
  }

  try {
    const rawModels = await nvidiaClient.getModels();

    if (!rawModels || rawModels.length === 0) {
      return getCuratedNvidiaModels();
    }

    const normalizedMap = new Map<string, BloomModel>();

    // First populate curated models to guarantee clean IDs and default flags
    for (const curated of getCuratedNvidiaModels()) {
      normalizedMap.set(curated.id, curated);
    }

    // Then merge newly discovered models from the live endpoint
    for (const raw of rawModels) {
      const canonicalId = raw.id;
      if (!canonicalId) continue;

      const bloomModel = mapNvidiaToBloomModel(canonicalId, raw);
      if (!normalizedMap.has(bloomModel.id)) {
        normalizedMap.set(bloomModel.id, bloomModel);
      }
    }

    const result = Array.from(normalizedMap.values());

    cachedDiscovery = {
      timestamp: now,
      models: result,
    };

    return result;
  } catch (err) {
    console.error('[NVIDIA Discovery] Failed to fetch live models from NVIDIA NIM, using curated catalog:', err);
    return getCuratedNvidiaModels();
  }
}

/**
 * Finds a specific BloomModel by its Bloom ID or canonical ID
 */
export async function findNvidiaModel(modelIdOrCanonical: string, client?: NvidiaClient): Promise<BloomModel | undefined> {
  const models = await discoverNvidiaModels(client);
  const normalizedSearch = modelIdOrCanonical.trim().toLowerCase();

  return models.find(
    (m) =>
      m.id.toLowerCase() === normalizedSearch ||
      m.canonicalModelId.toLowerCase() === normalizedSearch ||
      m.displayName.toLowerCase() === normalizedSearch
  );
}
