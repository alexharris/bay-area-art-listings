'use client'

import { useEffect, useState } from 'react'

export default function MobileSidebarOverlay({ isOpen, onClose, children }) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Mount the component
      setShouldRender(true)
      // Trigger animation after a brief delay to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      // Start closing animation
      setIsAnimating(false)
      // Unmount after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 200) // Match this to your transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-50 lg:hidden transition-opacity duration-50 ${
          isAnimating ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed top-0 left-0 right-6 h-full bg-white z-50 lg:hidden"
        style={{
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 100ms ease-in-out'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="p-2 mr-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Close sidebar"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto md:pl-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
