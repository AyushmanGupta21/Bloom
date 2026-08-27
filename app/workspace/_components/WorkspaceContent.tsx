'use client'

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { UserDetailContext } from '@/context/UserDetailContext';
import { toast } from 'sonner';
import { ArrowUp, LayoutDashboard, Key, HomeIcon, UserIcon, Loader2, Paperclip, ImagePlus } from 'lucide-react';
import ModelSelector from '@/components/ModelSelector';
import { useBloomModel } from '@/context/ModelContext';

const suggestions = [
  {
    label: 'Dashboard',
    prompt: 'Create an analytics dashboard to track customers and revenue data for a SaaS.',
    icon: LayoutDashboard,
  },
  {
    label: 'SignUp Form',
    prompt: 'Create a modern sign up form with email, password fields, Google and Github login options, and terms checkbox.',
    icon: Key,
  },
  {
    label: 'Hero Section',
    prompt: 'Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect, subtitle, CTA, small social proof and an image.',
    icon: HomeIcon,
  },
  {
    label: 'Profile Card',
    prompt: 'Create a modern user profile card component for a social media website.',
    icon: UserIcon,
  },
];

export default function WorkspaceContent() {
  const { user } = useUser();
  const router = useRouter();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { has } = useAuth();
  const hasUnlimitedAccess = has && has({ plan: 'unlimited' });
  const { selectedModel } = useBloomModel();

  useEffect(() => {
    const pendingInput = sessionStorage.getItem('pendingProjectInput');
    if (user && pendingInput && userDetail?.credits !== undefined) {
      sessionStorage.removeItem('pendingProjectInput');
      createProjectAndRedirect(pendingInput);
    }
  }, [user, userDetail]);

  const createProjectAndRedirect = async (input: string) => {
    if (!hasUnlimitedAccess && userDetail?.credits! <= 0) {
      toast.error('You have no credits left. Please upgrade your plan');
      return;
    }
    setLoading(true);
    const projectId = uuidv4();
    const frameId = Math.floor(Math.random() * 10000);
    const messages = [{ role: 'user', content: input }];

    try {
      await axios.post('/api/projects', {
        projectId,
        frameId,
        messages,
        credits: userDetail?.credits,
      });
      toast.success('Project Created!');
      setUserDetail((prev: any) => ({
        ...prev,
        credits: prev?.credits! - 1,
      }));
      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch (e) {
      toast.error('Failed to create project');
      console.log(e);
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!userInput.trim() || loading) return;
    createProjectAndRedirect(userInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-full w-full bg-[#212121] flex flex-col items-center justify-center px-4 py-8 font-mono select-none">
      {/* Title Greeting */}
      <h1 className="text-white font-bold text-2xl md:text-3.5xl text-center mb-8 tracking-tight font-mono select-none">
        What would you like Bloom to build?
      </h1>

      {/* ChatGPT-style Composer Panel */}
      <div className="w-full max-w-2xl bg-[#2f2f2f] rounded-2xl border border-white/10 p-3 flex flex-col gap-2 shadow-2xl">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your page design..."
          className="w-full h-24 md:h-28 text-sm focus:outline-none focus:ring-0 resize-none bg-transparent text-white placeholder:text-gray-400 font-mono p-1 border-0"
        />

        <div className="flex justify-between items-center border-t border-white/5 pt-2">
          {/* Left panel controls with Model Selector */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer" title="Attach file">
              <Paperclip size={16} />
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer" title="Add image">
              <ImagePlus size={16} />
            </button>

            {/* Model Selector in workspace composer */}
            <ModelSelector direction="down" variant="composer" />
          </div>

          {/* Send CTA */}
          <button
            disabled={!userInput.trim() || loading}
            onClick={handleSend}
            className="p-2 bg-white text-black hover:bg-gray-200 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-full transition-colors cursor-pointer flex items-center justify-center w-8 h-8"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
          </button>
        </div>
      </div>

      {/* Grid of Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
        {suggestions.map((s, index) => {
          const IconComponent = s.icon;
          return (
            <div
              key={index}
              onClick={() => setUserInput(s.prompt)}
              className="p-4 bg-[#2f2f2f] hover:bg-[#383838] border border-white/5 hover:border-white/10 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-3 group"
            >
              <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white transition-colors">
                <IconComponent size={16} />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-white text-xs font-semibold font-mono">{s.label}</span>
                <span className="text-gray-400 text-[10px] line-clamp-2 leading-relaxed font-mono">{s.prompt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
