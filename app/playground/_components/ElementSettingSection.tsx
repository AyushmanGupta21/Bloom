import { SwatchBook, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from '@/components/ui/button';

type Props = {
    selectedEl: HTMLElement,
    clearSelection: () => void;
    isMobile?: boolean;
}

function ElementSettingSection({ selectedEl, clearSelection, isMobile }: Props) {
    const [classes, setClasses] = useState<string[]>([]);
    const [newClass, setNewClass] = useState("");
    const [align, setAlign] = React.useState(
        selectedEl?.style?.textAlign
    );

    const applyStyle = (property: string, value: string) => {
        if (selectedEl) {
            selectedEl.style[property as any] = value;
        }
    };

    // Update alignment style when toggled
    React.useEffect(() => {
        if (selectedEl && align) {
            selectedEl.style.textAlign = align;
        }
    }, [align, selectedEl]);


    // Keep in sync if element classes are modified elsewhere
    useEffect(() => {
        if (!selectedEl) return;

        // set initial classes
        const currentClasses = selectedEl.className
            .split(" ")
            .filter((c) => c.trim() !== "");
        setClasses(currentClasses);

        // watch for future class changes
        const observer = new MutationObserver(() => {
            const updated = selectedEl.className
                .split(" ")
                .filter((c) => c.trim() !== "");
            setClasses(updated);
        });

        observer.observe(selectedEl, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [selectedEl]);

    // Remove a class
    const removeClass = (cls: string) => {
        const updated = classes.filter((c) => c !== cls);
        setClasses(updated);
        selectedEl.className = updated.join(" ");
    };

    // Add new class
    const addClass = () => {
        const trimmed = newClass.trim();
        if (!trimmed) return;
        if (!classes.includes(trimmed)) {
            const updated = [...classes, trimmed];
            setClasses(updated);
            selectedEl.className = updated.join(" ");
        }
        setNewClass("");
    };

    const handleClose = () => {
        if (selectedEl) {
            selectedEl.style.outline = '';
            selectedEl.removeAttribute('contenteditable');
        }
        clearSelection();
    };

    return (
        <div className={`${
            isMobile ? 'w-full h-full' : 'w-96 max-h-[calc(100vh-120px)] mt-2 mr-2'
        } bg-black/30 backdrop-blur-md border border-white/10 shadow-xl p-4 space-y-4 overflow-y-auto overflow-x-hidden rounded-xl`}>
            <div className='flex justify-between items-center'>
                <h2 className='flex gap-2 items-center font-bold text-white'>
                    <SwatchBook /> Settings
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

            {/* Font Size + Text Color inline */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className='text-sm text-white'>Font Size</label>
                    <Select defaultValue={selectedEl?.style?.fontSize || '24px'}
                        onValueChange={(value) => applyStyle('fontSize', value)}
                    >
                        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20 text-white">
                            {[...Array(53)].map((_, index) => (
                                <SelectItem value={index + 12 + 'px'} key={index}>
                                    {index + 12}px
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className='text-sm block text-white'>Text Color</label>
                    <input type='color'
                        className='w-[40px] h-[40px] rounded-lg mt-1'
                        value={selectedEl?.style?.color || '#000000'}
                        onChange={(event) => applyStyle('color', event.target.value)}
                    />
                </div>
            </div>

            {/* Text Alignment */}
            <div>
                <label className="text-sm mb-1 block text-white">Text Alignment</label>
                <ToggleGroup
                    type="single"
                    value={align}
                    onValueChange={setAlign}
                    className="bg-white/10 rounded-lg p-1 inline-flex w-full justify-between"
                >
                    <ToggleGroupItem value="left" className="p-2 rounded hover:bg-white/20 flex-1 text-white data-[state=on]:bg-blue-600">
                        <AlignLeft size={20} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" className="p-2 rounded hover:bg-white/20 flex-1 text-white data-[state=on]:bg-blue-600">
                        <AlignCenter size={20} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" className="p-2 rounded hover:bg-white/20 flex-1 text-white data-[state=on]:bg-blue-600">
                        <AlignRight size={20} />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Background Color + Border Radius inline */}
            <div className="flex items-center gap-4">
                <div>
                    <label className='text-sm block text-white'>Background</label>
                    <input type='color'
                        className='w-[40px] h-[40px] rounded-lg mt-1'
                        defaultValue={selectedEl?.style?.backgroundColor || '#ffffff'}
                        onChange={(event) => applyStyle('backgroundColor', event.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className='text-sm text-white'>Border Radius</label>
                    <Input type='text'
                        placeholder='e.g. 8px'
                        defaultValue={selectedEl?.style?.borderRadius || ''}
                        onChange={(e) => applyStyle('borderRadius', e.target.value)}
                        className='mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                    />
                </div>
            </div>

            {/* Padding */}
            <div>
                <label className='text-sm text-white'>Padding</label>
                <Input type='text'
                    placeholder='e.g. 10px 15px'
                    defaultValue={selectedEl?.style?.padding || ''}
                    onChange={(e) => applyStyle('padding', e.target.value)}
                    className='mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                />
            </div>

            {/* Margin */}
            <div>
                <label className='text-sm text-white'>Margin</label>
                <Input type='text'
                    placeholder='e.g. 10px 15px'
                    defaultValue={selectedEl?.style?.margin || ''}
                    onChange={(e) => applyStyle('margin', e.target.value)}
                    className='mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                />
            </div>

            {/* === Class Manager === */}

            <div>
                <label className="text-sm font-medium text-white">Classes</label>

                {/* Existing classes as removable chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {classes.length > 0 ? (
                        classes.map((cls) => (
                            <span
                                key={cls}
                                className="flex text-xs items-center gap-1 px-2 py-1 text-sm rounded-full bg-blue-600 text-white border border-blue-500"
                            >
                                {cls}
                                <button
                                    onClick={() => removeClass(cls)}
                                    className="ml-1 text-red-300 hover:text-red-100"
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm">No classes applied</span>
                    )}
                </div>

                {/* Add new class input */}
                <div className="flex gap-2 mt-3">
                    <Input
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        placeholder="Add class..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Button type="button" onClick={addClass} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add
                    </Button>
                </div>
            </div>



        </div>
    )
}

export default ElementSettingSection;

