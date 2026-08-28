
import { SignUp } from '@clerk/nextjs'
import FloatingLines from '@/components/FloatingLines'

export default function Page() {
    return (
        <div className='relative flex items-center justify-center min-h-screen py-8'>
            <div className="fixed inset-0 z-0" style={{ pointerEvents: 'auto' }}>
                <FloatingLines
                    enabledWaves={['top', 'middle', 'bottom']}
                    lineCount={5}
                    lineDistance={5}
                    bendRadius={5.0}
                    bendStrength={-1.5}
                    interactive={true}
                    parallax={true}
                />
            </div>
            <div className="relative z-10" style={{ pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }}>
                    <SignUp forceRedirectUrl="/workspace" signInUrl="/sign-in" />
                </div>
            </div>
        </div>
    )
}   