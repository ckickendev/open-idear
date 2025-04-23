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

// export default function App() {
//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Hover Tooltip Example</h1>
//       <p className="mb-12">Hover over the elements below to see their tooltips in the top-right position:</p>
      
//       <div className="space-y-12">
//         <HoverTooltip tooltipText="This is a special feature that unlocks premium content. Available to subscribers only.">
//           <div className="inline-block p-3 bg-blue-100 border border-blue-300 rounded cursor-help">
//             Hover over me to see feature info
//           </div>
//         </HoverTooltip>
        
//         <div className="block">
//           <HoverTooltip tooltipText="The price includes all taxes and shipping costs. Delivery within 3-5 business days.">
//             <button className="px-4 py-2 bg-green-500 text-white rounded">
//               Purchase ($29.99)
//             </button>
//           </HoverTooltip>
//         </div>
        
//         <p>
//           Our latest product comes with 
//           <HoverTooltip tooltipText="The advanced algorithm uses machine learning to optimize performance based on your usage patterns.">
//             <span className="mx-1 text-blue-600 underline cursor-help">smart optimization</span>
//           </HoverTooltip>
//           for the best experience.
//         </p>
//       </div>
//     </div>
//   );
// }