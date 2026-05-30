'use client'

export default function MobileViewToggleBar({ isMapView, setIsMapView }) {
    return (
        <div className="lg:hidden fixed inset-x-0 top-12 z-40 bg-white border-b border-gray-200">
            <div className="flex items-center px-4 h-10">
                <div className="flex items-center bg-gray-100 p-0.5 rounded-full">
                    <button
                        onClick={() => setIsMapView(false)}
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
                        onClick={() => setIsMapView(true)}
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
            </div>
        </div>
    );
}
