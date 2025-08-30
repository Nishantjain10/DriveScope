import { useCallback } from 'react';
import { toast } from 'sonner';
import { listFiles } from '@/lib/api/files';
import type { FileResource } from '@/lib/types/api';

export interface FolderNavigation {
  id: string;
  name: string;
}

export function useFileNavigation(
  connectionId: string | undefined,
  setCurrentFolderContents: (contents: FileResource[]) => void,
  setCurrentFolderId: (id: string | null) => void,
  setNavigationStack: (updater: (prev: FolderNavigation[]) => FolderNavigation[]) => void,
  setFolderContents: (updater: (prev: Record<string, FileResource[]>) => Record<string, FileResource[]>) => void,
  setLoadingFolders: (updater: (prev: Set<string>) => Set<string>) => void,
  folderContents: Record<string, FileResource[]>,
  loadingFolders: Set<string>,
  setExpandedFolders: (updater: (prev: Set<string>) => Set<string>) => void
) {
  // Get direct folder contents
  const getDirectFolderContents = useCallback(async (folderId: string): Promise<FileResource[]> => {
    try {
      const response = await listFiles(connectionId!, { resource_id: folderId });
      return response.data || [];
    } catch (error) {
      return [];
    }
  }, [connectionId]);

  // Navigate to folder
  const navigateToFolder = useCallback(async (folderId: string, folderName: string) => {
    // Prevent duplicate navigation to the same folder
    if (loadingFolders.has(folderId)) {
      return; // Already loading this folder, do nothing
    }

    setLoadingFolders(prev => new Set([...prev, folderId]));

    try {
      const contents = await getDirectFolderContents(folderId);
      setCurrentFolderContents(contents);
      setCurrentFolderId(folderId);
      setNavigationStack(prev => [...prev, { id: folderId, name: folderName }]);

      setFolderContents(prev => ({
        ...prev,
        [folderId]: contents
      }));
    } catch (error) {
      toast.error('Failed to open folder');
    } finally {
      setLoadingFolders(prev => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    }
  }, [getDirectFolderContents, loadingFolders, setCurrentFolderContents, setCurrentFolderId, setNavigationStack, setFolderContents, setLoadingFolders]);

  // Navigate to breadcrumb location without adding to stack (like Windows Explorer)
  const navigateToBreadcrumb = useCallback(async (targetStack: FolderNavigation[], targetFolder: FolderNavigation) => {
    // Prevent multiple rapid clicks by checking if already loading
    if (loadingFolders.has(targetFolder.id)) {
      return; // Already loading this folder, do nothing
    }

    setLoadingFolders(prev => new Set([...prev, targetFolder.id]));

    try {
      const contents = await getDirectFolderContents(targetFolder.id);
      setCurrentFolderContents(contents);
      setCurrentFolderId(targetFolder.id);
      // Replace the entire navigation stack with the target stack (no duplicates)
      setNavigationStack(() => targetStack);

      setFolderContents(prev => ({
        ...prev,
        [targetFolder.id]: contents
      }));
    } catch (error) {
      toast.error('Failed to open folder');
    } finally {
      setLoadingFolders(prev => {
        const next = new Set(prev);
        next.delete(targetFolder.id);
        return next;
      });
    }
  }, [getDirectFolderContents, loadingFolders, setCurrentFolderContents, setCurrentFolderId, setNavigationStack, setFolderContents, setLoadingFolders]);

  // Navigate back
  const navigateBack = useCallback((files: FileResource[], currentFolderId: string | null, navigationStack: FolderNavigation[]) => {
    const newStack = navigationStack.slice(0, -1);
    setNavigationStack(() => newStack);

    if (newStack.length === 0) {
      setCurrentFolderId(null);
      setCurrentFolderContents(files);
    } else {
      const parentFolder = newStack[newStack.length - 1];
      setCurrentFolderId(parentFolder.id);
      if (folderContents[parentFolder.id]) {
        setCurrentFolderContents(folderContents[parentFolder.id]);
      } else {
        setLoadingFolders(prev => new Set([...prev, parentFolder.id]));
        getDirectFolderContents(parentFolder.id).then(contents => {
          setFolderContents(prev => ({
            ...prev,
            [parentFolder.id]: contents
          }));
          setCurrentFolderContents(contents);
          setLoadingFolders(prev => {
            const next = new Set(prev);
            next.delete(parentFolder.id);
            return next;
          });
        });
      }
    }
  }, [folderContents, setCurrentFolderContents, setCurrentFolderId, setNavigationStack, setFolderContents, setLoadingFolders, getDirectFolderContents]);

  // Auto load folder contents
  const autoLoadFolderContents = useCallback(async (folderId: string, setSelectedFiles: (updater: (prev: Set<string>) => Set<string>) => void) => {
    if (!connectionId || folderContents[folderId]) return;

    setLoadingFolders(prev => new Set([...prev, folderId]));

    try {
      const directFiles = await getDirectFolderContents(folderId);

      setFolderContents(prev => ({
        ...prev,
        [folderId]: directFiles
      }));

      setSelectedFiles(prev => {
        if (!prev.has(folderId)) return prev;
        const next = new Set(prev);
        directFiles.forEach(f => next.add(f.resource_id));
        return next;
      });
    } catch (error) {
      // no op
    } finally {
      setLoadingFolders(prev => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    }
  }, [connectionId, folderContents, getDirectFolderContents, setFolderContents, setLoadingFolders]);

  // Toggle folder expansion
  const toggleFolderExpansion = useCallback(async (folderId: string, setSelectedFiles: (updater: (prev: Set<string>) => Set<string>) => void, setExpandedFolders: (updater: (prev: Set<string>) => Set<string>) => void) => {
    // Check if folder is currently expanded
    const isCurrentlyExpanded = folderContents[folderId] && folderContents[folderId].length > 0;
    
    if (isCurrentlyExpanded) {
      // Folder is expanded, collapse it by removing from expandedFolders
      setExpandedFolders(prev => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
      return;
    }

    // Folder is collapsed, expand it by loading contents and adding to expandedFolders
    setLoadingFolders(prev => new Set([...prev, folderId]));
    try {
      const directFiles = await getDirectFolderContents(folderId);
      setFolderContents(prev => ({
        ...prev,
        [folderId]: directFiles
      }));

      // Add to expandedFolders
      setExpandedFolders(prev => new Set([...prev, folderId]));

      setSelectedFiles(prev => {
        if (!prev.has(folderId)) return prev;
        const next = new Set(prev);
        directFiles.forEach(subFile => next.add(subFile.resource_id));
        return next;
      });
    } catch (error) {
      toast.error('Failed to load folder contents');
    } finally {
      setLoadingFolders(prev => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    }
  }, [folderContents, getDirectFolderContents, setFolderContents, setLoadingFolders, setExpandedFolders]);

  // Check if folder is expanded
  const isFolderExpanded = useCallback((folderId: string, expandedFolders: Set<string>) => {
    return expandedFolders.has(folderId);
  }, []);

  // Get files in folder
  const getFilesInFolder = useCallback((folderId: string) => {
    return folderContents[folderId] || [];
  }, [folderContents]);

  // Check if folder is loading
  const isFolderLoading = useCallback((folderId: string) => {
    return loadingFolders.has(folderId);
  }, [loadingFolders]);

  return {
    // Navigation functions
    navigateToFolder,
    navigateToBreadcrumb,
    navigateBack,
    
    // Folder management
    toggleFolderExpansion,
    isFolderExpanded,
    getFilesInFolder,
    isFolderLoading,
    autoLoadFolderContents,
    
    // Helper functions
    getDirectFolderContents,
  };
}
