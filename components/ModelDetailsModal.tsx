'use client'

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BloomModel } from '@/lib/ai/types';
import { X, Sparkles, Check, Cpu, Zap, ShieldCheck } from 'lucide-react';

interface ModelDetailsModalProps {
  model: BloomModel;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelDetailsModal({ model, isOpen, onClose }: ModelDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className="w-full max-w-md bg-[#161616] border border-white/20 rounded-3xl p-6 sm:p-7 space-y-6 relative overflow-hidden animate-scaleIn font-mono text-white select-none z-10 shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] uppercase tracking-wider font-bold border border-emerald-500/20">
                {model.badge || 'AI'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{model.displayName}</h2>
            </div>
            <p className="text-xs text-zinc-400 font-normal leading-relaxed">{model.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-3 relative z-10">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-400" />
            <span>Model Capabilities</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${model.capabilities.chat ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}>
              <Check size={13} className={model.capabilities.chat ? 'text-emerald-400' : 'text-zinc-600'} />
              <span>Interactive Chat</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${model.capabilities.streaming ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}>
              <Check size={13} className={model.capabilities.streaming ? 'text-emerald-400' : 'text-zinc-600'} />
              <span>Real-Time Stream</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${model.capabilities.codeGeneration ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}>
              <Check size={13} className={model.capabilities.codeGeneration ? 'text-emerald-400' : 'text-zinc-600'} />
              <span>Code Synthesis</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${model.capabilities.reasoning ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}>
              <Check size={13} className={model.capabilities.reasoning ? 'text-emerald-400' : 'text-zinc-600'} />
              <span>Deep Reasoning</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${model.capabilities.vision ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}>
              <Check size={13} className={model.capabilities.vision ? 'text-emerald-400' : 'text-zinc-600'} />
              <span>Multimodal Vision</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${model.capabilities.toolCalling ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}>
              <Check size={13} className={model.capabilities.toolCalling ? 'text-emerald-400' : 'text-zinc-600'} />
              <span>Tool Execution</span>
            </div>
          </div>
        </div>

        {/* Technical Specs & Attribution */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-zinc-300 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Cpu size={12} />
              <span>Inference Engine</span>
            </span>
            <span className="font-semibold text-white">
              {model.provider === 'nvidia' ? 'NVIDIA NIM' : 'OpenRouter Engine'}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-2">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Zap size={12} />
              <span>Context Window</span>
            </span>
            <span className="font-mono text-white">{(model.contextWindow / 1024).toFixed(0)}k tokens</span>
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-2">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck size={12} />
              <span>Underlying Architecture</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px]">{model.canonicalModelId}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-center text-zinc-500 relative z-10">
          Powered by {model.provider === 'nvidia' ? 'NVIDIA NIM Hosted Inference' : 'High-Throughput Router'}
        </div>
      </div>
    </div>,
    document.body
  );
}
