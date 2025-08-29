"use client";

import React from 'react';

interface LoadingBarProps {
  className?: string;
}

export function LoadingBar({ className = '' }: LoadingBarProps) {
  return (
    <div className={`loading-bar-container h-1 mb-4 bg-[#F1F3F4] rounded-full overflow-hidden ${className}`}>
      <div className="loading-bar h-full bg-blue-500 rounded-full animate-[loading_1s_ease-in-out_infinite]" />
    </div>
  );
}
