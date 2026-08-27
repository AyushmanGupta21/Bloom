"use client"
import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext'
import { SignInButton, useAuth, useUser } from '@clerk/nextjs'
import axios from 'axios'
import { ArrowRight, ArrowUp, HomeIcon, ImagePlusIcon, Key, LayoutDashboard, Loader2Icon, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid';

const suggestion = [
    {
        label: 'Dashboard',
        prompt: 'Create an analytics dashboard to track customers and revenue data for a SaaS.',
        icon: LayoutDashboard
    },
    {
        label: 'SignUp Form',
        prompt: 'Create a modern sign up form with email, password fields, Google and Github login options, and terms checkbox.',
        icon: Key
    },
    {
        label: 'Hero',
        prompt: 'Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a tittle with a subtle gradient effect, subtitle, CTA, small social proof and an image.',
        icon: HomeIcon
    },
    {
        label: 'User Profile Card',
        prompt: 'Create a modern user profile card component for a social media website.',
        icon: UserIcon
    }

]


function Hero() {
    const { user } = useUser();
    const [userInput, setUserInput] = useState<string>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {has} = useAuth()
    const {userDetail, setUserDetail}=useContext(UserDetailContext);
    const hasUnlimitedAccess = has && has({ plan: 'unlimited' })

    const CreateNewProject = async () => {
        if(!user){
            // Store user input in sessionStorage before sign in
            sessionStorage.setItem('pendingProjectInput', userInput || '');
            return;
        }
        if(!hasUnlimitedAccess && userDetail?.credits!<=0){
            toast.error('You have no credits left. Please upgrade your plan');
            return;
        }
        setLoading(true);
        const projectId = uuidv4();
        const frameId = generateRandomFrameNumer();
        const messages = [
            {
                role: 'user',
                content: userInput
            }
        ]
        try {
            const result = await axios.post('/api/projects', {
                projectId: projectId,
                frameId: frameId,
                messages: messages,
                credits: userDetail?.credits
            });
            console.log(result.data);
            toast.success('Project Created!')
            //Navigate to Playground
            router.push(`/playground/${projectId}?frameId=${frameId}`)
            setUserDetail((prev:any)=>({
                ...prev,
                credits: prev?.credits!-1
            }));
            setLoading(false);
        } catch (e) {
            toast.error('Internal server error!')
            console.log(e)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (userInput?.trim()) {
                CreateNewProject();
            }
        }
    }

    return (
        <div className='flex flex-col items-center h-[80vh] justify-center px-4 md:px-0'>
            {/*Header & description*/}
            <h2 className='font-bold text-3xl md:text-5xl lg:text-6xl text-white text-center'>What Would You Like Bloom to Build?</h2>
            <p className='mt-2 text-base md:text-xl text-gray-400 text-center max-w-3xl'>Your imagination becomes reality with Bloom. Describe it and watch it build.</p>
            {/*input */}
            <div className='w-full max-w-2xl p-3 md:p-5 border mt-5 rounded-2xl mx-4 md:mx-0'>
                <textarea placeholder='Describe your page design'
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='w-full h-20 md:h-24 text-sm md:text-base focus:outline-none focus:ring-0 resize-none bg-transparent text-white placeholder:text-gray-400' />

                <div className='flex justify-between item-center'>
                    <Button variant={'ghost'} className='hover:bg-white/10'><ImagePlusIcon className='text-gray-300' /></Button>
                    {!user ? < SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                        <Button disabled={!userInput} onClick={CreateNewProject} className='bg-blue-600 hover:bg-blue-700 text-white'><ArrowUp /></Button>
                    </SignInButton> :


                        <Button disabled={!userInput || loading} onClick={CreateNewProject} className='bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400'>
                            {loading ? <Loader2Icon className='animate-spin' /> : <ArrowUp />} </Button>

                    }
                </div>

            </div>
            {/* suggestion list */}
            <div className='mt-4 flex flex-wrap gap-2 md:gap-3 justify-center px-4 md:px-0'>
                {suggestion.map((suggestion, index) => (
                    <Button key={index} variant={'outline'}
                        onClick={() => setUserInput(suggestion.prompt)}
                        className='text-xs md:text-sm'>
                        <suggestion.icon className='h-4 w-4 md:h-5 md:w-5' />
                        {suggestion.label}</Button>
                ))}
            </div>
        </div >
    )
}


export default Hero

const generateRandomFrameNumer = () => {
    const num = Math.floor(Math.random() * 10000);
    return num
}