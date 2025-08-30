import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useConnections, useFiles } from '@/hooks/use-files';
import { useFileState } from './use-file-state';
import { useNavigationState } from './use-navigation-state';
import { useFileOperations } from './use-file-operations';
import { useFileSelection } from './use-file-selection';
import { useFileNavigation } from './use-file-navigation';
import { useFileUtils } from './use-file-utils';
import { useFileFilters } from './use-file-filters';
import type { FileResource } from '@/lib/types/api';

export function useFileExplorerRefactored() {
  // Use specialized hooks
  const fileState = useFileState();
  const navigationState = useNavigationState();
  
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

  const files: FileResource[] = filesResponse?.data || [];

  // Initialize file operations with required parameters
  const fileOperations = useFileOperations(
    connectionId,
    fileState.setFileStatuses,
    fileState.setSelectedFiles,
    fileState.setIsBulkIndexing
  );

  // Initialize file statuses and current folder contents when API data loads
  useEffect(() => {
    if (filesResponse?.data) {
      fileState.initializeFileStatuses(filesResponse.data);
      
      // Initialize current folder contents with root files when no folder is selected
      if (!navigationState.currentFolderId) {
        navigationState.setInitialFolderContents(filesResponse.data);
      }
    }
  }, [filesResponse?.data, navigationState.currentFolderId]);

  // Auto sync state when connection changes or page refreshes
  useEffect(() => {
    if (connectionId && !connectionsLoading) {
      fileState.resetState();
      navigationState.resetNavigation();
      refetchFiles();
    }
  }, [connectionId, connectionsLoading, refetchFiles]);

  // Use specialized hooks with current state
  const fileSelection = useFileSelection(
    fileState.selectedFiles,
    fileState.setSelectedFiles,
    fileState.folderContents,
    fileState.loadingFolders,
    (folderId: string) => fileNavigation.autoLoadFolderContents(folderId, fileState.setSelectedFiles)
  );

  const fileNavigation = useFileNavigation(
    connectionId,
    navigationState.setCurrentFolderContents,
    navigationState.setCurrentFolderId,
    navigationState.setNavigationStack,
    fileState.setFolderContents,
    fileState.setLoadingFolders,
    fileState.folderContents,
    fileState.loadingFolders,
    fileState.setExpandedFolders
  );

  const fileUtils = useFileUtils();
  const fileFilters = useFileFilters();

  // Event handlers
  const handleFiltersChange = useCallback((filters: typeof fileState.searchFilters) => {
    fileState.setSearchFilters(filters);
  }, []);

  const handleRefresh = async () => {
    fileState.setIsRefreshing(true);
    try {
      fileState.resetState();
      navigationState.resetNavigation();

      await refetchFiles();

      if (filesResponse?.data) {
        navigationState.setInitialFolderContents(filesResponse.data);
      }

      toast.success('Files refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh files. Please try again.');
    } finally {
      fileState.setIsRefreshing(false);
    }
  };

  const handleBulkIndex = async () => {
    if (fileState.selectedFiles.size === 0) {
      toast.error('No files selected for indexing');
      return;
    }
    if (fileState.isBulkIndexing) {
      toast.error('Bulk indexing already in progress. Please wait.');
      return;
    }

    fileState.setIsBulkIndexing(true);
    try {
      // Use the bulk index operation from file operations
      await fileOperations.handleBulkIndex(fileState.selectedFiles);
      fileState.setSelectedFiles(() => new Set());
    } catch (error) {
      toast.error('Failed to start bulk indexing process. Please try again.');
    } finally {
      fileState.setIsBulkIndexing(false);
    }
  };

  const handleBulkRemove = async () => {
    if (fileState.selectedFiles.size === 0) {
      toast.error('No files selected for removal');
      return;
    }
    if (fileState.isBulkIndexing) {
      toast.error('Operation already in progress. Please wait.');
      return;
    }

    fileState.setIsBulkIndexing(true);
    try {
      // Use the bulk remove operation from file operations
      await fileOperations.handleBulkRemove(fileState.selectedFiles);
      fileState.setSelectedFiles(() => new Set());
    } catch (error) {
      toast.error('Failed to remove some files. Please try again.');
    } finally {
      fileState.setIsBulkIndexing(false);
    }
  };

  // Get filtered and sorted files
  const filesToFilter = fileFilters.getFilesToFilter(
    navigationState.currentFolderId,
    navigationState.currentFolderContents,
    files,
    fileState.folderContents,
    fileState.searchFilters
  );

  const filteredAndSortedFiles = fileFilters.getFilteredAndSortedFiles(
    filesToFilter,
    fileState.searchFilters,
    fileUtils.getFileName,
    fileUtils.getDisplayStatus,
    fileState.fileStatuses
  );

  // Wrapper functions to maintain backward compatibility
  const getFileName = useCallback((file: FileResource) => fileUtils.getFileName(file), [fileUtils]);
  const getFileSize = useCallback((file: FileResource) => fileUtils.getFileSize(file), [fileUtils]);
  const getDisplayStatus = useCallback((file: FileResource) => fileUtils.getDisplayStatus(file, fileState.fileStatuses), [fileUtils, fileState.fileStatuses]);
  const getStatusBadgeVariant = useCallback((status: string) => fileUtils.getStatusBadgeVariant(status), [fileUtils]);
  const getFileTypeIcon = useCallback((file: FileResource) => fileUtils.getFileTypeIcon(file), [fileUtils]);

  // Selection wrapper functions
  const toggleFileSelection = useCallback((fileId: string) => fileSelection.toggleFileSelection(fileId), [fileSelection]);
  const toggleFolderSelection = useCallback((folderId: string) => fileSelection.toggleFolderSelection(folderId), [fileSelection]);
  const selectAllFiles = useCallback(() => fileSelection.selectAllFiles(files), [fileSelection, files]);
  const deselectAllFiles = useCallback(() => fileSelection.deselectAllFiles(), [fileSelection]);

  // Selection check wrapper functions
  const isAllSelected = useCallback(() => fileSelection.isAllSelected(files, fileState.expandedFolders), [fileSelection, files, fileState.expandedFolders]);
  const isIndeterminate = useCallback(() => fileSelection.isIndeterminate(files, fileState.expandedFolders), [fileSelection, files, fileState.expandedFolders]);
  const isIndeterminateEnhanced = useCallback(() => fileSelection.isIndeterminateEnhanced(files), [fileSelection, files]);
  const isFolderFullySelected = useCallback((folderId: string) => fileSelection.isFolderFullySelected(folderId), [fileSelection]);
  const isFolderPartiallySelected = useCallback((folderId: string) => fileSelection.isFolderPartiallySelected(folderId), [fileSelection]);

  // Count wrapper functions
  const getTotalSelectedCount = useCallback(() => fileSelection.getTotalSelectedCount(files), [fileSelection, files]);
  const getVisibleSelectedCount = useCallback(() => fileSelection.getVisibleSelectedCount(files, fileState.expandedFolders), [fileSelection, files, fileState.expandedFolders]);
  const isCountingInProgress = useCallback(() => fileState.loadingFolders.size > 0, [fileState.loadingFolders]);

  // Navigation wrapper functions
  const navigateToFolder = useCallback((folderId: string, folderName: string) => fileNavigation.navigateToFolder(folderId, folderName), [fileNavigation]);
  const navigateToBreadcrumb = useCallback((targetStack: Array<{ id: string; name: string }>, targetFolder: { id: string; name: string }) => fileNavigation.navigateToBreadcrumb(targetStack, targetFolder), [fileNavigation]);
  const navigateBack = useCallback(() => fileNavigation.navigateBack(files, navigationState.currentFolderId, navigationState.navigationStack), [fileNavigation, files, navigationState.currentFolderId, navigationState.navigationStack]);
  const getCurrentPath = useCallback(() => navigationState.getCurrentPath(), [navigationState]);

  // Folder management wrapper functions
  const toggleFolderExpansion = useCallback((folderId: string) => fileNavigation.toggleFolderExpansion(folderId, fileState.setSelectedFiles, fileState.setExpandedFolders), [fileNavigation, fileState.setSelectedFiles, fileState.setExpandedFolders]);
  const isFolderExpanded = useCallback((folderId: string) => fileNavigation.isFolderExpanded(folderId, fileState.expandedFolders), [fileNavigation, fileState.expandedFolders]);
  const getFilesInFolder = useCallback((folderId: string) => fileNavigation.getFilesInFolder(folderId), [fileNavigation]);
  const isFolderLoading = useCallback((folderId: string) => fileNavigation.isFolderLoading(folderId), [fileNavigation]);

  // Handle operations wrapper functions
  const handleIndex = useCallback((resourceId: string) => {
    fileOperations.indexMutation.mutate({ resourceId });
  }, [fileOperations.indexMutation]);

  const handleDeindex = useCallback((resourceId: string) => {
    fileOperations.deindexMutation.mutate({ resourceId });
  }, [fileOperations.deindexMutation]);

  const handleRemove = useCallback((resourcePath: string) => {
    fileOperations.removeFromListingMutation.mutate({ resourcePath });
  }, [fileOperations.removeFromListingMutation]);

  return {
    // State - maintain exact same interface
    searchFilters: fileState.searchFilters,
    viewMode: fileState.viewMode,
    selectedFiles: fileState.selectedFiles,
    fileStatuses: fileState.fileStatuses,
    expandedFolders: fileState.expandedFolders,
    files,
    filteredAndSortedFiles,

    // Navigation state
    currentFolderId: navigationState.currentFolderId,
    currentFolderContents: navigationState.currentFolderContents,
    navigationStack: navigationState.navigationStack,

    // Loading states
    connectionsLoading,
    filesLoading,
    connectionsError,
    isBulkIndexing: fileState.isBulkIndexing,
    isRefreshing: fileState.isRefreshing,

    // Mutations
    indexMutation: fileOperations.indexMutation,
    deindexMutation: fileOperations.deindexMutation,
    removeFromListingMutation: fileOperations.removeFromListingMutation,

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

    // Additional utility functions for backward compatibility
    getAllFilesInFolderTree: (expandedFolders: Set<string>) => 
      fileUtils.getAllFilesInFolderTree(files, fileState.folderContents, expandedFolders),
    getTotalVisibleFiles: (expandedFolders: Set<string>) => 
      fileUtils.getTotalVisibleFiles(files, fileState.folderContents, expandedFolders),
    getTotalSelectableFiles: (expandedFolders: Set<string>) => 
      fileUtils.getTotalSelectableFiles(files, fileState.folderContents, expandedFolders),
    getVisibleFileIds: (expandedFolders: Set<string>) => 
      fileUtils.getVisibleFileIds(files, fileState.folderContents, expandedFolders),

    // Folder functions
    toggleFolderExpansion,
    isFolderExpanded,
    getFilesInFolder,
    isFolderLoading,
    autoLoadFolderContents: (folderId: string) => fileNavigation.autoLoadFolderContents(folderId, fileState.setSelectedFiles),

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
    setViewMode: fileState.setViewMode,
    setSelectedFiles: fileState.setSelectedFiles,
  };
}
