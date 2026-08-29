"use client"
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Sparkles, ArrowRight, Loader2, LayoutDashboard, User, ShoppingBag, LogIn } from 'lucide-react';
import LiquidGlassHero from '@/components/LiquidGlassHero';

const presets = [
  {
    label: 'SaaS Dashboard',
    prompt: 'Create an analytics dashboard to track SaaS revenue and customers.',
    icon: LayoutDashboard
  },
  {
    label: 'Design Portfolio',
    prompt: 'Create a dark, minimal portfolio website for a creative UI designer.',
    icon: User
  },
  {
    label: 'E-commerce Shop',
    prompt: 'Create a clean e-commerce landing page with product cards and filters.',
    icon: ShoppingBag
  },
  {
    label: 'SignUp Form',
    prompt: 'Create a modern sign up form with email, password, and social logins.',
    icon: LogIn
  }
];

export default function VertexHero() {
  const { user } = useUser();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    // Store in sessionStorage so workspace mounts can pick it up
    sessionStorage.setItem('pendingProjectInput', input);

    if (user) {
      router.push('/workspace');
    }
  };

  const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4";

  return (
    <section className="relative w-full min-h-screen lg:h-screen overflow-hidden bg-black select-none flex flex-col justify-end pt-24 pb-12 md:pb-16 lg:pb-20">
      {/* Full-Screen WebGL Snell Refraction Liquid Glass Engine */}
      <LiquidGlassHero cardRef={cardRef} videoSrc={videoUrl} />

      {/* Layer 2: Seamless Continuous Radial Vignette (No hard vertical lines or seams across cards) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[4]"
        style={{
          background: 'radial-gradient(ellipse 70% 80% at 15% 65%, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0) 80%)'
        }}
      />
      <div 
        className="absolute inset-x-0 bottom-0 h-36 pointer-events-none z-[4]"
        style={{
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%)'
        }}
      />

      {/* Layer 3: Interactive Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-end">

        {/* LEFT COLUMN: Headings & Stats */}
        <div className="flex flex-col gap-5 lg:pb-2 max-w-xl">
          {/* Liquid Glass Badge */}
          <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full liquid-glass-pill animate-hero-label">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white text-[11px] sm:text-xs tracking-[0.22em] uppercase font-bold font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              AI-Powered Builder &bull; By Bloom
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] leading-[0.92] tracking-[-0.04em] uppercase animate-hero-title hero-headline font-mono">
            Instant
            <br />
            AI Website
            <br />
            Generation
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-zinc-100 text-[11px] sm:text-xs tracking-wider uppercase font-semibold font-mono hero-subhead animate-hero-meta">
            <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/15">
              Version: v1.0.4
            </span>
            <span className="w-6 h-[1px] bg-white/40 inline-block animate-hero-divider" />
            <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/15">
              No-Code Friendly
            </span>
          </div>

          {/* Key Metrics */}
          <div className="flex items-end gap-5 sm:gap-8 mt-2 p-4 sm:p-5 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)] self-start">
            <div className="flex flex-col gap-0.5 animate-hero-stat-1">
              <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">0.4s</span>
              <span className="text-zinc-300 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Gen. Speed</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="flex flex-col gap-0.5 animate-hero-stat-2">
              <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">100%</span>
              <span className="text-zinc-300 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Responsive</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="flex flex-col gap-0.5 animate-hero-stat-3">
              <span className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">x10</span>
              <span className="text-zinc-300 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Efficiency</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Liquid Glass AI Chatbox & Preset Carousel */}
        <div className="flex flex-col gap-5 w-full lg:max-w-xl animate-hero-description">

          {/* Liquid Glass Form Positioned Over WebGL Lens */}
          <div
            ref={cardRef}
            className="w-full rounded-2xl md:rounded-3xl p-6 sm:p-7 space-y-4 font-mono select-none"
            style={{
              background: 'transparent',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 select-none border-b border-white/25 pb-3">
              <div className="p-1.5 rounded-lg bg-white/15 border border-white/25 backdrop-blur-md shadow-sm">
                <Sparkles size={15} className="text-white animate-pulse" />
              </div>
              <span className="text-xs text-white uppercase tracking-wider font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                Bloom Copilot
              </span>
            </div>

            {/* Description */}
            <p className="text-white text-xs sm:text-[13px] leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Describe the website of your dreams and watch Bloom build, customize, and deploy it instantly.
            </p>

            {/* Prompt Input Textarea */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g., build a minimalist portfolio website with black and white theme..."
                rows={3}
                className="w-full focus:outline-none focus:ring-1 focus:ring-white/60 resize-none rounded-xl p-3.5 text-xs sm:text-[13px] text-white placeholder:text-white/60 font-mono transition-all duration-200 shadow-inner"
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* CTA Button with Solid High-Contrast White Surface */}
            <div className="w-full pt-1">
              {user ? (
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-white text-black hover:bg-zinc-100 disabled:bg-white disabled:opacity-90 text-xs uppercase tracking-[0.18em] font-extrabold rounded-xl transition-all duration-200 cursor-pointer select-none font-mono shadow-[0_10px_25px_rgba(0,0,0,0.5)] active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin text-black" />
                  ) : (
                    <>
                      <span className="text-black font-extrabold">Generate Website</span>
                      <ArrowRight size={15} className="text-black" />
                    </>
                  )}
                </button>
              ) : (
                <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-white text-black hover:bg-zinc-100 text-xs uppercase tracking-[0.18em] font-extrabold rounded-xl transition-all duration-200 cursor-pointer select-none font-mono shadow-[0_10px_25px_rgba(0,0,0,0.5)] active:scale-[0.99]"
                  >
                    <span className="text-black font-extrabold">Sign In to Build</span>
                    <ArrowRight size={15} className="text-black" />
                  </button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* Quick Presets with Distinct Liquid Glass Buttons */}
          <div className="w-full space-y-2.5">
            <span className="text-[11px] text-white/85 uppercase tracking-widest font-bold font-mono pl-1 select-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              {presets.map((preset, index) => {
                const PresetIcon = preset.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setInput(preset.prompt)}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 liquid-glass-preset-btn text-[10.5px] sm:text-[11px] font-medium cursor-pointer text-center w-full"
                  >
                    <PresetIcon size={12} className="text-white/80 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
