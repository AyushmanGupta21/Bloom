'use client'

import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useAuth, UserButton } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';
import { SideNav, SideNavSection } from '@astryxdesign/core/SideNav';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon, MessageSquare, Settings } from 'lucide-react';

interface AppSidebarProps {
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export function AppSidebar({ onClose, onOpenSettings }: AppSidebarProps) {
  const [projectList, setProjectList] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [skeletonCount, setSkeletonCount] = useState(3);
  const { has } = useAuth();

  useEffect(() => {
    GetProjectList();
  }, []);

  const hasUnlimitedAccess = has && has({ plan: 'unlimited' });

  const GetProjectList = async () => {
    setLoading(true);
    try {
      const result = await axios.get('/api/get-all-projects');
      setProjectList(result.data);
      if (result.data.length > 0) {
        setSkeletonCount(result.data.length);
      }
    } catch (err) {
      console.error('Failed to get projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideNav
      className={`!bg-[#171717] !text-white border-r border-white/10 flex-shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      header={
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} py-4 px-3 border-b border-white/5`}>
          <Image src="/bloom-logo.svg" alt="Bloom Logo" width={32} height={32} className="rounded-lg" />
          {!isCollapsed && <h2 className="font-bold text-lg text-white font-mono tracking-tight select-none">Bloom</h2>}
        </div>
      }
      topContent={
        <div className="px-3 pt-4 pb-2">
          <Link href="/workspace" className="w-full block" onClick={onClose}>
            <button 
              className={`flex items-center justify-center ${
                isCollapsed ? 'p-2 w-10 h-10 mx-auto rounded-full' : 'gap-2 py-2 px-4 w-full rounded-lg'
              } border border-white/10 hover:bg-white/5 text-sm text-gray-200 transition-all font-mono cursor-pointer`}
              title="New Project"
            >
              <PlusIcon size={16} />
              {!isCollapsed && <span>New Project</span>}
            </button>
          </Link>
        </div>
      }
      footer={
        <div className="p-3 space-y-4 border-t border-white/5 bg-[#171717]">
          {/* Credits Meter (ChatGPT style widget) - Hidden in Collapsed Mode */}
          {!hasUnlimitedAccess && !isCollapsed && (
            <div className="p-3 border border-white/10 rounded-xl space-y-2.5 bg-white/5">
              <h2 className="flex justify-between items-center text-xs text-gray-300 font-mono">
                <span>Remaining Credits</span>
                <span className="font-bold text-white">{userDetail?.credits ?? 0}</span>
              </h2>
              <Progress
                value={((userDetail?.credits ?? 0) / (userDetail?.maxCredits || 2)) * 100}
                className="bg-zinc-800 h-1.5 [&>div]:bg-white"
              />
              <Link href="/workspace/pricing" className="w-full block" onClick={onClose}>
                <button className="w-full py-1.5 px-3 bg-white text-black hover:bg-gray-200 text-[11px] font-bold rounded-lg transition-colors font-mono cursor-pointer">
                  Upgrade to Unlimited
                </button>
              </Link>
            </div>
          )}

          {/* User Profile and Sidebar Collapse Toggle */}
          <div className="flex flex-col gap-4 pt-1">
            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between w-full'}`}>
              <div className="flex items-center gap-2">
                <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
                {!isCollapsed && <span className="text-xs text-gray-300 font-mono line-clamp-1 select-none">Profile</span>}
              </div>
              <button
                onClick={onOpenSettings}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Custom Collapse Toggle Trigger (chevron) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      }
    >
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <SideNavSection 
          title={isCollapsed ? "" : "Recent Projects"} 
          className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-2"
        >
          {loading ? (
            <div className="space-y-2 mt-2">
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <Skeleton key={index} className={`w-full h-8 bg-white/5 ${isCollapsed ? 'rounded-full w-8 h-8 mx-auto' : 'rounded-lg'}`} />
              ))}
            </div>
          ) : projectList.length === 0 ? (
            !isCollapsed ? <h2 className="text-xs px-2 py-4 text-zinc-500 font-mono">No projects found</h2> : null
          ) : (
            <div className="space-y-1 mt-1">
              {projectList.map((project: any, index) => {
                const title = project.chats?.[0]?.chatMessage?.[0]?.content || 'New Project';
                return (
                  <Link
                    href={`/playground/${project.projectId}?frameId=${project.frameId}`}
                    key={index}
                    onClick={onClose}
                    className={`flex items-center ${
                      isCollapsed ? 'justify-center py-2.5' : 'gap-2.5 px-3 py-2'
                    } rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-xs font-mono group block`}
                    title={isCollapsed ? title : undefined}
                  >
                    <MessageSquare size={13} className="text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />
                    {!isCollapsed && <span className="line-clamp-1 flex-1">{title}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </SideNavSection>
      </div>
    </SideNav>
  );
}