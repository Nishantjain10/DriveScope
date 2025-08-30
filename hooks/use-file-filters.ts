import { useCallback } from 'react';
import type { FileResource } from '@/lib/types/api';
import type { FileSearchFilters } from './use-file-state';

export function useFileFilters() {
  // Get files to filter based on current context (root files or current folder contents)
  const getFilesToFilter = useCallback((
    currentFolderId: string | null,
    currentFolderContents: FileResource[],
    files: FileResource[],
    folderContents: Record<string, FileResource[]>,
    searchFilters: FileSearchFilters
  ) => {
    // Check if any filters are active (excluding sort-only filters)
    const hasActiveFilters = 
      searchFilters.query !== '' || 
      searchFilters.fileType !== 'all' || 
      searchFilters.indexStatus !== 'all';

    // If filters are active, do a global search across all loaded files
    if (hasActiveFilters) {
      const allFiles = new Set<FileResource>();
      
      // Add root files
      files.forEach(file => allFiles.add(file));
      
      // Add all files from loaded folder contents
      Object.values(folderContents).forEach(subFiles => {
        subFiles.forEach(subFile => allFiles.add(subFile));
      });
      
      return Array.from(allFiles);
    }
    
    // If no filters are active, use location-based filtering
    // If we're in a specific folder (grid view navigation), use current folder contents
    if (currentFolderId) {
      return currentFolderContents;
    }
    
    // Otherwise, use root files and filter out files that are in subfolders
    return files.filter(file => {
      const isInSubfolder = Object.values(folderContents).some(subFiles =>
        subFiles.some(subFile => subFile.resource_id === file.resource_id)
      );
      return !isInSubfolder;
    });
  }, []);

  // Filter and sort files
  const getFilteredAndSortedFiles = useCallback((
    files: FileResource[],
    searchFilters: FileSearchFilters,
    getFileName: (file: FileResource) => string,
    getDisplayStatus: (file: FileResource, fileStatuses: Record<string, string>) => string,
    fileStatuses: Record<string, string>
  ) => {
    return files
      .filter(file => {
        if (searchFilters.query) {
          const query = searchFilters.query.toLowerCase();
          const fileName = getFileName(file).toLowerCase();
          if (!fileName.includes(query)) return false;
        }

        if (searchFilters.fileType !== 'all') {
          if (searchFilters.fileType === 'files' && file.inode_type !== 'file') return false;
          if (searchFilters.fileType === 'folders' && file.inode_type !== 'directory') return false;
        }

        if (searchFilters.indexStatus !== 'all') {
          const fileStatus = getDisplayStatus(file, fileStatuses);
          if (searchFilters.indexStatus !== fileStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (searchFilters.sortBy === 'name') {
          const nameA = getFileName(a);
          const nameB = getFileName(b);
          comparison = nameA.localeCompare(nameB);
        } else if (searchFilters.sortBy === 'date') {
          const dateA = new Date(a.updated_at || a.created_at || Date.now()).getTime();
          const dateB = new Date(b.updated_at || b.created_at || Date.now()).getTime();
          comparison = dateA - dateB;
        }
        return searchFilters.sortOrder === 'desc' ? -comparison : comparison;
      });
  }, []);

  return {
    getFilesToFilter,
    getFilteredAndSortedFiles,
  };
}
