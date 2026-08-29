import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL('https://bloom-ai-builder.vercel.app'),
  title: "Bloom — AI Website Builder",
  description: "Turn ideas into beautiful, production-ready websites with Bloom's AI-powered website builder. Generate, edit, and export modern web applications instantly.",
  applicationName: "Bloom",
  keywords: ["Bloom", "AI website builder", "web design", "React", "Next.js", "Tailwind CSS", "generative UI"],
  openGraph: {
    title: "Bloom — AI Website Builder",
    description: "From idea to website, instantly. Generate, edit, and deploy production-ready web designs with AI.",
    siteName: "Bloom",
    type: "website",
    images: [
      {
        url: '/logo-main.png',
        width: 1024,
        height: 1024,
        alt: 'Bloom — AI Website Builder',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloom — AI Website Builder",
    description: "Turn ideas into beautiful, production-ready websites with Bloom's AI-powered website builder.",
    images: ['/logo-main.png'],
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

const outfit = Outfit({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['300', '400', '500', '700', '800'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/workspace"
      signUpFallbackRedirectUrl="/workspace"
      appearance={{
        theme: dark,
        variables: {
          colorBackground: '#171717',
          colorPrimary: '#ffffff',
          colorPrimaryForeground: '#000000',
          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
          borderRadius: '0.875rem',
        },
        elements: {
          card: 'bg-[#171717] border border-white/20 text-white rounded-2xl shadow-2xl backdrop-blur-2xl font-mono',
          headerTitle: 'text-white font-mono font-bold text-xl',
          headerSubtitle: 'text-zinc-400 font-mono text-xs',
          socialButtonsBlockButton: 'bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 text-white font-mono rounded-xl transition-all',
          socialButtonsBlockButtonText: '!text-white font-mono font-medium text-xs',
          badge: 'bg-white/10 text-white text-[10px] font-mono border border-white/20',
          dividerLine: 'bg-white/15',
          dividerText: 'text-zinc-400 font-mono text-xs uppercase tracking-wider',
          formFieldLabel: 'text-zinc-200 font-mono text-xs font-medium',
          formFieldInput: 'bg-zinc-900/90 border border-white/20 text-white font-mono text-xs rounded-xl focus:border-white/50 focus:ring-1 focus:ring-white/20',
          formButtonPrimary: 'bg-white text-black hover:bg-zinc-200 font-mono font-bold text-xs rounded-xl transition-colors py-3',
          footerActionLink: 'text-white hover:text-zinc-300 font-mono underline font-semibold',
          footerActionText: 'text-zinc-400 font-mono text-xs',
          footer: 'bg-transparent border-t border-white/10',
        }
      }}
    >
      <html lang="en">
        <body
          className={`${outfit.className} ${jetbrainsMono.variable}`}
          suppressHydrationWarning
        >
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
