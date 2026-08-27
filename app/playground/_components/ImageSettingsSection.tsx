
"use client";
import React, { useRef, useState } from "react";
import {
    Image as ImageIcon,
    Crop,
    Expand,
    Image as ImageUpscale, // no lucide-react upscale, using Image icon
    ImageMinus,
    Loader2Icon,
    Images,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageKit from "imagekit";
type Props = {
    selectedEl: HTMLImageElement;
    clearSelection: () => void;
    isMobile?: boolean;
};

const transformOptions = [
    { label: "Smart Crop", value: "smartcrop", icon: <Crop />, transformation:'fo-auto' },
    { label: "DropShadow", value: "dropshadow", icon: <Images />, transformation: 'e-dropshadow' },
    { label: "Upscale", value: "upscale", icon: <ImageUpscale /> , transformation: 'e-upscale' },
    { label: "BG Remove", value: "bgremove", icon: <ImageMinus />, transformation: 'e-bgremove' },
];

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});
function ImageSettingSection({ selectedEl, clearSelection, isMobile }: Props) {
    const [altText, setAltText] = useState(selectedEl.alt || "");
    const [width, setWidth] = useState<number>(selectedEl.width || 300);
    const [height, setHeight] = useState<number>(selectedEl.height || 200);
    const [selectedImage, setSelectedImage] = useState<File>();
    const [loading, setLoading]=useState(false);
    const [borderRadius, setBorderRadius] = useState(
        selectedEl.style.borderRadius || "0px"
    );
    const [preview, setPreview] = useState(selectedEl.src || "");
    const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Toggle transform
    const toggleTransform = (value: string) => {
        setActiveTransforms((prev) =>
            prev.includes(value)
                ? prev.filter((t) => t !== value)
                : [...prev, value]
        );
    };



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveUploadedFile = async () => {
        if (selectedImage) {
            setLoading(true);
            const imageRef = await imagekit.upload({
                // @ts-ignore
                file: selectedImage, //required
                fileName: Date.now() + ".png", //required
                isPublished: true,
            })
            console.log(imageRef);
            // @ts-ignore
            selectedEl.setAttribute('src', imageRef?.url+"?tr=" );
            // @ts-ignore
            setPreview(imageRef?.url);
            setLoading(false);
        }
    }

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const GenerateAiImage=()=>{
        setLoading(true);
        const url=`https://ik.imagekit.io/ayushman21/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`
        setPreview(url);
        selectedEl.setAttribute('src',url );
    }

    const ApplyTransformation=(trValue:string)=>{
        setLoading(true);
        if(!preview.includes(trValue)){
            const url=preview+trValue+',';
            setPreview(url);
            selectedEl.setAttribute('src',url );
        }
        else{
            const url=preview.replaceAll(trValue+',','');
            setPreview(url);
            selectedEl.setAttribute('src',url );
        }
    }

    const handleClose = () => {
        if (selectedEl) {
            selectedEl.style.outline = '';
        }
        clearSelection();
    };

    return (
        <div className={`${
            isMobile ? 'w-full h-full' : 'w-96 max-h-[calc(100vh-120px)]'
        } bg-black/30 backdrop-blur-md border border-white/10 shadow-xl p-4 space-y-4 rounded-xl mt-2 mr-2 overflow-auto`}>
            <div className='flex justify-between items-center'>
                <h2 className="flex gap-2 items-center font-bold text-white">
                    <ImageIcon /> Image Settings
                </h2>
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleClose}
                    className='text-white hover:bg-white/20 h-8 w-8'
                >
                    <X className='h-5 w-5' />
                </Button>
            </div>

            {/* Preview (clickable) */}
            <div className="flex justify-center">
                <img
                    src={preview}
                    alt={altText}
                    className="max-h-40 object-contain border border-white/20 rounded cursor-pointer hover:opacity-80"
                    onClick={openFileDialog}
                    onLoad={()=>setLoading(false)}
                />
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Upload Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={saveUploadedFile}
                disabled={loading}
            >
              {loading&&<Loader2Icon className="animate-spin"/>}  Upload Image
            </Button>

            {/* Alt text */}
            <div>
                <label className="text-sm text-white">Prompt</label>
                <Input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Enter alt text"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={GenerateAiImage}
            disabled={loading}>
              {loading&&<Loader2Icon className="animate-spin"/>}  Generate AI Image
            </Button>

            {/* Transform Buttons */}
            <div>
                <label className="text-sm mb-1 block text-white">AI Transform</label>
                <div className="flex gap-2 flex-wrap">
                    <TooltipProvider>
                        {transformOptions.map((opt) => {
                            const applied = activeTransforms.includes(opt.value);
                            return (
                                <Tooltip key={opt.value}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={preview.includes(opt.transformation) ? "default" : "outline"}
                                            className={`flex items-center justify-center p-2 ${preview.includes(opt.transformation) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                            onClick={() => ApplyTransformation(opt.transformation)}
                                        >
                                            {opt.icon}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {opt.label} {applied && "(Applied)"}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </div>

            {/* Conditional Resize Inputs */}
            {activeTransforms.includes("resize") && (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-sm text-white">Width</label>
                        <Input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="mt-1 bg-white/10 border-white/20 text-white"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm text-white">Height</label>
                        <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="mt-1 bg-white/10 border-white/20 text-white"
                        />
                    </div>
                </div>
            )}

            {/* Border Radius */}
            <div>
                <label className="text-sm text-white">Border Radius</label>
                <Input
                    type="text"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    placeholder="e.g. 8px or 50%"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}

export default ImageSettingSection;

