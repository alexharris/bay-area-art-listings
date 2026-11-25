'use client'

export default function MobileViewToggleBar({ activeView, setActiveView, isMapView, setIsMapView }) {
    const activeClass = 'text-black font-medium bg-yellow-50';
    const inactiveClass = 'text-black';

    return (
        <div className="lg:hidden bg-white">
            <div className="flex items-stretch h-10">
                <button
                    onClick={() => setActiveView('exhibitions')}
                    className={`flex-1 flex items-center justify-center text-sm transition-colors border-r border-b border-gray-300 ${activeView === 'exhibitions' ? activeClass : inactiveClass}`}
                >
                    Exhibitions
                </button>
                <button
                    onClick={() => setActiveView('events')}
                    className={`flex-1 flex items-center justify-center text-sm transition-colors border-r border-b border-gray-300 ${activeView === 'events' ? activeClass : inactiveClass}`}
                >
                    Events
                </button>
                <div className="flex items-stretch border-b border-gray-300">
                    <button
                        onClick={() => setIsMapView(false)}
                        aria-pressed={!isMapView}
                        className={`px-4 flex items-center justify-center text-sm transition-colors ${!isMapView ? activeClass : inactiveClass}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setIsMapView(true)}
                        aria-pressed={isMapView}
                        className={`px-4 flex items-center justify-center text-sm transition-colors border-l border-gray-300 ${isMapView ? activeClass : inactiveClass}`}
                    >
                        Map
                    </button>
                </div>
            </div>
        </div>
    );
}
