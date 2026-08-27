"use client"
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
  const {user} = useUser();
  return (
    <div className='flex items-center justify-between p-4 bg-black/30 backdrop-blur-md border-b border-white/10 font-mono'>
      {/* logo */}
      <div className='flex gap-2 items-center'>
        <Image src="/logo.svg" alt="Bloom Logo" width={32} height={32} className='rounded-lg' />
        <h2 className='font-bold text-xl text-white'>Bloom</h2>
      </div>
      {/* get started button */}
      <div>
        {!user ? <SignInButton mode='modal' 
        fallbackRedirectUrl={'/workspace'}>
          <Button className='bg-white hover:bg-zinc-200 text-black font-bold font-mono'>Get Started<ArrowRight /></Button>
        </SignInButton>
          :  
          <Link href={'/workspace'}>
          <Button className='bg-white hover:bg-zinc-200 text-black font-bold font-mono'>Get Started<ArrowRight /></Button>
          </Link>
        }
      </div>

    </div>
  )
}

export default Header
