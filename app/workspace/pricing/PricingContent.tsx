'use client'
import React from 'react';
import { PricingTable } from '@clerk/nextjs';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PricingContent() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-60px)] bg-[#212121] flex flex-col items-center justify-center p-6 md:p-12 font-mono select-none overflow-y-auto">
      
      {/* Back button */}
      <div className="w-full max-w-5xl mb-6">
        <Link href="/workspace" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Pricing Header Card using Liquid Glass */}
      <div className="w-full max-w-5xl liquid-glass-card p-8 mb-10 space-y-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-white relative z-10">
          <Sparkles size={18} className="text-yellow-400 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Bloom Plans & Credits</h2>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed font-light font-mono max-w-2xl relative z-10">
          Each design session uses 1 credit to generate your initial website. Upgrade to the Pro plan for unlimited credits, direct HTML export, and priority processing queues.
        </p>
      </div>

      {/* Clerk Pricing Table wrapped in custom dark-theme appearance overrides */}
      <div className="w-full max-w-5xl flex justify-center items-center font-mono">
        <PricingTable 
          appearance={{
            variables: {
              colorBackground: '#2f2f2f',
              colorPrimary: '#ffffff',
              colorPrimaryForeground: '#000000',
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace'
            },
            elements: {
              card: 'bg-[#2f2f2f] border border-white/10 text-white rounded-2xl shadow-2xl font-mono',
              cardHeading: 'text-white font-mono',
              button: 'font-mono transition-all duration-200',
              badge: 'font-mono uppercase text-[9px] tracking-wider font-bold'
            }
          }}
        />
      </div>

    </div>
  );
}
