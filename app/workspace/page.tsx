import React, { Suspense } from 'react';
import WorkspaceContent from './_components/WorkspaceContent';

export const dynamic = 'force-dynamic';

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#212121] flex items-center justify-center font-mono text-zinc-500">
        Loading workspace...
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}