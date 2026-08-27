"use client"
import React, { useState, useContext } from 'react';
import { AppSidebar } from './_components/AppSidebar';
import AppHeader from './_components/AppHeader';
import { useUser, useAuth, UserButton } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useBloomModel } from '@/context/ModelContext';
import Link from 'next/link';
import { Settings, X, Sparkles, User as UserIcon, Shield } from 'lucide-react';

export default function WorkspaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const { user } = useUser();
    const { userDetail } = useContext(UserDetailContext);
    const { models, selectedModel, setSelectedModelById } = useBloomModel();
    const { has } = useAuth();
    const hasUnlimitedAccess = has && has({ plan: 'unlimited' });

    return (
        <div className="relative flex h-screen w-screen overflow-hidden bg-[#212121]">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar container with slide-in animation on mobile */}
            <div className={`fixed inset-y-0 left-0 z-40 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex`}>
                <AppSidebar 
                    onClose={() => setSidebarOpen(false)} 
                    onOpenSettings={() => {
                        setShowSettings(true);
                        setSidebarOpen(false); // Close sidebar drawer on mobile
                    }}
                />
            </div>

            {/* Main content pane */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <div className="flex-1 overflow-y-auto min-w-0">
                    {children}
                </div>
            </div>

            {/* Floating Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop Blur Overlay */}
                    <div 
                        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
                        onClick={() => setShowSettings(false)}
                    />

                    {/* Liquid Glass Settings Card */}
                    <div className="w-full max-w-sm liquid-glass p-6 md:p-7 space-y-5 relative overflow-hidden animate-scaleIn font-mono text-white">
                        {/* Glow overlays */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
                          <div className="flex items-center gap-2">
                            <Settings size={16} className="text-white animate-spin-slow" />
                            <h2 className="text-xs font-bold uppercase tracking-wider">Settings</h2>
                          </div>
                          <button 
                            onClick={() => setShowSettings(false)}
                            className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                            title="Close"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4 relative z-10 text-xs">
                          
                          {/* User details row */}
                          <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
                            <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'User Profile'}</p>
                              <p className="text-[10px] text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress || 'No Email'}</p>
                            </div>
                          </div>

                          {/* Model Preferences selection row */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1.5 pl-1">
                              <Sparkles size={11} />
                              <span>Model Preference</span>
                            </span>
                            <select 
                              value={selectedModel?.id}
                              onChange={(e) => setSelectedModelById(e.target.value)}
                              className="w-full bg-[#2f2f2f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono transition-all duration-200"
                            >
                              {models.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.displayName} {m.isDefault ? '(Default)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Plan Status and Credits row */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1.5 pl-1">
                              <Shield size={11} />
                              <span>Plan Status</span>
                            </span>
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                              <div>
                                <span className="px-1.5 py-0.5 bg-white text-black font-bold text-[8px] uppercase tracking-wider rounded font-mono">
                                  {hasUnlimitedAccess ? 'Pro / Unlimited' : 'Free Tier'}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1 font-mono">{userDetail?.credits ?? 0} credits left</p>
                              </div>

                              {!hasUnlimitedAccess && (
                                <Link href="/workspace/pricing" onClick={() => setShowSettings(false)}>
                                  <button className="px-3 py-1.5 bg-white text-black hover:bg-gray-200 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer font-mono">
                                    Upgrade
                                  </button>
                                </Link>
                              )}
                            </div>
                          </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}