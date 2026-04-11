import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "text-primary", size = 32 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      <path 
        d="M 32 62 L 50 48 L 68 38" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="32" cy="62" r="4" fill="currentColor" />
      <circle cx="50" cy="48" r="4" fill="currentColor" />
      <circle cx="68" cy="38" r="4" fill="currentColor" />
    </svg>
  );
}
