import { useState } from 'react';

const HoverTooltip = ({ children, tooltipText } : any) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="absolute whitespace-nowrap z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg right-0 bottom-0 transform transform -translate-y-full">
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default HoverTooltip;