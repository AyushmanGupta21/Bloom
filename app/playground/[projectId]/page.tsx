import React, { Suspense } from 'react';
import PlayGroundContent from './PlayGroundContent';

export const dynamic = 'force-dynamic';

export default function PlayGroundPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#212121] flex items-center justify-center font-mono text-zinc-500">
        Loading workspace...
      </div>
    }>
      <PlayGroundContent />
    </Suspense>
  );
}