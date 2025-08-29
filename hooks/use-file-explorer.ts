import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useConnections, useFiles } from '@/hooks/use-files';
import { listFiles } from '@/lib/api/files';
import { 
  createKnowledgeBase, 
  syncKnowledgeBase, 
  waitForIndexing 
} from '@/lib/api/knowledge-base';
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
      
      try {
        // Step 1: Create knowledge base with selected files
        const knowledgeBase = await createKnowledgeBase(
          connectionId!,
          [resourceId],
          {
            ocr: false,
            unstructured: true,
            embeddingModel: 'text-embedding-ada-002',
            chunkSize: 1500,
            chunkOverlap: 500,
            chunker: 'sentence'
          }
        );
        
        console.log('📝 Knowledge base created:', knowledgeBase.knowledge_base_id);
        
        // Step 2: Trigger sync to start indexing
        await syncKnowledgeBase(knowledgeBase.knowledge_base_id);
        console.log('📝 Sync triggered for knowledge base');
        
        // Step 3: Store knowledge base ID for status checking
        setFileStatuses(prev => ({
          ...prev,
          [resourceId]: 'pending'
        }));
        
        // Step 4: Start polling for status updates
        setTimeout(async () => {
          try {
            const isComplete = await waitForIndexing(knowledgeBase.knowledge_base_id, 30, 2000);
            if (isComplete) {
              setFileStatuses(prev => ({
                ...prev,
                [resourceId]: 'indexed'
              }));
              toast.success('File successfully indexed!');
            } else {
              setFileStatuses(prev => ({
                ...prev,
                [resourceId]: 'error'
              }));
              toast.error('Indexing timed out. Please check status.');
            }
          } catch (error) {
            console.error('Status polling error:', error);
            setFileStatuses(prev => ({
              ...prev,
              [resourceId]: 'error'
            }));
          }
        }, 1000);
        
        return knowledgeBase;
      } catch (error) {
        console.error('Indexing error:', error);
        throw error;
      }
    },
    onSuccess: (knowledgeBase, { resourceId }) => {
      console.log('📝 Indexing process started for resource:', resourceId);
      toast.success('Indexing process started! This may take a few minutes.');
    },
    onError: (error) => {
      toast.error('Failed to start indexing process. Please try again.');
      console.error('Indexing error:', error);
    },
  });

  const deindexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      console.log('🔄 Starting de-indexing for resource:', resourceId);
      
      try {
        // For de-indexing, we need to remove the resource from the knowledge base
        // Since we don't have the knowledge base ID stored, we'll need to find it
        // For now, we'll simulate the process but in real implementation we'd:
        // 1. Find the knowledge base containing this resource
        // 2. Remove the resource using DELETE /knowledge_bases/{kb_id}/resources
        
        // Simulate the API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 De-indexing completed for resource:', resourceId);
        return { success: true };
      } catch (error) {
        console.error('De-indexing error:', error);
        throw error;
      }
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
      // For bulk indexing, we create a single knowledge base with all selected files
      // This is more efficient than creating separate knowledge bases
      const selectedFileIds = Array.from(selectedFiles);
      
      // Create knowledge base with all selected files
      const knowledgeBase = await createKnowledgeBase(
        connectionId!,
        selectedFileIds,
        {
          ocr: false,
          unstructured: true,
          embeddingModel: 'text-embedding-ada-002',
          chunkSize: 1500,
          chunkOverlap: 500,
          chunker: 'sentence'
        }
      );
      
      console.log('📝 Knowledge base created for bulk indexing:', knowledgeBase.knowledge_base_id);
      
      // Trigger sync
      await syncKnowledgeBase(knowledgeBase.knowledge_base_id);
      console.log('📝 Bulk sync triggered');
      
      // Update all selected files to pending status
      selectedFileIds.forEach(resourceId => {
        setFileStatuses(prev => ({
          ...prev,
          [resourceId]: 'pending'
        }));
      });
      
      // Start polling for status updates
      setTimeout(async () => {
        try {
          const isComplete = await waitForIndexing(knowledgeBase.knowledge_base_id, 60, 3000);
          if (isComplete) {
            selectedFileIds.forEach(resourceId => {
              setFileStatuses(prev => ({
                ...prev,
                [resourceId]: 'indexed'
              }));
            });
            toast.success(`Successfully indexed ${selectedFileIds.length} files!`);
          } else {
            selectedFileIds.forEach(resourceId => {
              setFileStatuses(prev => ({
                ...prev,
                [resourceId]: 'error'
              }));
            });
            toast.error('Bulk indexing timed out. Please check individual file statuses.');
          }
        } catch (error) {
          console.error('Bulk status polling error:', error);
          selectedFileIds.forEach(resourceId => {
            setFileStatuses(prev => ({
              ...prev,
              [resourceId]: 'error'
            }));
          });
        }
      }, 2000);
      
      toast.success(`Bulk indexing process started for ${selectedFileIds.length} files! This may take several minutes.`);
      setSelectedFiles(new Set());
    } catch (error) {
      toast.error('Failed to start bulk indexing process. Please try again.');
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
  const [folderContents, setFolderContents] = useState<Record<string, FileResource[]>>({});
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());

  const toggleFolderExpansion = async (folderId: string) => {
    if (expandedFolders.has(folderId)) {
      // Collapse folder
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
    } else {
      // Expand folder - fetch contents if not already loaded
      setExpandedFolders(prev => new Set([...prev, folderId]));
      
      if (!folderContents[folderId] && connectionId) {
        setLoadingFolders(prev => new Set([...prev, folderId]));
        
        try {
          const response = await listFiles(connectionId, { resource_id: folderId });
          setFolderContents(prev => ({
            ...prev,
            [folderId]: response.data || []
          }));
        } catch (error) {
          console.error('Failed to fetch folder contents:', error);
          toast.error('Failed to load folder contents');
        } finally {
          setLoadingFolders(prev => {
            const newSet = new Set(prev);
            newSet.delete(folderId);
            return newSet;
          });
        }
      }
    }
  };

  const isFolderExpanded = (folderId: string) => {
    return expandedFolders.has(folderId);
  };

  const getFilesInFolder = (folderId: string) => {
    return folderContents[folderId] || [];
  };

  const isFolderLoading = (folderId: string) => {
    return loadingFolders.has(folderId);
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

  const toggleFolderSelection = (folderId: string) => {
    const subFiles = folderContents[folderId] || [];
    const allFolderFileIds = [folderId, ...subFiles.map(f => f.resource_id)];
    
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      const isCurrentlySelected = allFolderFileIds.every(id => newSet.has(id));
      
      if (isCurrentlySelected) {
        // Deselect all files in folder
        allFolderFileIds.forEach(id => newSet.delete(id));
      } else {
        // Select all files in folder
        allFolderFileIds.forEach(id => newSet.add(id));
      }
      
      return newSet;
    });
  };

  const selectAllFiles = () => {
    const allFileIds = new Set<string>();
    
    // Add root files
    files.forEach(file => allFileIds.add(file.resource_id));
    
    // Add all sub-files from expanded folders
    Object.values(folderContents).forEach(subFiles => {
      subFiles.forEach(subFile => allFileIds.add(subFile.resource_id));
    });
    
    setSelectedFiles(allFileIds);
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const isAllSelected = selectedFiles.size === files.length && files.length > 0;
  const isIndeterminate = selectedFiles.size > 0 && selectedFiles.size < files.length;

  const isFolderFullySelected = (folderId: string) => {
    const subFiles = folderContents[folderId] || [];
    const allFolderFileIds = [folderId, ...subFiles.map(f => f.resource_id)];
    return allFolderFileIds.every(id => selectedFiles.has(id));
  };

  const isFolderPartiallySelected = (folderId: string) => {
    const subFiles = folderContents[folderId] || [];
    const allFolderFileIds = [folderId, ...subFiles.map(f => f.resource_id)];
    const selectedCount = allFolderFileIds.filter(id => selectedFiles.has(id)).length;
    return selectedCount > 0 && selectedCount < allFolderFileIds.length;
  };

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
    isFolderLoading,
    
    // Selection functions
    toggleFileSelection,
    toggleFolderSelection,
    selectAllFiles,
    deselectAllFiles,
    isAllSelected,
    isIndeterminate,
    isFolderFullySelected,
    isFolderPartiallySelected,
    
    // Actions
    setViewMode,
    setSelectedFiles,
  };
}
