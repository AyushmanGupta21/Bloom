'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBloomModel } from '@/context/ModelContext';
import { BloomModel } from '@/lib/ai/types';
import {
  Check,
  ChevronDown,
  Search,
  X,
  Sparkles,
  Zap,
  Code2,
  Eye,
  Brain,
  Layers,
  Info,
} from 'lucide-react';
import ModelDetailsModal from './ModelDetailsModal';

// ─── Astryx Motion Tokens ────────────────────────────────────────────────────
// From: npx @astryxdesign/cli docs motion
const MOTION = {
  durationFastMin:   '130ms',
  durationFast:      '175ms',
  durationFastMax:   '230ms',
  durationMediumMin: '310ms',
  durationMedium:    '410ms',
  durationMediumMax: '550ms',
  easeStandard: 'cubic-bezier(0.24, 1, 0.4, 1)',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ModelSelectorProps {
  compact?: boolean;
  variant?: 'default' | 'composer';
  direction?: 'down' | 'up';
}
type FilterCategory = 'all' | 'featured' | 'code' | 'vision' | 'reasoning' | 'fast';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: { id: FilterCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'featured', label: 'Featured', icon: Zap },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'reasoning', label: 'Logic', icon: Brain },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'fast', label: 'Fast', icon: Sparkles },
];

const FEATURED_IDS = new Set([
  'bloom-reason','bloom-swift','bloom-vision','bloom-max',
  'bloom-code','bloom-deep','bloom-studio','bloom-flash',
]);

function getBadgeStyle(badge?: string): { bg: string; color: string; border: string } | null {
  if (!badge) return null;
  const b = badge.toLowerCase();
  if (b.includes('pro') || b.includes('70b') || b.includes('405b'))
    return { bg: 'rgba(139,92,246,0.14)', color: '#c4b5fd', border: 'rgba(139,92,246,0.28)' };
  if (b.includes('fast') || b.includes('flash') || b.includes('8b'))
    return { bg: 'rgba(234,179,8,0.12)', color: '#fbbf24', border: 'rgba(234,179,8,0.24)' };
  if (b.includes('vision') || b.includes('multimodal'))
    return { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: 'rgba(59,130,246,0.24)' };
  if (b.includes('code'))
    return { bg: 'rgba(20,184,166,0.12)', color: '#5eead4', border: 'rgba(20,184,166,0.24)' };
  if (b.includes('logic') || b.includes('reason') || b.includes('deep'))
    return { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.24)' };
  if (b.includes('max'))
    return { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.28)' };
  return { bg: 'rgba(255,255,255,0.07)', color: '#d4d4d4', border: 'rgba(255,255,255,0.14)' };
}

function getModelEmoji(model: BloomModel): string {
  if (model.capabilities.vision) return '👁';
  if (model.capabilities.reasoning) return '🧠';
  if (model.badge?.toLowerCase().includes('code')) return '⌨';
  if (model.badge?.toLowerCase().includes('fast') || model.id.includes('swift')) return '⚡';
  if (model.id.includes('deep')) return '🔭';
  return '✦';
}

// ─── Lenis smooth-scroll for the modal list ───────────────────────────────────
function useLenisScroll(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  const lenisRef = useRef<InstanceType<typeof import('lenis').default> | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    let lenis: InstanceType<typeof import('lenis').default> | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (!ref.current) return;
      lenis = new Lenis({
        wrapper: ref.current,
        content: ref.current,
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 2,
      } as ConstructorParameters<typeof Lenis>[0]);
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis!.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });

    return () => {
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [active, ref]);
}

// ─── Body scroll lock ─────────────────────────────────────────────────────────
// Implements the Astryx useScrollLock pattern: pin body with position:fixed
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

// ─── Model Row ────────────────────────────────────────────────────────────────
interface ModelRowProps {
  model: BloomModel;
  isSelected: boolean;
  index: number;
  onSelect: (m: BloomModel) => void;
  onInfo: (m: BloomModel) => void;
}

