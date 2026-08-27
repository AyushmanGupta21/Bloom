'use client'

import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';

interface HeroLiquidGlassCardProps {
  input: string;
  setInput: (v: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  user: any;
}

export default function HeroLiquidGlassCard({
  input,
  setInput,
  handleSubmit,
  loading,
  user,
}: HeroLiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 });
      }}
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.4),
          inset 0 1px 1px 0 rgba(255, 255, 255, 0.45),
          inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25),
          0 0 20px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Dynamic Specular Liquid Rim Reflection that tracks mouse cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl md:rounded-3xl"
        style={{
          opacity: isHovered ? 1 : 0.6,
          background: `
            radial-gradient(
              600px circle at ${mousePos.x}% ${mousePos.y}%,
              rgba(255, 255, 255, 0.15),
              transparent 45%
            )
          `,
        }}
      />

      {/* Top Gloss Highlight Edge */}
      <div 
        className="absolute top-0 inset-x-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.6) 50%, transparent 95%)'
        }}
      />

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-6 sm:p-7 space-y-4 font-mono select-none"
      >
        {/* Header */}
        <div className="flex items-center gap-2 select-none border-b border-white/15 pb-3">
          <div className="p-1 rounded-md bg-white/10 border border-white/20">
            <Sparkles size={14} className="text-white animate-pulse" />
          </div>
          <span className="text-xs text-white uppercase tracking-wider font-bold">
            Bloom Copilot
          </span>
        </div>

        {/* Description */}
        <p className="text-white/90 text-xs sm:text-[13px] leading-relaxed font-medium drop-shadow-sm">
          Describe the website of your dreams and watch Bloom build, customize, and deploy it instantly.
        </p>

        {/* Translucent Glass Textarea */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., build a minimalist portfolio website with black and white theme..."
            rows={3}
            className="w-full focus:outline-none focus:ring-1 focus:ring-white/50 resize-none rounded-xl p-3.5 text-xs sm:text-[13px] text-white placeholder:text-white/50 font-mono transition-all duration-200"
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          />
        </div>

        {/* CTA Button */}
        <div className="w-full pt-1">
          {user ? (
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white text-black hover:bg-zinc-200 disabled:bg-white/20 disabled:text-white/40 text-xs uppercase tracking-[0.15em] font-bold rounded-xl transition-all duration-200 cursor-pointer select-none font-mono shadow-lg hover:shadow-xl active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Generate Website</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-[0.15em] font-bold rounded-xl transition-all duration-200 cursor-pointer select-none font-mono shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                <span>Sign In to Build</span>
                <ArrowRight size={14} />
              </button>
            </SignInButton>
          )}
        </div>
      </form>
    </div>
  );
}
