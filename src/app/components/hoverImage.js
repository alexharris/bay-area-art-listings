import { useState } from 'react';

export default function HoverImage({ listings }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const getRandomPosition = () => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Image dimensions (matching the CSS class w-80 h-80 = 320px x 320px)
    const imageWidth = 320;
    const imageHeight = 320;
    
    // Calculate random position within viewport, with some padding
    const padding = 20;
    const maxX = viewportWidth - imageWidth - padding;
    const maxY = viewportHeight - imageHeight - padding;
    
    const x = Math.max(padding, Math.random() * maxX);
    const y = Math.max(padding, Math.random() * maxY);
    
    return { x, y };
  };

  const handleMouseEnter = (index) => {
    if (listings[index]?.eventImageUrl) {
      setImagePosition(getRandomPosition());
      setHoveredItem(index);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return {
    hoveredItem,
    handleMouseEnter,
    handleMouseLeave,
    ImageDisplay: () => (
      <>
        {hoveredItem !== null && listings[hoveredItem]?.eventImageUrl && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${imagePosition.x}px`,
              top: `${imagePosition.y}px`,
            }}
          >
            <img 
              src={listings[hoveredItem].eventImageUrl} 
              alt={listings[hoveredItem].Event}
              className="w-80 h-80 object-contain"
            />
          </div>
        )}
      </>
    )
  };
}
