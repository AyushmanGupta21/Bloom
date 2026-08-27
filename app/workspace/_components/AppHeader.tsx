'use client'

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import ModelSelector from '@/components/ModelSelector';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-[#212121] border-b border-white/5 relative z-20">
      
      {/* Left - Hamburger (mobile only) & Model Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors md:hidden cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Bloom Model Selector powered by NVIDIA NIM */}
        <ModelSelector />
      </div>

      {/* Right - Profile and actions */}
      <div className="flex items-center gap-3">
        <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
      </div>
    </header>
  );
}

export default AppHeader;