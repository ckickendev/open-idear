import { useState, ReactNode } from 'react';

interface HoverNoteProps {
  children: ReactNode;
  note: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const HoverNote = ({ children, note, position = 'top', className = '' }: HoverNoteProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
      default:
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {isHovered && (
        <div 
          className={`absolute z-50 ${getPositionClasses()}`}
        >
          <div className="bg-gray-800 text-white rounded px-3 py-2 shadow-lg whitespace-nowrap text-sm max-w-xs">
            {note}
            
            {/* Arrow for the tooltip */}
            {position === 'top' && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            )}
            {position === 'right' && (
              <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
            )}
            {position === 'bottom' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
            )}
            {position === 'left' && (
              <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};