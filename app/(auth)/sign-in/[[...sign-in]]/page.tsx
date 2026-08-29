import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
    return (
        <main className='relative flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-black text-white font-mono overflow-hidden'>
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Brand Logo Header */}
            <div className="mb-6 relative z-10">
                <Link href="/" className="flex items-center gap-2.5 select-none hover:opacity-80 transition-opacity">
                    <Image src="/logo-transparent.png" alt="Bloom Logo" width={52} height={52} className="rounded-lg" />
                    <span className="text-xl font-bold font-mono tracking-tight text-white">Bloom</span>
                </Link>
            </div>

            {/* Centered High-Contrast Auth Card */}
            <div className="relative z-10 w-full max-w-md">
                <SignIn 
                    path="/sign-in"
                    routing="path"
                    signUpUrl="/sign-up"
                    fallbackRedirectUrl="/workspace"
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
                />
            </div>
        </main>
    )
}