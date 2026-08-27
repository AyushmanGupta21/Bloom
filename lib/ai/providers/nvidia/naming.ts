import { BloomModel } from '../../types';
import { detectModelCapabilities } from './capabilities';

// Curated canonical mapping for standard high-tier models
interface KnownModelConfig {
  bloomId: string;
  displayName: string;
  shortName: string;
  description: string;
  badge: string;
  isDefault?: boolean;
  pricingTier?: 'free' | 'pro';
}

const KNOWN_NVIDIA_MODELS: Record<string, KnownModelConfig> = {
  'deepseek-ai/deepseek-v4-pro-0813': {
    bloomId: 'bloom-reason',
    displayName: 'Bloom Reason',
    shortName: 'Reason',
    description: 'DeepSeek V4 Pro model for high-accuracy HTML, Tailwind CSS, and Flowbite synthesis.',
    badge: '◈ Pro',
    isDefault: true,
    pricingTier: 'free',
  },
  'deepseek-ai/deepseek-v4-flash-0731': {
    bloomId: 'bloom-swift',
    displayName: 'Bloom Swift',
    shortName: 'Swift',
    description: 'Ultra-fast DeepSeek V4 Flash generation engine for instant prototyping and rapid iterations.',
    badge: '⚡ Fast',
    pricingTier: 'free',
  },
  'meta/llama-3.2-11b-vision-instruct': {
    bloomId: 'bloom-vision',
    displayName: 'Bloom Vision',
    shortName: 'Vision',
    description: 'Multimodal vision model for analyzing screenshot mockups and image asset layouts.',
    badge: '◉ Vision',
    pricingTier: 'pro',
  },
  'meta/llama-3.2-90b-vision-instruct': {
    bloomId: 'bloom-max',
    displayName: 'Bloom Max',
    shortName: 'Max',
    description: 'High-capacity 90B vision model for complex web applications and rich interactive components.',
    badge: '✦ Max',
    pricingTier: 'pro',
  },
  'mistralai/mistral-nemotron': {
    bloomId: 'bloom-studio',
    displayName: 'Bloom Studio',
    shortName: 'Studio',
    description: 'Creative design specialist with distinct aesthetic variety and layout depth.',
    badge: '🎨 Studio',
    pricingTier: 'free',
  },
};

/**
 * Normalizes a raw NVIDIA model ID into a deterministic BloomModel
 */
export function mapNvidiaToBloomModel(canonicalId: string, rawData?: any): BloomModel {
  const normalizedKey = canonicalId.trim().toLowerCase();
  
  // Check direct exact match or fuzzy match in curated map
  for (const [key, config] of Object.entries(KNOWN_NVIDIA_MODELS)) {
    if (normalizedKey === key.toLowerCase() || normalizedKey.endsWith(key.toLowerCase()) || key.toLowerCase().endsWith(normalizedKey)) {
      const { capabilities, contextWindow, maxOutputTokens, publisher, family } = detectModelCapabilities(canonicalId, rawData);
      return {
        id: config.bloomId,
        canonicalModelId: canonicalId,
        displayName: config.displayName,
        shortName: config.shortName,
        description: config.description,
        badge: config.badge,
        provider: 'nvidia',
        publisher,
        family,
        capabilities,
        contextWindow,
        maxOutputTokens,
        isDefault: config.isDefault,
        pricingTier: config.pricingTier || 'free',
      };
    }
  }

  // Fallback deterministic naming for any other dynamically discovered NVIDIA model
  const { capabilities, contextWindow, maxOutputTokens, publisher, family } = detectModelCapabilities(canonicalId, rawData);
  
  // Generate deterministic Bloom name based on family / size
  let derivedName = 'Bloom ' + family.split('-')[0].charAt(0).toUpperCase() + family.split('-')[0].slice(1);
  if (capabilities.reasoning) derivedName = `Bloom Reason (${publisher})`;
  else if (capabilities.vision) derivedName = `Bloom Vision (${publisher})`;
  else if (capabilities.codeGeneration) derivedName = `Bloom Code (${publisher})`;

  const slug = 'bloom-' + canonicalId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  return {
    id: slug,
    canonicalModelId: canonicalId,
    displayName: derivedName,
    shortName: derivedName.replace('Bloom ', ''),
    description: `Dynamic NVIDIA NIM model (${canonicalId}) powered by ${publisher}.`,
    badge: capabilities.vision ? '◉ Vision' : capabilities.reasoning ? '◈ Deep' : '⚡ AI',
    provider: 'nvidia',
    publisher,
    family,
    capabilities,
    contextWindow,
    maxOutputTokens,
    pricingTier: contextWindow > 64000 ? 'pro' : 'free',
  };
}

/**
 * Returns default curated models if dynamic discovery is offline or unconfigured
 */
export function getCuratedNvidiaModels(): BloomModel[] {
  return Object.entries(KNOWN_NVIDIA_MODELS).map(([canonicalId]) => mapNvidiaToBloomModel(canonicalId));
}
