'use client'

import { Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const sortOptions = [
    { value: 'closingSoon', label: 'End Date' },
    { value: 'openingSoon', label: 'Start Date' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'recentlyAdded', label: 'Recently Added' },
];

export default function MobileSortDrawer({ mobileSortOpen, setMobileSortOpen, sortMethod, setSortMethod }) {
    return (
        <Drawer open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
            <DrawerContent className="px-0 pb-[env(safe-area-inset-bottom)]">
                <DrawerHeader className="px-4 pb-2">
                    <DrawerTitle>Sort by</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            className="flex flex-row items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-left"
                            onClick={() => {
                                setSortMethod(option.value);
                                setMobileSortOpen(false);
                            }}
                        >
                            <span className="text-sm">{option.label}</span>
                            {sortMethod === option.value && (
                                <Check size={18} className="text-gray-900" />
                            )}
                        </button>
                    ))}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
