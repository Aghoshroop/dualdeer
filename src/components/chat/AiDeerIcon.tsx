import React from 'react';

export const AiDeerIcon = ({ size = 24, className = '', color = 'currentColor' }: { size?: number, className?: string, color?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* AI Deer Geometric Face & Antlers */}
      <path d="M12 22l-5-7 2-8v-4h6v4l2 8-5 7z" />
      <path d="M5 13H2l2-5 3-1" />
      <path d="M19 13h3l-2-5-3-1" />
      
      {/* Cyber / AI Eyes or Core */}
      <circle cx="9" cy="11" r="1.5" fill={color} stroke="none" />
      <circle cx="15" cy="11" r="1.5" fill={color} stroke="none" />
      
      {/* AI nodes/connections */}
      <circle cx="2" cy="8" r="0.5" />
      <circle cx="22" cy="8" r="0.5" />
      <path d="M12 22v-6" strokeDasharray="2 2" />
      <path d="M12 5v2" strokeDasharray="1 2" />
    </svg>
  );
};
