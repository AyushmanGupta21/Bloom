'use client'

import React, { useEffect, useState } from 'react';
import { X, History, Sparkles, Clock, Zap, Copy, Check, ArrowUpRight, Cpu } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationHistoryModalProps {
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt?: (prompt: string) => void;
}

export default function GenerationHistoryModal({
  projectId,
  isOpen,
  onClose,
  onUsePrompt,
}: GenerationHistoryModalProps) {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchGenerations();
    }
  }, [isOpen, projectId]);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const url = projectId ? `/api/ai/generations?projectId=${projectId}` : '/api/ai/generations';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGenerations(data.generations || []);
      }
    } catch (err) {
      console.error('Failed to fetch generations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-full max-w-md h-full bg-[#181818] border-l border-white/10 p-6 flex flex-col justify-between relative z-10 font-mono text-white select-none animate-slideLeft shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <History size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Generation History</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              Loading generation history...
            </div>
          ) : generations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Sparkles size={24} className="text-zinc-600 animate-pulse" />
              <p className="text-xs text-zinc-400">No generations recorded for this project yet.</p>
              <p className="text-[10px] text-zinc-600">Every prompt and output is automatically persisted.</p>
            </div>
          ) : (
            generations.map((gen) => {
              const isCopied = copiedId === gen.generationId;
              const dateStr = gen.createdOn ? new Date(gen.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div 
                  key={gen.generationId}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2.5 text-xs"
                >
                  {/* Top row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                        {gen.displayName || gen.modelId}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${gen.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                        {gen.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{dateStr}</span>
                  </div>

                  {/* Prompt */}
                  <p className="text-zinc-300 text-[11px] leading-relaxed line-clamp-3 bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono">
                    {gen.prompt}
                  </p>

                  {/* Metadata footer */}
                  <div className="flex justify-between items-center pt-1 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-3">
                      {gen.durationMs && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{(gen.durationMs / 1000).toFixed(1)}s</span>
                        </span>
                      )}
                      {gen.totalTokens && (
                        <span className="flex items-center gap-1">
                          <Zap size={10} />
                          <span>{gen.totalTokens} tokens</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyPrompt(gen.prompt, gen.generationId)}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                        title="Copy Prompt"
                      >
                        {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                      {onUsePrompt && (
                        <button
                          onClick={() => {
                            onUsePrompt(gen.prompt);
                            onClose();
                          }}
                          className="px-2 py-1 bg-white text-black hover:bg-zinc-200 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors flex items-center gap-1"
                          title="Use this prompt"
                        >
                          <span>Use</span>
                          <ArrowUpRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 text-[10px] text-zinc-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Cpu size={11} className="text-emerald-400" />
            <span>NVIDIA NIM Logging</span>
          </span>
          <span>{generations.length} total logs</span>
        </div>
      </div>
    </div>
  );
}
