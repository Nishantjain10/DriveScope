import React from 'react';

interface PackageIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export function PackageIcon({ className = "", width = 16, height = 16 }: PackageIconProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path 
        d="M12 22V12L2 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path 
        d="M22 7L12 12L2 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
