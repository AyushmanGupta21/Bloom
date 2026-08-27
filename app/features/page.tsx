"use client"
import React from 'react';
import { JetBrains_Mono } from 'next/font/google';
import VertexNavbar from '../_components/VertexNavbar';
import { Cpu, Edit3, Code2, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
});

const features = [
  {
    title: 'Generative AI Engine',
    desc: 'Transforms your natural language descriptions into clean, production-ready HTML code styled with Tailwind CSS.',
    icon: Cpu,
    tag: 'LLM Core'
  },
  {
    title: 'Interactive Editor',
    desc: 'Click on any element in the live preview panel to customize typography, spacing, colors, and content in real-time.',
    icon: Edit3,
    tag: 'Live DOM'
  },
  {
    title: 'Source Code Export',
    desc: 'Unlock and download your generated codebase instantly. Export standard code files ready for local integration.',
    icon: Code2,
    tag: 'Export'
  },
  {
    title: 'Fluid Responsiveness',
    desc: 'Every block, layout, and component built is natively optimized for mobile, tablet, and desktop screens.',
    icon: Sparkles,
    tag: 'Design'
  }
];

export default function FeaturesPage() {
  return (
    <main className={`${jetbrainsMono.className} min-h-screen w-full bg-black text-white font-mono antialiased overflow-x-hidden flex flex-col justify-between`}>
      <VertexNavbar />

      {/* Main Features Content */}
      <section className="w-full pt-32 pb-24 px-6 sm:px-10 md:px-16 lg:px-20 bg-gradient-to-b from-black via-zinc-950 to-black flex-grow flex items-center">
        <div className="max-w-6xl mx-auto space-y-16 w-full">
          
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill">
              <Zap size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] sm:text-xs text-white uppercase tracking-[0.2em] font-bold">
                Engine Capabilities
              </span>
            </div>
            <h1 className="text-white font-extrabold text-4xl sm:text-5xl uppercase tracking-tight font-mono">
              How Bloom Works
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal">
              Explore the key technological components driving Bloom's real-time generative browser design engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  className="liquid-glass-card p-8 flex flex-col justify-between relative group overflow-hidden"
                >
                  {/* Subtle specular corner glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.08] transition-all duration-500" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <FeatureIcon size={22} className="text-white" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                        {feature.tag}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <h3 className="text-white text-base font-bold uppercase tracking-wider font-mono">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-300 text-xs sm:text-[13px] leading-relaxed font-normal">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
