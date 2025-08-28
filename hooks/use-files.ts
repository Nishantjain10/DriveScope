/**
 * TanStack Query hooks for file operations
 * Provides caching, loading states, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getConnections,
  listFiles,
  searchFiles,
  navigateToFolder,
  getRootFiles,
  createFile,
  deleteFile,
  getFileInfo
} from '@/lib/api/files';
import { 
  createKnowledgeBase,
  syncKnowledgeBase,
  indexFile,
  deindexFile,
  getKnowledgeBaseFiles,
  checkIndexingStatus
} from '@/lib/api/knowledge-base';
import { FileSearchParams, CreateFileRequest, DeleteFileRequest } from '@/lib/types/api';

// Query Keys
export const fileQueryKeys = {
  all: ['files'] as const,
  connections: () => [...fileQueryKeys.all, 'connections'] as const,
  lists: () => [...fileQueryKeys.all, 'lists'] as const,
  list: (connectionId: string, params?: FileSearchParams) => 
    [...fileQueryKeys.lists(), connectionId, params] as const,
  detail: (connectionId: string, resourceId: string) => 
    [...fileQueryKeys.all, 'detail', connectionId, resourceId] as const,
  search: (connectionId: string, query: string) => 
    [...fileQueryKeys.all, 'search', connectionId, query] as const,
  knowledgeBase: (kbId: string) => 
    [...fileQueryKeys.all, 'kb', kbId] as const,
  indexStatus: (kbId: string) => 
    [...fileQueryKeys.all, 'status', kbId] as const,
};

/**
 * Get Google Drive connections
 */
export function useConnections() {
  return useQuery({
    queryKey: fileQueryKeys.connections(),
    queryFn: getConnections,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * List files in a connection or folder
 */
export function useFiles(connectionId: string, params?: FileSearchParams) {
  return useQuery({
    queryKey: fileQueryKeys.list(connectionId, params),
    queryFn: () => listFiles(connectionId, params),
    enabled: !!connectionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get specific file information
 */
export function useFileInfo(connectionId: string, resourceId: string) {
  return useQuery({
    queryKey: fileQueryKeys.detail(connectionId, resourceId),
    queryFn: () => getFileInfo(connectionId, resourceId),
    enabled: !!connectionId && !!resourceId,
  });
}

/**
 * Search files by query
 */
export function useFileSearch(connectionId: string, query: string) {
  return useQuery({
    queryKey: fileQueryKeys.search(connectionId, query),
    queryFn: () => searchFiles(connectionId, query),
    enabled: !!connectionId && !!query && query.length > 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Navigate to folder
 */
export function useNavigateToFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ connectionId, resourceId }: { connectionId: string; resourceId: string }) =>
      navigateToFolder(connectionId, resourceId),
    onSuccess: (data, variables) => {
      // Update the cache with new folder contents
      queryClient.setQueryData(
        fileQueryKeys.list(variables.connectionId, { resource_id: variables.resourceId }),
        data
      );
    },
  });
}

/**
 * Create knowledge base with selected files
 */
export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      connectionId, 
      selectedFileIds, 
      options 
    }: { 
      connectionId: string; 
      selectedFileIds: string[]; 
      options?: any 
    }) =>
      createKnowledgeBase(connectionId, selectedFileIds, options),
    onSuccess: () => {
      // Invalidate knowledge bases list
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
    },
  });
}

/**
 * Sync knowledge base
 */
export function useSyncKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncKnowledgeBase,
    onSuccess: (_, knowledgeBaseId) => {
      // Invalidate knowledge base files
      queryClient.invalidateQueries({ 
        queryKey: fileQueryKeys.knowledgeBase(knowledgeBaseId) 
      });
    },
  });
}

/**
 * Index a file
 */
export function useIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ knowledgeBaseId, resourceId }: { knowledgeBaseId: string; resourceId: string }) =>
      indexFile(knowledgeBaseId, resourceId),
    onMutate: async ({ knowledgeBaseId, resourceId }) => {
      // Optimistic update
      const queryKey = fileQueryKeys.indexStatus(knowledgeBaseId);
      await queryClient.cancelQueries({ queryKey });

      const previousStatus = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        [resourceId]: 'pending'
      }));

      return { previousStatus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          fileQueryKeys.indexStatus(variables.knowledgeBaseId),
          context.previousStatus
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Refetch to get actual status
      queryClient.invalidateQueries({ 
        queryKey: fileQueryKeys.indexStatus(variables.knowledgeBaseId) 
      });
    },
  });
}

/**
 * De-index a file
 */
export function useDeindexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ knowledgeBaseId, resourceId }: { knowledgeBaseId: string; resourceId: string }) =>
      deindexFile(knowledgeBaseId, resourceId),
    onMutate: async ({ knowledgeBaseId, resourceId }) => {
      // Optimistic update
      const queryKey = fileQueryKeys.indexStatus(knowledgeBaseId);
      await queryClient.cancelQueries({ queryKey });

      const previousStatus = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        [resourceId]: 'deindexed'
      }));

      return { previousStatus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          fileQueryKeys.indexStatus(variables.knowledgeBaseId),
          context.previousStatus
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Refetch to get actual status
      queryClient.invalidateQueries({ 
        queryKey: fileQueryKeys.indexStatus(variables.knowledgeBaseId) 
      });
    },
  });
}

/**
 * Delete file from listing
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ knowledgeBaseId, resourcePath }: DeleteFileRequest & { knowledgeBaseId: string }) =>
      deleteFile(knowledgeBaseId, { resource_path: resourcePath }),
    onMutate: async ({ knowledgeBaseId, resourcePath }) => {
      // Optimistic update - remove from UI immediately
      const queryKey = fileQueryKeys.knowledgeBase(knowledgeBaseId);
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        data: old?.data?.filter((file: any) => 
          file.inode_path.path !== resourcePath
        ) || []
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          fileQueryKeys.knowledgeBase(variables.knowledgeBaseId),
          context.previousData
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: fileQueryKeys.knowledgeBase(variables.knowledgeBaseId) 
      });
    },
  });
}

/**
 * Get indexing status for knowledge base files
 */
export function useIndexingStatus(knowledgeBaseId: string) {
  return useQuery({
    queryKey: fileQueryKeys.indexStatus(knowledgeBaseId),
    queryFn: () => checkIndexingStatus(knowledgeBaseId),
    enabled: !!knowledgeBaseId,
    refetchInterval: 5000, // Refresh every 5 seconds to track indexing progress
    staleTime: 0, // Always refetch
  });
}