function ModelRow({ model, isSelected, index, onSelect, onInfo }: ModelRowProps) {
  const [hovered, setHovered] = useState(false);
  const [infoHovered, setInfoHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const badgeStyle = getBadgeStyle(model.badge);

  // Staggered entry: Astryx useEntryAnimation equivalent (slideUp + fadeIn)
  const entryDelay = Math.min(index * 28, 280);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(model)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        padding: '10px 10px 10px 10px',
        borderRadius: '11px',
        cursor: 'pointer',
        border: isSelected
          ? '1px solid rgba(16,185,129,0.35)'
          : hovered
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid transparent',
        background: isSelected
          ? 'rgba(16,185,129,0.07)'
          : hovered
          ? 'rgba(255,255,255,0.045)'
          : 'transparent',
        transform: pressed ? 'scale(0.993)' : 'scale(1)',
        transition: [
          `background ${MOTION.durationFast} ${MOTION.easeStandard}`,
          `border-color ${MOTION.durationFast} ${MOTION.easeStandard}`,
          `transform ${MOTION.durationFastMin} ${MOTION.easeStandard}`,
          `opacity ${MOTION.durationMedium} ${MOTION.easeStandard} ${entryDelay}ms`,
          `translate 0 ${MOTION.durationMedium} ${MOTION.easeStandard} ${entryDelay}ms`,
        ].join(', '),
        animation: `modelRowIn ${MOTION.durationMedium} ${MOTION.easeStandard} ${entryDelay}ms both`,
        marginBottom: '2px',
        flexShrink: 0,
        willChange: 'transform, background',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '9px',
        flexShrink: 0,
        background: isSelected
          ? 'rgba(16,185,129,0.12)'
          : hovered
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.04)',
        border: isSelected
          ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px',
        transition: `background ${MOTION.durationFast} ${MOTION.easeStandard}, border-color ${MOTION.durationFast} ${MOTION.easeStandard}`,
      }}>
        {getModelEmoji(model)}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
          <span style={{
            fontWeight: 500,
            fontSize: '13px',
            color: isSelected ? '#f0fdf4' : hovered ? '#fafafa' : '#e4e4e7',
            transition: `color ${MOTION.durationFast} ${MOTION.easeStandard}`,
            lineHeight: 1.2,
          }}>
            {model.displayName}
          </span>
          {model.badge && badgeStyle && (
            <span style={{
              padding: '1px 6px',
              borderRadius: '5px',
              fontSize: '10px',
              fontWeight: 600,
              background: badgeStyle.bg,
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
              letterSpacing: '0.01em',
              lineHeight: '16px',
              flexShrink: 0,
            }}>
              {model.badge}
            </span>
          )}
        </div>

        <div style={{
          fontSize: '11.5px',
          color: '#71717a',
          lineHeight: 1.4,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}>
          {model.description || model.canonicalModelId}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px', color: '#3f3f46' }}>
          <span>{(model.contextWindow / 1024).toFixed(0)}k ctx</span>
          {model.capabilities.reasoning && <><span>·</span><span style={{ color: '#a78bfa' }}>Reasoning</span></>}
          {model.capabilities.vision && <><span>·</span><span style={{ color: '#60a5fa' }}>Vision</span></>}
          {model.publisher && <><span>·</span><span>{model.publisher}</span></>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onInfo(model); }}
          onMouseEnter={() => setInfoHovered(true)}
          onMouseLeave={() => setInfoHovered(false)}
          style={{
            width: '28px', height: '28px',
            borderRadius: '8px',
            background: infoHovered ? 'rgba(255,255,255,0.09)' : 'transparent',
            border: 'none',
            color: hovered ? (infoHovered ? '#fafafa' : '#71717a') : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: `color ${MOTION.durationFast} ${MOTION.easeStandard}, background ${MOTION.durationFast} ${MOTION.easeStandard}`,
            flexShrink: 0,
          }}
        >
          <Info size={13} />
        </button>

        {/* Selection indicator */}
        <div style={{
          width: '20px', height: '20px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isSelected ? '#10b981' : 'transparent',
          border: isSelected
            ? '1.5px solid #10b981'
            : hovered
            ? '1.5px solid rgba(255,255,255,0.25)'
            : '1.5px solid rgba(255,255,255,0.13)',
          boxShadow: isSelected ? '0 0 10px rgba(16,185,129,0.35)' : 'none',
          transition: [
            `background ${MOTION.durationFast} ${MOTION.easeStandard}`,
            `border-color ${MOTION.durationFast} ${MOTION.easeStandard}`,
            `box-shadow ${MOTION.durationMediumMin} ${MOTION.easeStandard}`,
          ].join(', '),
          flexShrink: 0,
        }}>
          {isSelected && (
            <Check size={11} style={{ color: '#fff', strokeWidth: 3, display: 'block' }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ModelSelector({ compact = false, variant = 'default' }: ModelSelectorProps) {
  const { models, selectedModel, setSelectedModel } = useBloomModel();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [detailsModalModel, setDetailsModalModel] = useState<BloomModel | null>(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Astryx useScrollLock pattern
  useScrollLock(isOpen);

  // Lenis smooth scrolling for list container
  useLenisScroll(listRef, isOpen);

  // Smooth close
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      setSearchQuery('');
    }, parseInt(MOTION.durationMediumMin));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [isOpen]);

  const filteredModels = useMemo(() => {
    let list = models;
    if (activeCategory === 'featured') list = models.filter(m => FEATURED_IDS.has(m.id));
    else if (activeCategory === 'code') list = models.filter(m => m.capabilities.codeGeneration || m.id.includes('code'));
    else if (activeCategory === 'vision') list = models.filter(m => m.capabilities.vision || m.id.includes('vision'));
    else if (activeCategory === 'reasoning') list = models.filter(m => m.capabilities.reasoning || m.id.includes('reason') || m.id.includes('deep'));
    else if (activeCategory === 'fast') list = models.filter(m => m.id.includes('swift') || m.id.includes('flash') || m.badge?.toLowerCase().includes('fast'));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.displayName.toLowerCase().includes(q) ||
        m.canonicalModelId.toLowerCase().includes(q) ||
        (m.description?.toLowerCase().includes(q)) ||
        (m.publisher?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [models, activeCategory, searchQuery]);

  const isComposer = variant === 'composer';

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes modelRowIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.97) translateY(4px); }
        }
        @keyframes backdropOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── Trigger ── */}
      <TriggerButton
        selectedModel={selectedModel}
        isComposer={isComposer}
        compact={compact}
        onClick={() => setIsOpen(true)}
      />

      {/* ── Portal Modal ── */}
      {mounted && isOpen && createPortal(
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            animation: closing
              ? `backdropOut ${MOTION.durationMediumMin} ${MOTION.easeStandard} both`
              : `backdropIn ${MOTION.durationMediumMin} ${MOTION.easeStandard} both`,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', maxWidth: '560px',
              display: 'flex', flexDirection: 'column',
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '18px',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.95)',
              color: '#e4e4e7',
              overflow: 'hidden',
              maxHeight: '82vh',
              animation: closing
                ? `modalOut ${MOTION.durationMediumMin} ${MOTION.easeStandard} both`
                : `modalIn ${MOTION.durationMedium} ${MOTION.easeStandard} both`,
              willChange: 'transform, opacity',
            }}
          >
            {/* Header */}
            <ModalHeader
              modelCount={models.length}
              onClose={handleClose}
            />

            {/* Search + Filters */}
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              activeCategory={activeCategory}
              onCategory={setActiveCategory}
              searchRef={searchRef}
            />

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.055)', flexShrink: 0 }} />

            {/* List */}
            <div
              ref={listRef}
              style={{
                flex: '1 1 auto', minHeight: 0,
                overflowY: 'auto', overflowX: 'hidden',
                padding: '8px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
              }}
            >
              {filteredModels.length === 0 ? (
                <div style={{ padding: '52px 16px', textAlign: 'center', color: '#52525b', fontSize: '13px' }}>
                  No models match &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredModels.map((model, i) => (
                  <ModelRow
                    key={model.id}
                    model={model}
                    isSelected={selectedModel?.id === model.id}
                    index={i}
                    onSelect={(m) => { setSelectedModel(m); handleClose(); }}
                    onInfo={setDetailsModalModel}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <ModalFooter selectedModel={selectedModel} />
          </div>
        </div>,
        document.body
      )}

      {detailsModalModel && (
        <ModelDetailsModal
          model={detailsModalModel}
          isOpen={!!detailsModalModel}
          onClose={() => setDetailsModalModel(null)}
        />
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TriggerButton({
  selectedModel, isComposer, compact, onClick
}: {
  selectedModel: BloomModel | null;
  isComposer: boolean;
  compact: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: compact ? '5px 9px' : isComposer ? '6px 11px' : '5px 10px',
        borderRadius: '10px',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.09)'}`,
        background: hovered
          ? (isComposer ? '#2a2a2a' : 'rgba(255,255,255,0.05)')
          : (isComposer ? '#1e1e1e' : 'transparent'),
        color: hovered ? '#fafafa' : '#e4e4e7',
        fontSize: compact ? '11px' : '12px',
        fontWeight: 450,
        cursor: 'pointer',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        transition: [
          `border-color ${MOTION.durationFast} ${MOTION.easeStandard}`,
          `background ${MOTION.durationFast} ${MOTION.easeStandard}`,
          `color ${MOTION.durationFast} ${MOTION.easeStandard}`,
          `transform ${MOTION.durationFastMin} ${MOTION.easeStandard}`,
        ].join(', '),
        transform: pressed ? 'scale(0.975)' : 'scale(1)',
        outline: 'none',
        whiteSpace: 'nowrap',
        maxWidth: '220px',
        willChange: 'transform',
      }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#10b981', flexShrink: 0,
        boxShadow: hovered ? '0 0 8px rgba(16,185,129,0.7)' : '0 0 5px rgba(16,185,129,0.45)',
        transition: `box-shadow ${MOTION.durationMediumMin} ${MOTION.easeStandard}`,
      }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {selectedModel?.displayName || 'Select model'}
      </span>
      <ChevronDown
        size={13}
        style={{
          color: hovered ? '#a1a1aa' : '#52525b',
          transition: `color ${MOTION.durationFast} ${MOTION.easeStandard}`,
          transform: 'rotate(0deg)',
          flexShrink: 0,
        }}
      />
    </button>
  );
}

function ModalHeader({ modelCount, onClose }: { modelCount: number; onClose: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ padding: '18px 18px 16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fafafa', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
          Choose a model
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#52525b', lineHeight: 1.4 }}>
          {modelCount} available · selection persists across all chats
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '28px', height: '28px',
          borderRadius: '8px',
          background: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: 'none',
          color: hovered ? '#a1a1aa' : '#3f3f46',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: `background ${MOTION.durationFast} ${MOTION.easeStandard}, color ${MOTION.durationFast} ${MOTION.easeStandard}`,
          marginTop: '-2px', flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

function SearchAndFilters({
  searchQuery, onSearch, activeCategory, onCategory, searchRef
}: {
  searchQuery: string;
  onSearch: (v: string) => void;
  activeCategory: FilterCategory;
  onCategory: (c: FilterCategory) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ padding: '0 10px 10px', flexShrink: 0 }}>
      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: focused ? '#1c1c1c' : '#171717',
        border: `1px solid ${focused ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px',
        padding: '9px 12px',
        marginBottom: '10px',
        transition: `border-color ${MOTION.durationFast} ${MOTION.easeStandard}, background ${MOTION.durationFast} ${MOTION.easeStandard}`,
      }}>
        <Search size={14} style={{ color: focused ? '#71717a' : '#3f3f46', flexShrink: 0, transition: `color ${MOTION.durationFast} ${MOTION.easeStandard}` }} />
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search models..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#e4e4e7', fontSize: '13px', fontFamily: 'inherit',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearch('')}
            style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const active = activeCategory === cat.id;
          return (
            <CategoryTab
              key={cat.id}
              id={cat.id}
              label={cat.label}
              Icon={Icon}
              active={active}
              onClick={() => onCategory(cat.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryTab({ id, label, Icon, active, onClick }: {
  id: string; label: string; Icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 10px', borderRadius: '8px', border: 'none',
        background: active ? 'rgba(255,255,255,0.1)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: active ? '#fafafa' : hovered ? '#d4d4d8' : '#71717a',
        fontSize: '12px', fontWeight: active ? 500 : 400,
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        transition: `background ${MOTION.durationFast} ${MOTION.easeStandard}, color ${MOTION.durationFast} ${MOTION.easeStandard}`,
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function ModalFooter({ selectedModel }: { selectedModel: BloomModel | null }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.055)',
      padding: '11px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
      background: '#0a0a0a',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#10b981', display: 'inline-block',
          boxShadow: '0 0 7px rgba(16,185,129,0.5)',
        }} />
        <span style={{ fontSize: '11px', color: '#3f3f46' }}>
          {selectedModel
            ? <><span style={{ color: '#71717a' }}>Active:</span> <span style={{ color: '#a1a1aa' }}>{selectedModel.displayName}</span></>
            : <span style={{ color: '#3f3f46' }}>No model selected</span>
          }
        </span>
      </div>
      <span style={{ fontSize: '11px', color: '#27272a', letterSpacing: '0.03em' }}>NVIDIA NIM</span>
    </div>
  );
}
