'use client'

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OnSaveContext } from '@/context/OnSaveContext';
import { Sparkles, Save, ChevronLeft, History } from 'lucide-react';
import ModelSelector from '@/components/ModelSelector';
import GenerationHistoryModal from './GenerationHistoryModal';
import { useParams } from 'next/navigation';

interface PlaygroundHeaderProps {
  onUsePrompt?: (prompt: string) => void;
}

function PlaygroundHeader({ onUsePrompt }: PlaygroundHeaderProps) {
  const { onSaveData, setOnSaveData } = useContext(OnSaveContext);
  const [showHistory, setShowHistory] = useState(false);
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  return (
    <>
      <header className="flex justify-between items-center px-4 py-2.5 bg-[#212121] border-b border-white/5 relative z-20 font-mono">
        {/* Left - Back Link & Model Selector */}
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ChevronLeft size={18} />
          </Link>
          
          <div className="flex items-center gap-2 select-none pr-1">
            <Image src="/bloom-logo.svg" alt="Bloom Logo" width={26} height={26} className="rounded-md" />
            <span className="hidden md:inline text-white text-xs font-semibold tracking-tight">Bloom</span>
          </div>

          {/* Model Selector in Header */}
          <ModelSelector compact />
        </div>

        {/* Center - Session Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] text-gray-300 select-none">
          <Sparkles size={11} className="text-yellow-400 animate-pulse" />
          <span>Active Studio Session</span>
        </div>

        {/* Right - History & Save Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition-colors border border-white/10 cursor-pointer select-none"
            title="Generation History"
          >
            <History size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={() => setOnSaveData(Date.now())}
            className="flex items-center gap-2 py-1.5 px-4 bg-white text-black hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors font-mono cursor-pointer select-none"
          >
            <Save size={13} />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Generation History Drawer */}
      <GenerationHistoryModal
        projectId={projectId}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onUsePrompt={onUsePrompt}
      />
    </>
  );
}

export default PlaygroundHeader;