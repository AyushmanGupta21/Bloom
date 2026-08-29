import React, { useContext, useEffect, useRef, useState } from 'react'
import WebPageTools from './WebPageTools';
import ElementSettingSection from './ElementSettingSection';
import ImageSettingSection from './ImageSettingsSection';
import { OnSaveContext } from '@/context/OnSaveContext';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'next/navigation';

const HTML_CODE = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Bloom — Modern TailwindCSS + Flowbite Template">
          <title>Bloom</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>
          
          <style>
            /* Custom scrollbar styling */
            ::-webkit-scrollbar {
              width: 12px;
              height: 12px;
            }
            ::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.3);
              border-radius: 6px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.5);
            }
            * {
              scrollbar-width: thin;
              scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
            }
          </style>

          <!-- Flowbite CSS & JS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

          <!-- Font Awesome / Lucide -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

          <!-- Chart.js -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

          <!-- AOS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

          <!-- GSAP -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

          <!-- Lottie -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

          <!-- Swiper -->
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
          <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

          <!-- Tippy.js -->
          <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
          <script src="https://unpkg.com/@popperjs/core@2"></script>
          <script src="https://unpkg.com/tippy.js@6"></script>
      </head>
      <body id="root">
        {code}
      </body>
      </html>`

type Props = {
  generatedCode: string;
  onElementSelect?: (el: HTMLElement | null) => void;
  selectedElement?: HTMLElement | null;
  isMobile?: boolean;
}
function WebsiteDesign({ generatedCode, onElementSelect, selectedElement: externalSelectedElement, isMobile }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState('web');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>();

  const handleElementSelect = (el: HTMLElement | null) => {
    setSelectedElement(el);
    if (onElementSelect) {
      onElementSelect(el);
    }
  };
  const { onSaveData, setOnSaveData } = useContext(OnSaveContext)
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  // Initialize iframe shell once
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(HTML_CODE);
    doc.close();
  }, []);



  // Update body only when code changes
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const root = doc.getElementById("root");
    if (root && generatedCode) {
      // Extract only HTML code, remove everything before and after code blocks
      let cleanCode = generatedCode;

      // If there's a code block marker, extract only the code
      if (cleanCode.includes('```html')) {
        const startIndex = cleanCode.indexOf('```html') + 7;
        const endIndex = cleanCode.indexOf('```', startIndex);
        cleanCode = endIndex > startIndex
          ? cleanCode.slice(startIndex, endIndex)
          : cleanCode.slice(startIndex);
      } else {
        // Remove any remaining markers
        cleanCode = cleanCode
          .replaceAll("```html", "")
          .replaceAll("```", "");
      }

      // The generated HTML may be a full document (<!DOCTYPE html>...<html>...).
      // If so, extract just the <body> contents so we don't nest a full doc inside
      // our shell body (which breaks layout). Otherwise use the code as-is.
      const bodyMatch = cleanCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const injectable = bodyMatch ? bodyMatch[1] : cleanCode.trim();

      root.innerHTML = injectable;

      // Execute any <script> tags in the injected HTML (innerHTML does NOT run them).
      // This is what makes interactive components and inline init code work.
      const scripts = Array.from(root.querySelectorAll('script'));
      scripts.forEach((oldScript) => {
        const newScript = doc.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      // Re-render Lucide icons and re-init Flowbite for the freshly injected DOM.
      // Without this, <i data-lucide="..."> elements stay empty (blank boxes).
      const reinitLibraries = () => {
        const win = iframeRef.current?.contentWindow as any;
        try { win?.lucide?.createIcons?.(); } catch {}
        try { win?.initFlowbite?.(); } catch {}
      };
      // Run now, and again shortly after in case the CDN scripts are still loading.
      reinitLibraries();
      setTimeout(reinitLibraries, 300);
      setTimeout(reinitLibraries, 1000);

      // Attach event listeners to new content
      let hoverEl: HTMLElement | null = null;
      let selectedEl: HTMLElement | null = null;

      const handleMouseOver = (e: MouseEvent) => {
        if (selectedEl) return;
        const target = e.target as HTMLElement;
        if (hoverEl && hoverEl !== target) {
          hoverEl.style.outline = "";
        }
        hoverEl = target;
        hoverEl.style.outline = "2px dotted blue";
      };

      const handleMouseOut = (e: MouseEvent) => {
        if (selectedEl) return;
        if (hoverEl) {
          hoverEl.style.outline = "";
          hoverEl = null;
        }
      };

      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLElement;

        if (selectedEl && selectedEl !== target) {
          selectedEl.style.outline = "";
          selectedEl.removeAttribute("contenteditable");
        }

        selectedEl = target;
        selectedEl.style.outline = "2px solid red";
        selectedEl.setAttribute("contenteditable", "true");
        selectedEl.focus();
        console.log("Selected element: ", selectedEl);
        handleElementSelect(selectedEl);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && selectedEl) {
          selectedEl.style.outline = "";
          selectedEl.removeAttribute("contenteditable");
          selectedEl = null;
          handleElementSelect(null);
        }
      };

      doc.body?.addEventListener("mouseover", handleMouseOver);
      doc.body?.addEventListener("mouseout", handleMouseOut);
      doc.body?.addEventListener("click", handleClick);
      doc?.addEventListener("keydown", handleKeyDown);

      return () => {
        doc.body?.removeEventListener("mouseover", handleMouseOver);
        doc.body?.removeEventListener("mouseout", handleMouseOut);
        doc.body?.removeEventListener("click", handleClick);
        doc?.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [generatedCode]);


  useEffect(() => {
    onSaveData && onSaveCode();
  }, [onSaveData])

  const onSaveCode = async() => {
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument
          || iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const cloneDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;
          //Remove all outlines
          const AllEls = cloneDoc.querySelectorAll<HTMLElement>('*');
          AllEls.forEach((el) => {
            el.style.outline = '';
            el.style.cursor = '';

          })
          const html = cloneDoc.outerHTML;
          console.log("Saved HTML:", html);
          const result = await axios.post('/api/frames', {
            designCode: html,
            frameId: frameId,
            projectId: projectId
          })
          console.log(result.data);
          toast.success('Saved!');
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  const clearSelection = () => {
    handleElementSelect(null);
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement.removeAttribute('contenteditable');
    }
  };

  return (
    <div className={`flex ${
      isMobile ? 'flex-col w-full' : 'flex-row gap-2 w-full'
    } h-full overflow-hidden`}>
      <div className={`${
        isMobile ? 'w-full h-full' : 'w-full'
      } p-2 md:p-5 flex items-center flex-col overflow-y-auto`}>
        <iframe
          ref={iframeRef}
          className={`${
            isMobile 
              ? 'w-full h-[60vh]' 
              : selectedScreenSize == 'web' ? 'w-full h-[calc(100vh-200px)]' : 'w-130 h-[calc(100vh-200px)]'
          } border-2 rounded-xl bg-white`}
          sandbox="allow-scripts allow-same-origin"
        />
        <div className='mt-3 w-full'>
          <WebPageTools 
            selectedScreenSize={selectedScreenSize}
            setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)}
            generatedCode={generatedCode}
            isMobile={isMobile}
          />
        </div>
      </div>
      {/* setting section */}
      {selectedElement && (
        <div className={`${
          isMobile 
            ? 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' 
            : 'relative'
        }`}>
          <div className={`${
            isMobile 
              ? 'absolute right-0 top-0 h-full w-[85vw] max-w-md'
              : 'relative w-auto'
          }`}>
            {selectedElement?.tagName == 'IMG' ?
              //@ts-ignore
              <ImageSettingSection selectedEl={selectedElement} clearSelection={clearSelection} isMobile={isMobile} />
              : <ElementSettingSection selectedEl={selectedElement} clearSelection={clearSelection} isMobile={isMobile} />
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteDesign