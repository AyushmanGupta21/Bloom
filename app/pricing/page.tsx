"use client"
import React from 'react';
import { JetBrains_Mono } from 'next/font/google';
import VertexNavbar from '../_components/VertexNavbar';
import { SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Check, ArrowRight, Sparkles } from 'lucide-react';

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
});

export default function PublicPricingPage() {
  const { user } = useUser();

  return (
    <main className={`${jetbrainsMono.className} min-h-screen w-full bg-black text-white font-mono antialiased overflow-x-hidden flex flex-col justify-between`}>
      <VertexNavbar />

      {/* Main Pricing Content */}
      <section className="w-full pt-32 pb-24 px-6 sm:px-10 md:px-16 lg:px-20 bg-gradient-to-b from-black via-zinc-950 to-black flex-grow flex items-center">
        <div className="max-w-5xl mx-auto space-y-16 w-full">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill">
              <Sparkles size={13} className="text-white animate-pulse" />
              <span className="text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] font-bold">
                Pricing Plans
              </span>
            </div>
            <h1 className="text-white font-extrabold text-4xl sm:text-5xl uppercase tracking-tight font-mono">
              Simple, Transparent Tiering
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal">
              Upgrade your workflow with unlimited generations, priority execution queues, and clean source exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Free Tier Card (Liquid Glass Standard) */}
            <div className="liquid-glass-card p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">Free Tier</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white text-4xl font-extrabold font-mono">$0</span>
                    <span className="text-zinc-400 text-xs font-medium">/ forever</span>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs sm:text-[13px] leading-relaxed font-normal">
                  Perfect for testing Bloom's builder capabilities and starting your first design session.
                </p>

                <div className="w-full h-[1px] bg-white/10" />

                <ul className="space-y-3.5 text-xs sm:text-[13px] text-zinc-200 font-normal">
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white/10 text-white">
                      <Check size={12} />
                    </div>
                    <span>2 free generation credits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white/10 text-white">
                      <Check size={12} />
                    </div>
                    <span>Flowbite UI components</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white/10 text-white">
                      <Check size={12} />
                    </div>
                    <span>Live preview editor</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                {user ? (
                  <Link href="/workspace" className="w-full block font-mono">
                    <button className="w-full py-4 liquid-glass-btn-ghost text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer">
                      Go to Workspace
                    </button>
                  </Link>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
                    <button className="w-full py-4 liquid-glass-btn-ghost text-xs uppercase tracking-[0.18em] font-semibold cursor-pointer">
                      Get Started
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>

            {/* Pro Tier Card (Liquid Glass Featured) */}
            <div className="liquid-glass-card-featured p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-white text-black text-[10px] font-extrabold uppercase tracking-wider rounded-bl-xl font-mono shadow-md">
                Popular
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-white text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 font-mono">
                    <Zap size={13} className="text-yellow-400 fill-yellow-400" />
                    <span>Pro Tier</span>
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white text-4xl font-extrabold font-mono">$1.01</span>
                    <span className="text-zinc-300 text-xs font-medium">/ monthly</span>
                  </div>
                </div>

                <p className="text-zinc-200 text-xs sm:text-[13px] leading-relaxed font-normal">
                  Tailored for creators, developers, and teams needing continuous, high-volume development capability.
                </p>

                <div className="w-full h-[1px] bg-white/15" />

                <ul className="space-y-3.5 text-xs sm:text-[13px] text-white font-normal">
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white text-black">
                      <Check size={12} />
                    </div>
                    <span className="font-semibold">Unlimited design credits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white text-black">
                      <Check size={12} />
                    </div>
                    <span>Complete HTML / CSS export</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white text-black">
                      <Check size={12} />
                    </div>
                    <span>Priority queue LLM execution</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1 rounded-md bg-white text-black">
                      <Check size={12} />
                    </div>
                    <span>Advanced charts & Swiper sliders</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10 font-mono">
                {user ? (
                  <Link href="/workspace/pricing" className="w-full block">
                    <button className="w-full py-4 liquid-glass-btn-solid text-xs uppercase tracking-[0.18em] font-bold cursor-pointer flex items-center justify-center gap-2">
                      <span>Upgrade Plan</span>
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/workspace/pricing">
                    <button className="w-full py-4 liquid-glass-btn-solid text-xs uppercase tracking-[0.18em] font-bold cursor-pointer flex items-center justify-center gap-2">
                      <span>Upgrade Plan</span>
                      <ArrowRight size={14} />
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 sm:px-10 md:px-16 lg:px-20 border-t border-white/10 bg-black flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-white/60 text-xs select-none font-mono">
          <Image src="/logo.svg" alt="Bloom Logo" width={20} height={20} className="rounded-md opacity-80" />
          <span>&copy; {new Date().getFullYear()} Bloom AI. All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-white/50 text-[10px] uppercase tracking-wider font-mono">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  );
}
