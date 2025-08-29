import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useConnections, useFiles } from '@/hooks/use-files';
import type { FileResource } from '@/lib/types/api';
import type { FileSearchFilters } from '@/components/ui/file-search-bar';

export function useFileExplorer() {
  // State management
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

  // API queries
  const { 
    data: connections, 
    isLoading: connectionsLoading, 
    error: connectionsError 
  } = useConnections();

  const connectionId = connections?.[0]?.connection_id;
  const { 
    data: filesResponse, 
    isLoading: filesLoading, 
    refetch: refetchFiles 
  } = useFiles(connectionId || '', {});

  const queryClient = useQueryClient();
  const files: FileResource[] = filesResponse?.data || [];

  // Initialize file statuses when API data loads
  useEffect(() => {
    if (filesResponse?.data) {
      const initialStatuses: Record<string, string> = {};
      filesResponse.data.forEach(file => {
        if (file.status) {
          initialStatuses[file.resource_id] = file.status;
        }
      });
      setFileStatuses(initialStatuses);
    }
  }, [filesResponse?.data]);

  // Mutations
  const indexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      console.log('📝 Starting indexing for resource:', resourceId);
      // TODO: In a real implementation, this would:
      // 1. Create or update a knowledge base with the selected files
      // 2. Trigger a sync to start indexing
      // 3. The API endpoint would be: POST /knowledge_bases
      // For now, we'll simulate the success
      return Promise.resolve();
    },
    onSuccess: (_, { resourceId }) => {
      console.log('📝 Indexing success for resource:', resourceId);
      setFileStatuses(prev => ({
        ...prev,
        [resourceId]: 'indexed'
      }));
      toast.success('File added to Knowledge Base!');
    },
    onError: (error) => {
      toast.error('Failed to add file to Knowledge Base. Please try again.');
      console.error('Indexing error:', error);
    },
  });

  const deindexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      console.log('🔄 Starting de-indexing for resource:', resourceId);
      // TODO: In a real implementation, this would:
      // 1. Remove the file from the knowledge base
      // 2. The API endpoint would be: DELETE /knowledge_bases/{kb_id}/resources
      // For now, we'll simulate the success
      return Promise.resolve();
    },
    onSuccess: (_, { resourceId }) => {
      console.log('🔄 De-indexing success for resource:', resourceId);
      setFileStatuses(prev => ({
        ...prev,
        [resourceId]: 'deindexed'
      }));
      toast.success('File removed from Knowledge Base!');
    },
    onError: (error) => {
      toast.error('Failed to remove file from Knowledge Base. Please try again.');
      console.error('De-indexing error:', error);
    },
  });

  const removeFromListingMutation = useMutation({
    mutationFn: async ({ resourcePath }: { resourcePath: string }) => {
      console.log('🗑️ Remove from listing success for resource:', resourcePath);
      // TODO: In a real implementation, this would:
      // 1. Remove the file from the knowledge base
      // 2. The API endpoint would be: DELETE /knowledge_bases/{kb_id}/resources
      // For now, we'll simulate the success
      return Promise.resolve();
    },
    onSuccess: (_, { resourcePath }) => {
      console.log('🗑️ Remove from listing success for resource:', resourcePath);
      setFileStatuses(prev => {
        const newStatuses = { ...prev };
        Object.keys(newStatuses).forEach(key => {
          if (key === resourcePath) {
            delete newStatuses[key];
          }
        });
        return newStatuses;
      });
      toast.success('File removed from listing!');
    },
    onError: (error) => {
      toast.error('Failed to remove file from listing. Please try again.');
      console.error('Remove from listing error:', error);
    },
  });

  // Event handlers
  const handleFiltersChange = useCallback((filters: FileSearchFilters) => {
    setSearchFilters(filters);
  }, []);

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked');
    console.log('🔄 Current connectionId:', connectionId);
    console.log('🔄 Current files count:', files.length);
    refetchFiles();
  };

  const handleBulkIndex = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for indexing');
      return;
    }

    console.log('📝 Starting bulk indexing for:', selectedFiles.size, 'files');
    
    try {
      await Promise.all(
        Array.from(selectedFiles).map(resourceId => 
          indexMutation.mutateAsync({ resourceId })
        )
      );
      
      toast.success(`Successfully indexed ${selectedFiles.size} files!`);
      setSelectedFiles(new Set());
    } catch (error) {
      toast.error('Failed to index some files. Please try again.');
      console.error('Bulk indexing error:', error);
    }
  };

  // Helper functions
  const getFileName = (file: FileResource) => {
    return file.inode_path?.name || file.inode_path?.path?.split('/').pop() || 'Unknown';
  };

  const getFileSize = (file: FileResource) => {
    if (file.inode_type === 'directory') return '--';
    if (file.size !== undefined && file.size !== null) {
      // Import formatFileSize dynamically to avoid circular dependencies
      const { formatFileSize } = require('@/lib/api/files');
      return formatFileSize(file.size);
    }
    return 'Unknown';
  };

  const getDisplayStatus = (file: FileResource) => {
    if (file.inode_type === 'directory') {
      return fileStatuses[file.resource_id] || file.status || 'no-status';
    }
    const status = fileStatuses[file.resource_id] || file.status || 'not-indexed';
    return status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'indexed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'deindexed':
        return 'outline';
      case 'not-indexed':
        return 'outline';
      case 'no-status':
        return 'no-border';
      default:
        return 'no-border';
    }
  };

  const getFileTypeIcon = (file: FileResource) => {
    if (file.inode_type === 'directory') {
      return 'folder';
    }

    const fileName = file.inode_path?.name || file.inode_path?.path || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'document';
      case 'txt':
        return 'text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return 'video';
      case 'mp3':
      case 'wav':
      case 'flac':
        return 'audio';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return 'code';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'archive';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'presentation';
      default:
        return 'file';
    }
  };

  // Folder functions
  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const isFolderExpanded = (folderId: string) => {
    return expandedFolders.has(folderId);
  };

  const getFilesInFolder = (folderPath: string) => {
    return files.filter(file => 
      file.inode_path?.path?.startsWith(folderPath + '/') && 
      file.inode_type === 'file'
    );
  };

  // Selection functions
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAllFiles = () => {
    const allFileIds = files.map(file => file.resource_id);
    setSelectedFiles(new Set(allFileIds));
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const isAllSelected = selectedFiles.size === files.length && files.length > 0;
  const isIndeterminate = selectedFiles.size > 0 && selectedFiles.size < files.length;

  // Filter and sort files
  const filteredAndSortedFiles = files
    .filter(file => {
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        const fileName = getFileName(file).toLowerCase();
        if (!fileName.includes(query)) {
          return false;
        }
      }

      if (searchFilters.fileType !== 'all') {
        if (searchFilters.fileType === 'files' && file.inode_type !== 'file') {
          return false;
        }
        if (searchFilters.fileType === 'folders' && file.inode_type !== 'directory') {
          return false;
        }
      }

      if (searchFilters.indexStatus !== 'all') {
        const fileStatus = getDisplayStatus(file);
        if (searchFilters.indexStatus !== fileStatus) {
          return false;
        }
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

  return {
    // State
    searchFilters,
    viewMode,
    selectedFiles,
    fileStatuses,
    expandedFolders,
    files,
    filteredAndSortedFiles,
    
    // Loading states
    connectionsLoading,
    filesLoading,
    connectionsError,
    
    // Mutations
    indexMutation,
    deindexMutation,
    removeFromListingMutation,
    
    // Event handlers
    handleFiltersChange,
    handleRefresh,
    handleBulkIndex,
    
    // Helper functions
    getFileName,
    getFileSize,
    getDisplayStatus,
    getStatusBadgeVariant,
    getFileTypeIcon,
    
    // Folder functions
    toggleFolderExpansion,
    isFolderExpanded,
    getFilesInFolder,
    
    // Selection functions
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
    isAllSelected,
    isIndeterminate,
    
    // Actions
    setViewMode,
    setSelectedFiles,
  };
}
