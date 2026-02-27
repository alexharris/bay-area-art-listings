'use client'

import { Check, LayoutList, Map, Info } from 'lucide-react';
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

    const browseActive = !isMapView && !mobileAboutOpen;
    const mapActive = isMapView && !mobileAboutOpen;

    return (
        <>
            {/* Bottom navigation bar */}
            <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                <div className="flex flex-row items-center justify-around h-14">
                    {/* Browse tab */}
                    <button
                        onClick={() => { setIsMapView(false); setMobileAboutOpen(false); }}
                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${browseActive ? 'text-blue-600' : 'text-gray-500'}`}
                        aria-label="Browse listings"
                    >
                        <LayoutList size={20} />
                        <span className="text-[10px]">Browse</span>
                    </button>

                    {/* Map tab */}
                    <button
                        onClick={() => { setIsMapView(true); setMobileAboutOpen(false); }}
                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${mapActive ? 'text-blue-600' : 'text-gray-500'}`}
                        aria-label="Map view"
                    >
                        <Map size={20} />
                        <span className="text-[10px]">Map</span>
                    </button>

                    {/* About tab */}
                    <button
                        onClick={() => setMobileAboutOpen(true)}
                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${mobileAboutOpen ? 'text-blue-600' : 'text-gray-500'}`}
                        aria-label="About"
                    >
                        <Info size={20} />
                        <span className="text-[10px]">About</span>
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
                                    <Check size={18} className="text-blue-500" />
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
