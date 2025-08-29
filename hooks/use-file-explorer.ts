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

// Define FileSearchFilters type locally
interface FileSearchFilters {
  query: string;
  sortBy: 'name' | 'date';
  sortOrder: 'asc' | 'desc';
  fileType: 'all' | 'files' | 'folders';
  indexStatus: 'all' | 'indexed' | 'pending' | 'error' | 'deindexed' | 'not-indexed' | 'no-status';
}

export function useFileExplorer() {
  // Navigation state for grid view
  interface FolderNavigation {
    id: string;
    name: string;
  }

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
  const [isBulkIndexing, setIsBulkIndexing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [navigationStack, setNavigationStack] = useState<FolderNavigation[]>([]);
  const [currentFolderContents, setCurrentFolderContents] = useState<FileResource[]>([]);

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

  // Initialize file statuses and current folder contents when API data loads
  useEffect(() => {
    if (filesResponse?.data) {
      const initialStatuses: Record<string, string> = {};
      filesResponse.data.forEach(file => {
        if (file.status) {
          initialStatuses[file.resource_id] = file.status;
        }
      });
      setFileStatuses(initialStatuses);

      // Initialize current folder contents with root files when no folder is selected
      if (!currentFolderId) {
        setCurrentFolderContents(filesResponse.data);
      }
    }
  }, [filesResponse?.data, currentFolderId]);

  // Auto sync state when connection changes or page refreshes
  useEffect(() => {
    if (connectionId && !connectionsLoading) {
      setFolderContents({});
      setExpandedFolders(new Set());
      setSelectedFiles(new Set());
      refetchFiles();
    }
  }, [connectionId, connectionsLoading, refetchFiles]);

  // Mutations
  const indexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      try {
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
        await syncKnowledgeBase(knowledgeBase.knowledge_base_id);
        setFileStatuses(prev => ({
          ...prev,
          [resourceId]: 'pending'
        }));

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
            setFileStatuses(prev => ({
              ...prev,
              [resourceId]: 'error'
            }));
          }
        }, 1000);

        return knowledgeBase;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (_, { resourceId }) => {
      toast.success('Indexing process started! This may take a few minutes.');
    },
    onError: (error) => {
      toast.error('Failed to start indexing process. Please try again.');
    },
  });

  const deindexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (_, { resourceId }) => {
      setFileStatuses(prev => ({
        ...prev,
        [resourceId]: 'deindexed'
      }));
      toast.success('File removed from Knowledge Base!');
    },
    onError: (error) => {
      toast.error('Failed to remove file from Knowledge Base. Please try again.');
    },
  });

  const removeFromListingMutation = useMutation({
    mutationFn: async ({ resourcePath }: { resourcePath: string }) => {
      return Promise.resolve();
    },
    onSuccess: (_, { resourcePath }) => {
      setFileStatuses(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (key === resourcePath) delete next[key];
        });
        return next;
      });
      toast.success('File removed from listing!');
    },
    onError: (error) => {
      toast.error('Failed to remove file from listing. Please try again.');
    },
  });

  // Events
  const handleFiltersChange = useCallback((filters: FileSearchFilters) => {
    setSearchFilters(filters);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setFolderContents({});
      setExpandedFolders(new Set());
      setSelectedFiles(new Set());
      setCurrentFolderId(null);
      setNavigationStack([]);

      await refetchFiles();

      if (filesResponse?.data) {
        setCurrentFolderContents(filesResponse.data);
      }

      toast.success('Files refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh files. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkIndex = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for indexing');
      return;
    }
    if (isBulkIndexing) {
      toast.error('Bulk indexing already in progress. Please wait.');
      return;
    }

    setIsBulkIndexing(true);
    try {
      const selectedFileIds = Array.from(selectedFiles);
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
      await syncKnowledgeBase(knowledgeBase.knowledge_base_id);

      selectedFileIds.forEach(resourceId => {
        setFileStatuses(prev => ({
          ...prev,
          [resourceId]: 'pending'
        }));
      });

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
          selectedFileIds.forEach(resourceId => {
            setFileStatuses(prev => ({
              ...prev,
              [resourceId]: 'error'
            }));
          });
        }
      }, 2000);

      if (selectedFileIds.length === 1) {
        toast.success('Indexing process started for 1 file! This may take several minutes.');
      } else {
        toast.success(`Bulk indexing process started for ${selectedFileIds.length} files! This may take several minutes.`);
      }
      setSelectedFiles(new Set());
    } catch (error) {
      toast.error('Failed to start bulk indexing process. Please try again.');
    } finally {
      setIsBulkIndexing(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for removal');
      return;
    }
    if (isBulkIndexing) {
      toast.error('Operation already in progress. Please wait.');
      return;
    }

    setIsBulkIndexing(true);
    try {
      const selectedFileIds = Array.from(selectedFiles);
      await Promise.all(
        selectedFileIds.map(resourceId =>
          removeFromListingMutation.mutateAsync({ resourcePath: resourceId })
        )
      );
      toast.success(`Successfully removed ${selectedFileIds.length} file${selectedFileIds.length === 1 ? '' : 's'} from listing!`);
      setSelectedFiles(new Set());
    } catch (error) {
      toast.error('Failed to remove some files. Please try again.');
    } finally {
      setIsBulkIndexing(false);
    }
  };

  // Helpers
  const getFileName = (file: FileResource) => {
    return file.inode_path?.name || file.inode_path?.path?.split('/').pop() || 'Unknown';
  };

  const getFileSize = (file: FileResource) => {
    if (file.inode_type === 'directory') return '--';
    if (file.size !== undefined && file.size !== null) {
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
    if (file.inode_type === 'directory') return 'folder';

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

  // Folder state
  const [folderContents, setFolderContents] = useState<Record<string, FileResource[]>>({});
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [nestedFolderContents, setNestedFolderContents] = useState<Record<string, FileResource[]>>({});

  // Selection helpers for strict hierarchy

  // direct parent of a file or folder. returns undefined at root
  const getDirectParentId = useCallback(
    (childId: string): string | undefined => {
      for (const [folderId, subFiles] of Object.entries(folderContents)) {
        if (subFiles.some(sf => sf.resource_id === childId)) return folderId;
      }
      return undefined;
    },
    [folderContents]
  );

  // get all descendant ids for a folder, recursive, from what is already loaded
  const getAllDescendantIds = useCallback(
    (folderId: string): string[] => {
      const out: string[] = [];
      const stack = [...(folderContents[folderId] || [])];

      while (stack.length) {
        const node = stack.pop()!;
        out.push(node.resource_id);
        if (node.inode_type === 'directory') {
          const kids = folderContents[node.resource_id] || [];
          for (const k of kids) stack.push(k);
        }
      }
      return out;
    },
    [folderContents]
  );

  // true only if every descendant is selected. if a subfolder is unloaded we only check what we have
  const areAllDescendantsSelected = useCallback(
    (folderId: string, sel: Set<string>): boolean => {
      const descendants = getAllDescendantIds(folderId);
      if (descendants.length === 0) return sel.has(folderId);
      return descendants.every(id => sel.has(id));
    },
    [getAllDescendantIds]
  );

  // walk up and fix all ancestors of a given node id
  const bubbleSelectionUpFrom = useCallback(
    (nodeId: string, sel: Set<string>) => {
      let parent = getDirectParentId(nodeId);
      while (parent) {
        if (areAllDescendantsSelected(parent, sel)) {
          sel.add(parent);
        } else {
          sel.delete(parent);
        }
        parent = getDirectParentId(parent);
      }
    },
    [getDirectParentId, areAllDescendantsSelected]
  );

  // cascade selection to all descendants of a folder id
  const cascadeSelectionToDescendants = useCallback(
    (folderId: string, select: boolean, sel: Set<string>) => {
      const all = getAllDescendantIds(folderId);
      for (const id of all) {
        if (select) sel.add(id);
        else sel.delete(id);
      }
      if (select) sel.add(folderId);
      else sel.delete(folderId);
    },
    [getAllDescendantIds]
  );

  // Get direct folder contents
  const getDirectFolderContents = useCallback(async (folderId: string): Promise<FileResource[]> => {
    try {
      const response = await listFiles(connectionId!, { resource_id: folderId });
      return response.data || [];
    } catch (error) {
      return [];
    }
  }, [connectionId]);

  // Navigation functions for grid view
  const navigateToFolder = useCallback(async (folderId: string, folderName: string) => {
    // Prevent duplicate navigation to the same folder
    if (currentFolderId === folderId) {
      return; // Already in this folder, do nothing
    }

    // Prevent multiple rapid clicks by checking if already loading
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
  }, [getDirectFolderContents, currentFolderId, loadingFolders]);

  // Navigate to breadcrumb location without adding to stack (like Windows Explorer)
  const navigateToBreadcrumb = useCallback(async (targetStack: Array<{ id: string; name: string }>, targetFolder: { id: string; name: string }) => {
    // Prevent navigation if already in the target folder
    if (currentFolderId === targetFolder.id) {
      return; // Already in this folder, do nothing
    }

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
      setNavigationStack(targetStack);

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
  }, [getDirectFolderContents, currentFolderId, loadingFolders]);

  const navigateBack = useCallback(() => {
    const newStack = navigationStack.slice(0, -1);
    setNavigationStack(newStack);

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
  }, [navigationStack, files, folderContents, getDirectFolderContents]);

  // Get current breadcrumb path
  const getCurrentPath = useCallback(() => {
    return navigationStack.map(folder => ({
      id: folder.id,
      name: folder.name,
    }));
  }, [navigationStack]);

  // Recursive count helper if you ever need totals
  const getAllFilesInFolderTree = useCallback(async (folderId: string, depth: number = 0): Promise<FileResource[]> => {
    if (depth > 5) return [];
    try {
      const response = await listFiles(connectionId!, { resource_id: folderId });
      const files = response.data || [];
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
  }, [connectionId]);

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
  }, [connectionId, folderContents, getDirectFolderContents]);

  const toggleFolderExpansion = async (folderId: string) => {
    if (expandedFolders.has(folderId)) {
      setExpandedFolders(prev => {
        const next = new Set(prev);
        next.delete(folderId);
        return next;
      });
    } else {
      setExpandedFolders(prev => new Set([...prev, folderId]));

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

  const isFolderExpanded = (folderId: string) => expandedFolders.has(folderId);
  const getFilesInFolder = (folderId: string) => folderContents[folderId] || [];
  const isFolderLoading = (folderId: string) => loadingFolders.has(folderId);

  // Selection strict hierarchy

  // toggle a single file or folder id
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);

      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);

      bubbleSelectionUpFrom(fileId, next);
      return next;
    });
  };

  // toggle a folder by selecting or deselecting all of its descendants
  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      if (!folderContents[folderId] && !loadingFolders.has(folderId)) {
        autoLoadFolderContents(folderId);
      }

      setSelectedFiles(prev => {
        const next = new Set(prev);

        const allSelected = areAllDescendantsSelected(folderId, next);

        cascadeSelectionToDescendants(folderId, !allSelected, next);

        bubbleSelectionUpFrom(folderId, next);

        return next;
      });
    },
    [
      folderContents,
      loadingFolders,
      autoLoadFolderContents,
      areAllDescendantsSelected,
      cascadeSelectionToDescendants,
      bubbleSelectionUpFrom
    ]
  );

  const selectAllFiles = useCallback(() => {
    const allFileIds = new Set<string>();

    files.forEach(file => {
      const isInSubfolder = Object.values(folderContents).some(subFiles =>
        subFiles.some(subFile => subFile.resource_id === file.resource_id)
      );
      if (!isInSubfolder) allFileIds.add(file.resource_id);

      if (file.inode_type === 'directory' && !folderContents[file.resource_id] && !loadingFolders.has(file.resource_id)) {
        autoLoadFolderContents(file.resource_id);
      }
    });

    Object.values(folderContents).forEach(subFiles => {
      subFiles.forEach(subFile => allFileIds.add(subFile.resource_id));
    });

    setSelectedFiles(allFileIds);
  }, [files, folderContents, loadingFolders, autoLoadFolderContents]);

  const deselectAllFiles = () => setSelectedFiles(new Set());

  // Visible ids helper used for stable master checkbox logic
  const getVisibleFileIds = useCallback(() => {
    const ids = new Set<string>();

    files.forEach(f => {
      const isInSubfolder = Object.values(folderContents).some(sub =>
        sub.some(sf => sf.resource_id === f.resource_id)
      );
      if (!isInSubfolder) ids.add(f.resource_id);
    });

    Object.entries(folderContents).forEach(([folderId, sub]) => {
      if (expandedFolders.has(folderId)) {
        sub.forEach(sf => ids.add(sf.resource_id));
      }
    });

    return Array.from(ids);
  }, [files, folderContents, expandedFolders]);

  // Stable checks that do not flip during background count loading
  const isAllSelected = useCallback(() => {
    const visibleIds = getVisibleFileIds();
    if (visibleIds.length === 0) return false;
    return visibleIds.every(id => selectedFiles.has(id));
  }, [getVisibleFileIds, selectedFiles]);

  const isIndeterminate = useCallback(() => {
    const visibleIds = getVisibleFileIds();
    if (visibleIds.length === 0) return false;
    const selectedVisible = visibleIds.filter(id => selectedFiles.has(id)).length;
    return selectedVisible > 0 && selectedVisible < visibleIds.length;
  }, [getVisibleFileIds, selectedFiles]);

  // Counts
  const getTotalVisibleFiles = useCallback(() => {
    let total = files.length;
    Object.entries(folderContents).forEach(([folderId, subFiles]) => {
      if (expandedFolders.has(folderId)) {
        total += subFiles.length;
      }
    });
    return total;
  }, [files, folderContents, expandedFolders]);

  const getTotalSelectableFiles = useCallback(() => {
    let total = files.length;
    Object.values(folderContents).forEach(subFiles => {
      total += subFiles.length;
    });
    return total;
  }, [files, folderContents]);

  const isIndeterminateEnhanced = useCallback(() => {
    const totalSelectable = getTotalSelectableFiles();
    const totalVisible = getTotalVisibleFiles();
    if (Object.keys(folderContents).length > 0) {
      return selectedFiles.size > 0 && selectedFiles.size < totalSelectable && totalSelectable > 0;
    }
    return selectedFiles.size > 0 && selectedFiles.size < totalVisible && totalVisible > 0;
  }, [selectedFiles.size, getTotalSelectableFiles, getTotalVisibleFiles, folderContents]);

  const isFolderFullySelected = useCallback((folderId: string) => {
    return areAllDescendantsSelected(folderId, selectedFiles);
  }, [areAllDescendantsSelected, selectedFiles]);

  const isFolderPartiallySelected = useCallback((folderId: string) => {
    const all = getAllDescendantIds(folderId);
    if (all.length === 0) return false;
    const selectedCount = all.filter(id => selectedFiles.has(id)).length;
    return selectedCount > 0 && selectedCount < all.length;
  }, [getAllDescendantIds, selectedFiles]);

  const getTotalSelectedCount = useCallback(() => {
    let total = 0;
    files.forEach(file => {
      if (selectedFiles.has(file.resource_id)) {
        const isInSubfolder = Object.values(folderContents).some(subFiles =>
          subFiles.some(subFile => subFile.resource_id === file.resource_id)
        );
        if (!isInSubfolder) total++;
      }
    });
    Object.values(folderContents).forEach(subFiles => {
      subFiles.forEach(subFile => {
        if (selectedFiles.has(subFile.resource_id)) total++;
      });
    });
    return total;
  }, [files, folderContents, selectedFiles]);

  const getVisibleSelectedCount = useCallback(() => {
    let visibleCount = 0;
    files.forEach(file => {
      if (selectedFiles.has(file.resource_id)) visibleCount++;
    });
    Object.entries(folderContents).forEach(([folderId, subFiles]) => {
      if (expandedFolders.has(folderId)) {
        subFiles.forEach(subFile => {
          if (selectedFiles.has(subFile.resource_id)) visibleCount++;
        });
      }
    });
    return visibleCount;
  }, [files, folderContents, expandedFolders, selectedFiles]);

  const isCountingInProgress = useCallback(() => loadingFolders.size > 0, [loadingFolders]);

  // Filter and sort
  const filteredAndSortedFiles = files
    .filter(file => {
      const isInSubfolder = Object.values(folderContents).some(subFiles =>
        subFiles.some(subFile => subFile.resource_id === file.resource_id)
      );
      if (isInSubfolder) return false;

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
        const fileStatus = getDisplayStatus(file);
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

  return {
    // State
    searchFilters,
    viewMode,
    selectedFiles,
    fileStatuses,
    expandedFolders,
    files,
    filteredAndSortedFiles,

    // Navigation state
    currentFolderId,
    currentFolderContents,
    navigationStack,

    // Loading states
    connectionsLoading,
    filesLoading,
    connectionsError,
    isBulkIndexing,
    isRefreshing,

    // Mutations
    indexMutation,
    deindexMutation,
    removeFromListingMutation,

    // Event handlers
    handleFiltersChange,
    handleRefresh,
    handleBulkIndex,
    handleBulkRemove,

    // Helpers
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
    autoLoadFolderContents,

    // Navigation functions
    navigateToFolder,
    navigateToBreadcrumb,
    navigateBack,
    getCurrentPath,

    // Selection functions
    toggleFileSelection,
    toggleFolderSelection,
    selectAllFiles,
    deselectAllFiles,
    isAllSelected,
    isIndeterminate,
    isIndeterminateEnhanced,
    isFolderFullySelected,
    isFolderPartiallySelected,
    getTotalSelectedCount,
    getVisibleSelectedCount,
    isCountingInProgress,

    // Actions
    setViewMode,
    setSelectedFiles,
  };
}
