/**
 * Knowledge Base Operations API
 * Handles creating, syncing, and managing knowledge bases
 * Based on knowledge_base_workflow.ipynb patterns
 */

import { stackAIClient } from './stack-ai-client';
import { 
  KnowledgeBase, 
  FileResource, 
  PaginatedResponse 
} from '@/lib/types/api';

/**
 * Create a new knowledge base with selected files
 * Based on the create_kb_url section in the notebook
 */
export async function createKnowledgeBase(
  connectionId: string,
  selectedFileIds: string[],
  options: {
    ocr?: boolean;
    unstructured?: boolean;
    embeddingModel?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    chunker?: string;
  } = {}
): Promise<KnowledgeBase> {
  const requestData = {
    connection_id: connectionId,
    connection_source_ids: selectedFileIds,
    indexing_params: {
      ocr: options.ocr ?? false,
      unstructured: options.unstructured ?? true,
      embedding_params: {
        embedding_model: options.embeddingModel ?? 'text-embedding-ada-002',
        api_key: null,
      },
      chunker_params: {
        chunk_size: options.chunkSize ?? 1500,
        chunk_overlap: options.chunkOverlap ?? 500,
        chunker: options.chunker ?? 'sentence',
      },
    },
    org_level_role: null,
    cron_job_id: null,
  };

  return stackAIClient.request<KnowledgeBase>('/knowledge_bases', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

/**
 * Sync a knowledge base to index the selected files
 * Based on the sync endpoint in the notebook
 */
export async function syncKnowledgeBase(
  knowledgeBaseId: string
): Promise<void> {
  const orgId = stackAIClient.getOrgId();
  if (!orgId) {
    throw new Error('Organization ID not available');
  }

  await stackAIClient.request(
    `/knowledge_bases/sync/trigger/${knowledgeBaseId}/${orgId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Get files in a knowledge base
 * Based on the print_kb_resources function in the notebook
 */
export async function getKnowledgeBaseFiles(
  knowledgeBaseId: string,
  resourcePath: string = '/'
): Promise<PaginatedResponse<FileResource>> {
  const queryParams = new URLSearchParams({
    resource_path: resourcePath,
  });

  return stackAIClient.request<PaginatedResponse<FileResource>>(
    `/knowledge_bases/${knowledgeBaseId}/resources/children?${queryParams.toString()}`
  );
}

/**
 * Index a single file or folder
 * Based on the notebook, indexing is done by adding files to a knowledge base
 * This function adds a resource to an existing knowledge base
 */
export async function indexFile(
  knowledgeBaseId: string,
  resourceId: string
): Promise<void> {
  // According to the notebook, we need to add the resource to the knowledge base
  // This is done by updating the knowledge base with the new resource
  // For now, we'll simulate this since the actual endpoint might be different
  console.log(`📝 Simulating indexing of resource ${resourceId} to knowledge base ${knowledgeBaseId}`);
  
  // In a real implementation, this would call the actual API
  // For now, we'll just return success to test the UI
  return Promise.resolve();
}

/**
 * De-index a file or folder
 * Based on the notebook, de-indexing is done by removing resources from the knowledge base
 */
export async function deindexFile(
  knowledgeBaseId: string,
  resourceId: string
): Promise<void> {
  // According to the notebook, we remove the resource from the knowledge base
  // This uses the DELETE endpoint with resource_path
  // For now, we'll simulate this since the actual endpoint might be different
  console.log(`🔄 Simulating de-indexing of resource ${resourceId} from knowledge base ${knowledgeBaseId}`);
  
  // In a real implementation, this would call the actual API
  // For now, we'll just return success to test the UI
  return Promise.resolve();
}

/**
 * Get knowledge base information
 */
export async function getKnowledgeBase(
  knowledgeBaseId: string
): Promise<KnowledgeBase> {
  return stackAIClient.request<KnowledgeBase>(
    `/knowledge_bases/${knowledgeBaseId}`
  );
}

/**
 * List all knowledge bases for the user
 */
export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  return stackAIClient.request<KnowledgeBase[]>('/knowledge_bases');
}

/**
 * Delete a knowledge base
 */
export async function deleteKnowledgeBase(
  knowledgeBaseId: string
): Promise<void> {
  await stackAIClient.request(`/knowledge_bases/${knowledgeBaseId}`, {
    method: 'DELETE',
  });
}

/**
 * Check indexing status of files in a knowledge base
 */
export async function checkIndexingStatus(
  knowledgeBaseId: string
): Promise<{ [resourceId: string]: 'indexed' | 'pending' | 'error' | 'deindexed' }> {
  const files = await getKnowledgeBaseFiles(knowledgeBaseId);
  
  const statusMap: { [resourceId: string]: 'indexed' | 'pending' | 'error' | 'deindexed' } = {};
  
  files.data.forEach(file => {
    statusMap[file.resource_id] = file.status || 'pending';
  });
  
  return statusMap;
}

/**
 * Wait for indexing to complete
 * Polls the knowledge base until all files are indexed
 */
export async function waitForIndexing(
  knowledgeBaseId: string,
  maxAttempts: number = 30,
  delayMs: number = 2000
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusMap = await checkIndexingStatus(knowledgeBaseId);
    
    const allStatuses = Object.values(statusMap);
    const pendingCount = allStatuses.filter(status => status === 'pending').length;
    
    if (pendingCount === 0) {
      return true; // All files processed (indexed or error)
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  return false; // Timeout
}
