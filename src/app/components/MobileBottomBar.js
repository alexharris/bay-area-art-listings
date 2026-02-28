'use client'

import { Check, Info } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AboutContent from './aboutContent';

const sortOptions = [
    { value: 'closingSoon', label: 'End Date' },
    { value: 'openingSoon', label: 'Start Date' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'recentlyAdded', label: 'Recently Added' },
];

export default function MobileBottomBar({
    // View state
    isMapView,
    setIsMapView,

    // About drawer
    mobileAboutOpen,
    setMobileAboutOpen,
    newsletterSettings,

    // Sort drawer
    mobileSortOpen,
    setMobileSortOpen,
    sortMethod,
    setSortMethod,

}) {

    return (
        <>
            {/* Bottom navigation bar */}
            <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                <div className="flex flex-row items-center justify-between px-4 h-14">

                    {/* List / Map segmented pill toggle */}
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-full">
                        <button
                            onClick={() => { setIsMapView(false); setMobileAboutOpen(false); }}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                !isMapView
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500'
                            }`}
                            aria-label="List view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                            List
                        </button>
                        <button
                            onClick={() => { setIsMapView(true); setMobileAboutOpen(false); }}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isMapView
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500'
                            }`}
                            aria-label="Map view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                            Map
                        </button>
                    </div>

                    {/* About — secondary icon button */}
                    <button
                        onClick={() => setMobileAboutOpen(true)}
                        className={`p-2 rounded-full transition-colors ${
                            mobileAboutOpen ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        aria-label="About"
                    >
                        <Info size={20} />
                    </button>

                </div>
            </nav>

            {/* Sort Drawer */}
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

            {/* About Drawer */}
            <Drawer open={mobileAboutOpen} onOpenChange={setMobileAboutOpen}>
                <DrawerContent className="max-h-[90vh] overflow-y-auto">
                    <DrawerHeader className="pb-2">
                        <DrawerTitle className="sr-only">About</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-8 space-y-6 overflow-y-auto">
                        <AboutContent />
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-semibold mb-1">{newsletterSettings?.title || 'Newsletter'}</h3>
                            {newsletterSettings?.description && (
                                <p className="text-sm text-muted-foreground mb-3">{newsletterSettings.description}</p>
                            )}
                            <form
                                action="https://buttondown.com/api/emails/embed-subscribe/artboard"
                                method="post"
                                className="embeddable-buttondown-form space-y-3"
                            >
                                <Input
                                    type="email"
                                    name="email"
                                    id="bd-email-mobile"
                                    placeholder="you@example.com"
                                    required
                                />
                                <Button type="submit" className="w-full">
                                    Subscribe
                                </Button>
                            </form>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
