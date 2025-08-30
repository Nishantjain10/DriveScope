import { useCallback } from 'react';
import { toast } from 'sonner';
import type { FileResource } from '@/lib/types/api';

export function useFolderExpansion(
  connectionId: string | undefined,
  folderContents: Record<string, FileResource[]>,
  loadingFolders: Set<string>,
  setFolderContents: (updater: (prev: Record<string, FileResource[]>) => Record<string, FileResource[]>) => void,
  setLoadingFolders: (updater: (prev: Set<string>) => Set<string>) => void,
  setSelectedFiles: (updater: (prev: Set<string>) => Set<string>) => void,
  getDirectFolderContents: (folderId: string) => Promise<FileResource[]>
) {
  // Auto load folder contents
  const autoLoadFolderContents = useCallback(async (folderId: string) => {
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
  }, [connectionId, folderContents, setFolderContents, setLoadingFolders, setSelectedFiles, getDirectFolderContents]);

  // Toggle folder expansion
  const toggleFolderExpansion = async (folderId: string) => {
    if (folderContents[folderId]) {
      // Folder is already expanded, we'll handle collapsing in the parent component
      return;
    } else {
      // Folder is collapsed, expand it
      if (!folderContents[folderId] && connectionId) {
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
      }
    }
  };

  // Check if folder is expanded
  const isFolderExpanded = (folderId: string) => {
    return folderContents[folderId] !== undefined;
  };

  // Get files in folder
  const getFilesInFolder = (folderId: string) => folderContents[folderId] || [];

  // Check if folder is loading
  const isFolderLoading = (folderId: string) => loadingFolders.has(folderId);

  // Recursive count helper if you ever need totals
  const getAllFilesInFolderTree = useCallback(async (folderId: string, depth: number = 0): Promise<FileResource[]> => {
    if (depth > 5) return [];
    try {
      const response = await getDirectFolderContents(folderId);
      const files = response || [];
      const nestedFiles: FileResource[] = [];
      for (const file of files) {
        if (file.inode_type === 'directory') {
          const nestedResponse = await getAllFilesInFolderTree(file.resource_id, depth + 1);
          nestedFiles.push(...nestedResponse);
        }
      }
      return [...files, ...nestedFiles];
    } catch (error) {
      return [];
    }
  }, [getDirectFolderContents]);

  return {
    // Folder expansion functions
    toggleFolderExpansion,
    autoLoadFolderContents,
    
    // State helpers
    isFolderExpanded,
    getFilesInFolder,
    isFolderLoading,
    
    // Utility functions
    getAllFilesInFolderTree,
  };
}
