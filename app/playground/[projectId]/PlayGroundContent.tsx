"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesign from '../_components/WebsiteDesign'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { useResizable, ResizeHandle } from '@astryxdesign/core/Resizable';
import { useBloomModel } from '@/context/ModelContext';

export type Frame = {
  projectId: string;
  frameId: string,
  designCode: string,
  chatMessages: Messages[]
}
export type Messages = {
  role: string,
  content: string
}

const Prompt = `Generate a modern, responsive HTML page with Tailwind CSS based on this request: {userInput}.
Return ONLY valid HTML code enclosed in \`\`\`html and \`\`\` code blocks.
Include all necessary HTML structure, Tailwind classes, and:
- FontAwesome or Heroicons for icons
- Google Fonts (Inter/Outfit)
- Tailwind CSS via CDN
- Flowbite CSS & JS via CDN
- Lucide Icons (script tag)
- Swiper.js for sliders/carousels where relevant
- Chart.js for charts where relevant
- Fully interactive components (modals, dropdowns, tabs, accordions) using standard Flowbite data attributes.
- Ensure the design is visually stunning, responsive, dark-mode inspired or modern palette, and complete.`

// Helper to remove consecutive duplicate messages
function deduplicateMessages(list: Messages[]): Messages[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  const clean: Messages[] = [];
  for (let i = 0; i < list.length; i++) {
    const curr = list[i];
    const prev = clean[clean.length - 1];
    if (prev && prev.role === curr.role && prev.content.trim() === curr.content.trim()) {
      continue;
    }
    clean.push(curr);
  }
  return clean;
}

