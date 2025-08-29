"use client";

import React from 'react';

interface FileSkeletonProps {
  viewMode: 'list' | 'grid';
  count?: number;
}

export function FileSkeleton({ viewMode, count = 12 }: FileSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <div className="files-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i}
            className="file-card bg-white rounded-lg border border-[#EDEDF0] p-4 animate-pulse"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3" />
              <div className="w-2/3 h-4 bg-gray-200 rounded mb-2" />
              <div className="w-1/2 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="files-list bg-white rounded-lg border border-[#EDEDF0] overflow-hidden">
      <div className="p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i}
            className="flex items-center gap-4 py-3 animate-pulse"
          >
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="flex-1 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="w-1/4 h-4 bg-gray-200 rounded mb-1" />
              </div>
            </div>
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-8 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
