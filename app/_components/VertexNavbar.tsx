"use client"
import React, { useState, useEffect } from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function VertexNavbar() {
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { label: 'Builder', number: '01', href: '/workspace' },
    { label: 'Features', number: '02', href: '/features' },
    { label: 'Pricing', number: '03', href: '/pricing' }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
            : 'bg-gradient-to-b from-black/60 to-transparent'
        } ${isOpen ? 'h-16 md:h-20 bg-black' : 'h-16 md:h-20'} px-6 sm:px-10 md:px-16 lg:px-20`}
      >
        {/* Left - Bloom Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 select-none group">
          <div className="rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105">
            <Image src="/bloom-logo.svg" alt="Bloom Logo" width={34} height={34} className="block" />
          </div>
          <span className="text-white text-lg font-bold font-mono tracking-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Bloom</span>
        </Link>

        {/* Center - Links (Desktop Only with Liquid Pill Backdrop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 shadow-inner">
          {navLinks.map((link, index) => {
            if (link.label === 'Builder' && !user) {
              return (
                <SignInButton key={index} mode="modal" fallbackRedirectUrl="/workspace">
                  <button className="px-4 py-1.5 text-white/80 hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-all duration-200 cursor-pointer rounded-full hover:bg-white/10">
                    {link.label}
                  </button>
                </SignInButton>
              );
            }
            return (
              <Link
                key={index}
                href={link.href}
                className="px-4 py-1.5 text-white/80 hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-all duration-200 rounded-full hover:bg-white/10"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right - Liquid Glass Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link href="/workspace">
              <button className="px-5 py-2.5 liquid-glass-btn-ghost text-xs uppercase tracking-[0.15em] font-semibold cursor-pointer">
                Workspace
              </button>
            </Link>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
              <button className="px-5 py-2.5 liquid-glass-btn-ghost text-xs uppercase tracking-[0.15em] font-semibold cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          )}

          {user ? (
            <Link href="/workspace">
              <button className="px-5 py-2.5 liquid-glass-btn-solid text-xs uppercase tracking-[0.15em] font-bold cursor-pointer">
                Dashboard
              </button>
            </Link>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
              <button className="px-5 py-2.5 liquid-glass-btn-solid text-xs uppercase tracking-[0.15em] font-bold cursor-pointer">
                Start Building
              </button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Hamburger (Below lg) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 gap-[4.5px] focus:outline-none z-50 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span
            className={`w-5 h-[1.5px] bg-white transition-all duration-300 ease-out origin-center ${
              isOpen ? 'rotate-45 translate-y-[6px]' : ''
            }`}
          />
          <span
            className={`w-5 h-[1.5px] bg-white transition-all duration-300 ease-out origin-center ${
              isOpen ? 'opacity-0 scale-0' : ''
            }`}
          />
          <span
            className={`w-5 h-[1.5px] bg-white transition-all duration-300 ease-out origin-center ${
              isOpen ? '-rotate-45 -translate-y-[6px]' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col justify-between transition-all duration-500 ease-in-out px-6 sm:px-10 pb-12 pt-24 ${
          isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Vertically stacked links */}
        <div className="flex flex-col gap-4 mt-4">
          {navLinks.map((link, index) => {
            if (link.label === 'Builder' && !user) {
              return (
                <div
                  key={index}
                  className={`transition-all duration-500 ease-out transform ${
                    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 60 + 150}ms` }}
                >
                  <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-between py-4 border-b border-white/10 text-white text-2xl sm:text-3xl font-light tracking-tight hover:text-white/80 transition-colors text-left cursor-pointer"
                    >
                      <span>{link.label}</span>
                      <span className="text-white/40 text-xs tracking-widest font-mono">{link.number}</span>
                    </button>
                  </SignInButton>
                </div>
              );
            }
            return (
              <div
                key={index}
                className={`transition-all duration-500 ease-out transform ${
                  isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 60 + 150}ms` }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-white/10 text-white text-2xl sm:text-3xl font-light tracking-tight hover:text-white/80 transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-white/40 text-xs tracking-widest font-mono">{link.number}</span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col gap-3 mt-8 transition-all duration-500 ease-out transform ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {user ? (
            <Link href="/workspace" onClick={() => setIsOpen(false)} className="w-full">
              <button className="w-full py-4 liquid-glass-btn-ghost text-xs uppercase tracking-[0.15em] font-semibold cursor-pointer">
                Workspace
              </button>
            </Link>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
              <button className="w-full py-4 liquid-glass-btn-ghost text-xs uppercase tracking-[0.15em] font-semibold cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          )}

          {user ? (
            <Link href="/workspace" onClick={() => setIsOpen(false)} className="w-full">
              <button className="w-full py-4 liquid-glass-btn-solid text-xs uppercase tracking-[0.15em] font-bold cursor-pointer">
                Dashboard
              </button>
            </Link>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/workspace">
              <button className="w-full py-4 liquid-glass-btn-solid text-xs uppercase tracking-[0.15em] font-bold cursor-pointer">
                Start Building
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </>
  );
}
