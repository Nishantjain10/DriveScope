"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BreadcrumbNavProps {
  currentFolderId: string | null;
  navigationStack: Array<{ id: string; name: string; }>;
  navigateBack: () => void;
  navigateToFolder: (folderId: string, folderName: string) => void;
  navigateToBreadcrumb: (targetStack: Array<{ id: string; name: string }>, targetFolder: { id: string; name: string }) => void;
}

export function BreadcrumbNav({
  currentFolderId,
  navigationStack,
  navigateBack,
  navigateToFolder,
  navigateToBreadcrumb,
}: BreadcrumbNavProps) {
  return (
    <div className="folder-navigation mb-4 flex items-center gap-2 text-sm">
      {currentFolderId ? (
        <button
          onClick={navigateBack}
          className="back-button flex items-center gap-1 text-[#5F6368] hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      ) : (
        <span className="text-[#5F6368] font-medium">My Drive</span>
      )}
      {navigationStack.length > 0 && (
        <>
          <span className="text-[#5F6368]">/</span>
          {navigationStack.map((folder, index) => (
            <React.Fragment key={`${folder.id}-${index}`}>
              <button
                onClick={() => {
                  if (index < navigationStack.length - 1) {
                    // Navigate to this folder by slicing the stack up to this point
                    const targetStack = navigationStack.slice(0, index + 1);
                    const targetFolder = targetStack[targetStack.length - 1];
                    // Use navigateToBreadcrumb instead of navigateToFolder to avoid duplicates
                    navigateToBreadcrumb(targetStack, targetFolder);
                  }
                }}
                className={`${
                  index === navigationStack.length - 1 
                    ? 'text-[#202124] font-medium cursor-default'
                    : 'text-[#5F6368] hover:text-zinc-700 transition-colors'
                }`}
                disabled={index === navigationStack.length - 1}
              >
                {folder.name}
              </button>
              {index < navigationStack.length - 1 && (
                <span className="text-[#5F6368]">/</span>
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
}
