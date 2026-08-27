'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BloomModel } from '@/lib/ai/types';
import { getCuratedNvidiaModels } from '@/lib/ai/providers/nvidia/naming';

interface ModelContextType {
  models: BloomModel[];
  selectedModel: BloomModel;
  setSelectedModel: (model: BloomModel) => void;
  setSelectedModelById: (modelId: string) => void;
  isLoading: boolean;
  refreshModels: () => Promise<void>;
}

const defaultModels = getCuratedNvidiaModels();
const initialDefaultModel = defaultModels.find((m) => m.isDefault) || defaultModels[0];

export const ModelContext = createContext<ModelContextType>({
  models: defaultModels,
  selectedModel: initialDefaultModel,
  setSelectedModel: () => {},
  setSelectedModelById: () => {},
  isLoading: false,
  refreshModels: async () => {},
});

const STORAGE_KEY = 'bloom_selected_model_id';

export function ModelProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<BloomModel[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState<BloomModel>(initialDefaultModel);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ai/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);

          // Check if previously saved selection exists in localStorage
          const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
          if (savedId) {
            const found = data.models.find((m: BloomModel) => m.id === savedId);
            if (found) {
              setSelectedModel(found);
              return;
            }
          }

          // Otherwise use server default
          const defaultFound = data.models.find((m: BloomModel) => m.id === data.defaultModelId) || data.models[0];
          setSelectedModel(defaultFound);
        }
      }
    } catch (err) {
      console.error('[ModelContext] Error fetching dynamic models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = defaultModels.find((m) => m.id === savedId || m.canonicalModelId === savedId);
        if (found) {
          setSelectedModel(found);
        }
      }
    }
    fetchModels();
  }, []);

  const handleSelectModel = (model: BloomModel) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, model.id);
    }
  };

  const handleSelectModelById = (modelId: string) => {
    const found = models.find((m) => m.id === modelId || m.canonicalModelId === modelId);
    if (found) {
      handleSelectModel(found);
    }
  };

  return (
    <ModelContext.Provider
      value={{
        models,
        selectedModel,
        setSelectedModel: handleSelectModel,
        setSelectedModelById: handleSelectModelById,
        isLoading,
        refreshModels: fetchModels,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useBloomModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useBloomModel must be used within a ModelProvider');
  }
  return context;
}
