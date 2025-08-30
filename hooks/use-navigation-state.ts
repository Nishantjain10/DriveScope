import { useState, useCallback } from 'react';
import type { FileResource } from '@/lib/types/api';

export interface FolderNavigation {
  id: string;
  name: string;
}

export function useNavigationState() {
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [navigationStack, setNavigationStack] = useState<FolderNavigation[]>([]);
  const [currentFolderContents, setCurrentFolderContents] = useState<FileResource[]>([]);

  // Get current breadcrumb path
  const getCurrentPath = useCallback(() => {
    return navigationStack.map(folder => ({
      id: folder.id,
      name: folder.name,
    }));
  }, [navigationStack]);

  // Reset navigation
  const resetNavigation = () => {
    setCurrentFolderId(null);
    setNavigationStack([]);
    setCurrentFolderContents([]);
  };

  // Set initial folder contents
  const setInitialFolderContents = (files: FileResource[]) => {
    setCurrentFolderContents(files);
  };

  return {
    // State
    currentFolderId,
    navigationStack,
    currentFolderContents,
    
    // Setters
    setCurrentFolderId,
    setNavigationStack,
    setCurrentFolderContents,
    
    // Actions
    getCurrentPath,
    resetNavigation,
    setInitialFolderContents,
  };
}
