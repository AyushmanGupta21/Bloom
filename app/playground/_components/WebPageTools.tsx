import { Button } from '@/components/ui/button'
import { Code2Icon, Download, Monitor, SquareArrowOutUpRight, TabletSmartphone } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ViewCodeBlock from './ViewCodeBlock'

const HTML_CODE=`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Bloom — Modern TailwindCSS + Flowbite Template">
          <title>Bloom</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>

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
function WebPageTools({selectedScreenSize, setSelectedScreenSize, generatedCode, isMobile}:any) {

    const [finalCode, setFinalCode]=useState<string>();
    useEffect(()=>{
      if(!generatedCode) return;
      let cleanCode = generatedCode;
      // Remove code block markers
      if(cleanCode.includes('```html')){
        cleanCode = cleanCode.replace('```html', '');
      }
      cleanCode = cleanCode.replace(/```$/g, '');
      const finalHTML = HTML_CODE.replace('{code}', cleanCode);
      setFinalCode(finalHTML)
    },[generatedCode])

    const ViewInNewTab = () => {
      let codeToUse = finalCode;
      if (!codeToUse && generatedCode) {
        let cleanCode = generatedCode;
        if (cleanCode.includes('```html')) {
          cleanCode = cleanCode.replace('```html', '');
        }
        cleanCode = cleanCode.replace(/```$/g, '');
        codeToUse = HTML_CODE.replace('{code}', cleanCode);
      }
      if (!codeToUse) {
        codeToUse = HTML_CODE.replace('{code}', '<div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:sans-serif;color:#888;">No generated code to preview yet.</div>');
      }

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(codeToUse);
        newWindow.document.close();
      } else {
        const blob = new Blob([codeToUse], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    };

    const downloadCode=()=>{
      const blob=new Blob([finalCode??''], {type:'text/html'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download='index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

  return (
    <div className={`p-2 md:p-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl w-full ${
      isMobile ? 'flex flex-col gap-2' : 'flex items-center justify-between'
    }`}>
        <div className='flex gap-2 justify-center'>
            <Button variant={'ghost'} 
            size={isMobile ? 'sm' : 'default'}
            className={`text-white hover:bg-white/20 hover:text-white transition-colors ${selectedScreenSize=='web'? 'bg-white/20 border border-blue-500':'border border-white/20'}`}
            onClick={()=>setSelectedScreenSize('web')}><Monitor className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} /></Button>
            <Button variant={'ghost'} 
            size={isMobile ? 'sm' : 'default'}
            className={`text-white hover:bg-white/20 hover:text-white transition-colors ${selectedScreenSize=='mobile'? 'bg-white/20 border border-blue-500':'border border-white/20'}`}
            onClick={()=>setSelectedScreenSize('mobile')}><TabletSmartphone className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} /></Button>
        </div>
        <div className='flex gap-2 justify-center'>
          <Button variant={'outline'}
          size={isMobile ? 'sm' : 'default'}
          className='bg-white/10 text-white border-white/20 hover:bg-white/30 hover:text-white hover:border-white/30 transition-colors'
          onClick={()=>ViewInNewTab()}
          >{isMobile ? <SquareArrowOutUpRight className='h-4 w-4' /> : <><span>View</span><SquareArrowOutUpRight className='ml-2 h-4 w-4' /></>}</Button>
          <ViewCodeBlock code={finalCode}>
            <Button size={isMobile ? 'sm' : 'default'} className='bg-blue-600 hover:bg-blue-700 text-white transition-colors'>{isMobile ? <Code2Icon className='h-4 w-4' /> : <><span>Code</span><Code2Icon className='ml-2 h-4 w-4' /></>}</Button>
          </ViewCodeBlock>
          <Button size={isMobile ? 'sm' : 'default'} onClick={downloadCode} className='bg-blue-600 hover:bg-blue-700 text-white transition-colors'>{isMobile ? <Download className='h-4 w-4' /> : <><span>Download</span><Download className='ml-2 h-4 w-4' /></>}</Button>
        </div>
    </div>
  )
}

export default WebPageTools