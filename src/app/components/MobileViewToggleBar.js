'use client'

export default function MobileViewToggleBar({ activeView, setActiveView }) {
    const activeClass = 'text-gray-900 font-medium';
    const inactiveClass = 'text-gray-400';

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
                <button
                    onClick={() => setActiveView('map')}
                    className={`flex-1 flex items-center justify-center text-sm transition-colors border-b border-gray-300 ${activeView === 'map' ? activeClass : inactiveClass}`}
                >
                    Map
                </button>
            </div>
        </div>
    );
}