export default function PlayGroundContent() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<any>();
  const hasAutoTriggeredRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { selectedModel } = useBloomModel();

  const chatResize = useResizable({
    defaultSize: 384,
    minSizePx: 320,
    maxSizePx: 560,
    autoSaveId: 'playground-chat-panel',
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && selectedElement) {
      setShowChat(false);
    } else if (isMobile && !selectedElement) {
      setShowChat(true);
    }
  }, [selectedElement, isMobile]);

  useEffect(() => {
    if (frameId) {
      GetFrameDetails();
    }
  }, [frameId]);

  const GetFrameDetails = async () => {
    try {
      const result = await axios.get('/api/frames?frameId=' + frameId + "&projectId=" + projectId);
      setFrameDetail(result.data);
      const designCode = result.data?.designCode;
      if (designCode) {
        const index = designCode.indexOf('```html') + 7;
        const formattedCode = designCode.slice(index);
        setGeneratedCode(formattedCode);
      }
      if (result.data?.chatMessages && Array.isArray(result.data.chatMessages)) {
        const cleanMessages = deduplicateMessages(result.data.chatMessages);
        setMessages(cleanMessages);

        // Only auto-trigger once if no design code exists yet
        if (!designCode && cleanMessages.length > 0 && !hasAutoTriggeredRef.current && !isGeneratingRef.current) {
          const firstUserMessage = cleanMessages.find((msg: Messages) => msg.role === 'user');
          if (firstUserMessage) {
            hasAutoTriggeredRef.current = true;
            // Send without re-appending the user message to state
            SendMessage(firstUserMessage.content, false);
          }
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to load frame details';
      toast.error(message);
      console.error('Failed to get frame details:', err);
    }
  };

  const SendMessage = async (userInput: string, appendUserMessage: boolean = true) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setLoading(true);
    
    const isModification = /change|modify|update|add|remove|edit|fix|adjust|improve/i.test(userInput) && generatedCode;
    
    if (!isModification) {
      setGeneratedCode('');
    }

    if (appendUserMessage) {
      setMessages((prev: any) => deduplicateMessages([
        ...prev,
        { role: "user", content: userInput }
      ]));
    }

    let promptContent = '';
    if (/create|build|design|generate|make|write|code|page|website|component|layout|form|dashboard|hero|section/.test(userInput.toLowerCase())) {
      if (isModification && generatedCode) {
        promptContent = `Current Design Code:\n${generatedCode}\n\nUser Request: ${userInput}\n\nModify the above code based on the user's request. Include all necessary HTML structure and Tailwind classes. Return ONLY HTML code inside \`\`\`html and \`\`\` blocks.`;
      } else {
        promptContent = Prompt.replace('{userInput}', userInput);
      }
    } else {
      promptContent = userInput;
    }

    try {
      const result = await fetch('/api/ai-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptContent }],
          model: selectedModel?.id || 'bloom-reason',
          projectId: projectId as string,
          frameId: frameId as string,
        }),
      });

      if (!result.ok) {
        const errorJson = await result.json().catch(() => ({}));
        throw new Error(errorJson?.error || 'Generation failed');
      }

      const reader = result.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response stream. Please try again.');
      }
      const decoder = new TextDecoder();
      let aiResponse = '';
      let isCode = false;

      // Buffer chunks and flush to state via rAF to prevent
      // "Maximum update depth exceeded" from rapid successive setState calls
      let pendingCode = '';
      let rafId: number | null = null;

      const flushCode = () => {
        rafId = null;
        if (pendingCode) {
          const snapshot = pendingCode;
          setGeneratedCode((prev: string) => (prev || '') + snapshot);
          pendingCode = '';
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        if (!isCode && aiResponse.includes('```html')) {
          isCode = true;
          const index = aiResponse.indexOf('```html') + 7;
          const initialCodeChunk = aiResponse.slice(index);
          // Set initial code synchronously so preview starts immediately
          setGeneratedCode(initialCodeChunk);
        } else if (isCode) {
          // Buffer and flush via rAF — max ~60 setState calls/sec
          pendingCode += chunk;
          if (rafId === null) {
            rafId = requestAnimationFrame(flushCode);
          }
        }
      }

      // Cancel any pending rAF and do a final flush
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        flushCode();
      }

      await SaveGeneratedCode(aiResponse);

      const finalMsg = !isCode ? aiResponse : 'Your code is ready!';
      setMessages((prev: any) => {
        const updated = deduplicateMessages([
          ...prev,
          { role: "assistant", content: finalMsg },
        ]);
        SaveMessagesDirect(updated);
        return updated;
      });
    } catch (err: any) {
      const isNetworkError = err instanceof TypeError && /fetch|network/i.test(err.message);
      const message = isNetworkError
        ? 'Network error — check your connection and try again.'
        : (err?.message || 'AI Generation request failed');
      toast.error(message);
      console.error('[SendMessage]', err);
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }

  };

  const SaveMessagesDirect = async (msgs: Messages[]) => {
    try {
      const clean = deduplicateMessages(msgs);
      if (!frameId || clean.length === 0) return;
      await axios.put('/api/chats', {
        messages: clean,
        frameId: frameId
      });
    } catch (err) {
      console.error('Failed to save chats:', err);
    }
  };

  const SaveGeneratedCode = async (code: string) => {
    try {
      await axios.post('/api/frames', {
        designCode: code,
        frameId: frameId,
        projectId: projectId
      });
      toast.success('Website is Ready!');
    } catch (err) {
      console.error('Failed to save code:', err);
    }
  };

  return (
    <div className="relative h-screen bg-[#212121] overflow-hidden font-mono select-none">
      <div className="relative z-10 h-full flex flex-col">
        <PlaygroundHeader onUsePrompt={(prompt) => SendMessage(prompt, true)} />

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Chat Panel */}
          <div
            style={{
              width: isMobile ? '100%' : `${chatResize.size}px`,
              flexShrink: 0,
            }}
            className={`transition-all duration-300 ease-in-out ${
              showChat
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0 absolute md:relative pointer-events-none'
            } ${isMobile ? 'h-full z-20' : 'h-full'}`}
          >
            <ChatSection
              messages={messages}
              onSend={(input) => SendMessage(input, true)}
              loading={loading}
              isMobile={isMobile}
              activeModelName={selectedModel?.displayName}
            />
          </div>

          {/* Astryx Draggable Resizer Handle */}
          {!isMobile && showChat && (
            <ResizeHandle
              direction="horizontal"
              resizable={(chatResize as any)?.props || (chatResize as any)}
              pillPlacement="center"
              aria-label="Resize chat panel"
            />
          )}

          {/* Web Design Preview / Code Area */}
          <div className="flex-1 h-full overflow-hidden">
            <WebsiteDesign
              generatedCode={generatedCode}
              onElementSelect={(el) => setSelectedElement(el)}
              selectedElement={selectedElement}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
