import { useState, useEffect } from 'react';
import type { FileResource } from '@/lib/types/api';

export interface FileSearchFilters {
  query: string;
  sortBy: 'name' | 'date';
  sortOrder: 'asc' | 'desc';
  fileType: 'all' | 'files' | 'folders';
  indexStatus: 'all' | 'indexed' | 'pending' | 'error' | 'deindexed' | 'not-indexed' | 'no-status';
}

export function useFileState() {
  // Core file state
  const [searchFilters, setSearchFilters] = useState<FileSearchFilters>({
    query: '',
    sortBy: 'name',
    sortOrder: 'asc',
    fileType: 'all',
    indexStatus: 'all',
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Loading states
  const [isBulkIndexing, setIsBulkIndexing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Folder state
  const [folderContents, setFolderContents] = useState<Record<string, FileResource[]>>({});
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [nestedFolderContents, setNestedFolderContents] = useState<Record<string, FileResource[]>>({});

  // Initialize file statuses when API data loads
  const initializeFileStatuses = (files: FileResource[]) => {
    const initialStatuses: Record<string, string> = {};
    files.forEach(file => {
      if (file.status) {
        initialStatuses[file.resource_id] = file.status;
      }
    });
    setFileStatuses(initialStatuses);
  };

  // Reset all state
  const resetState = () => {
    setFolderContents({});
    setExpandedFolders(new Set());
    setSelectedFiles(new Set());
    setFileStatuses({});
  };

  return {
    // State
    searchFilters,
    viewMode,
    selectedFiles,
    fileStatuses,
    expandedFolders,
    folderContents,
    loadingFolders,
    nestedFolderContents,
    isBulkIndexing,
    isRefreshing,
    
    // Setters
    setSearchFilters,
    setViewMode,
    setSelectedFiles,
    setFileStatuses,
    setExpandedFolders,
    setFolderContents,
    setLoadingFolders,
    setNestedFolderContents,
    setIsBulkIndexing,
    setIsRefreshing,
    
    // Actions
    initializeFileStatuses,
    resetState,
  };
}
