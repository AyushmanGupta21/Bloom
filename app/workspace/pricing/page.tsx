import React, { Suspense } from 'react';
import PricingContent from './PricingContent';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-black flex items-center justify-center font-mono text-zinc-500">
        Loading pricing...
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}