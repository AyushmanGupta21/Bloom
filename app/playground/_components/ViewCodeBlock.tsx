import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import SyntaxHighlighter from "react-syntax-highlighter"
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function ViewCodeBlock({ children, code }: any) {
    
    const handleCopy=async()=>{
        await navigator.clipboard.writeText(code);
        toast.success('Code Copied!')
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className='min-w-7xl max-h-[600px] overflow-auto'>
                <DialogHeader>
                    <DialogTitle>
                        <div className='flex gap-4 items-center'>
                            Source Code<Button onClick={handleCopy}><Copy /></Button>
                        </div>
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div>
                            <SyntaxHighlighter language="html" style={docco}>
                                {code}
                            </SyntaxHighlighter>
                        </div>

                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ViewCodeBlock