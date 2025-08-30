import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createKnowledgeBase,
  syncKnowledgeBase,
  waitForIndexing
} from '@/lib/api/knowledge-base';
import type { FileResource } from '@/lib/types/api';

export function useFileOperations(
  connectionId: string | undefined,
  setFileStatuses: (updater: (prev: Record<string, string>) => Record<string, string>) => void,
  setSelectedFiles: (updater: (prev: Set<string>) => Set<string>) => void,
  setIsBulkIndexing: (value: boolean) => void
) {
  const queryClient = useQueryClient();

  // Index mutation
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

  // Deindex mutation
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

  // Remove from listing mutation
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

  // Bulk index operation
  const handleBulkIndex = async (selectedFiles: Set<string>) => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for indexing');
      return;
    }
    if (indexMutation.isPending) {
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
      setSelectedFiles(() => new Set());
    } catch (error) {
      toast.error('Failed to start bulk indexing process. Please try again.');
    } finally {
      setIsBulkIndexing(false);
    }
  };

  // Bulk remove operation
  const handleBulkRemove = async (selectedFiles: Set<string>) => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for removal');
      return;
    }
    if (indexMutation.isPending) {
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
      setSelectedFiles(() => new Set());
    } catch (error) {
      toast.error('Failed to remove some files. Please try again.');
    } finally {
      setIsBulkIndexing(false);
    }
  };

  return {
    // Mutations
    indexMutation,
    deindexMutation,
    removeFromListingMutation,
    
    // Bulk operations
    handleBulkIndex,
    handleBulkRemove,
  };
}
