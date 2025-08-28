/**
 * ⚠️ DEVELOPMENT ONLY ⚠️
 * Mock API implementations for development.
 * DO NOT use this in production.
 * 
 * TODO: Remove this file and its imports before deploying to production.
 */

import { MOCK_CONNECTION, MOCK_FILES } from '@/lib/config/development';
import { Connection, FileResource, PaginatedResponse } from '@/lib/types/api';

// Simulate network delay for more realistic testing
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Get Google Drive connections
  async getConnections(): Promise<Connection[]> {
    await delay(MOCK_DELAY);
    return [MOCK_CONNECTION];
  },

  // List files in a folder
  async listFiles(folderId?: string): Promise<PaginatedResponse<FileResource>> {
    await delay(MOCK_DELAY);
    
    // Filter files based on folder
    const files = MOCK_FILES.filter(file => {
      if (!folderId) return !file.inode_path.path.includes('/');
      return file.inode_path.path.startsWith(`/${folderId}`);
    });

    return {
      data: files,
      next_cursor: null,
      current_cursor: null,
    };
  },

  // Search files by name
  async searchFiles(query: string): Promise<PaginatedResponse<FileResource>> {
    await delay(MOCK_DELAY);
    
    const files = MOCK_FILES.filter(file => 
      file.inode_path.name.toLowerCase().includes(query.toLowerCase())
    );

    return {
      data: files,
      next_cursor: null,
      current_cursor: null,
    };
  },

  // Index a file
  async indexFile(fileId: string): Promise<void> {
    await delay(MOCK_DELAY);
    console.log('🔍 [DEV MODE] Indexing file:', fileId);
  },

  // De-index a file
  async deindexFile(fileId: string): Promise<void> {
    await delay(MOCK_DELAY);
    console.log('↩️ [DEV MODE] De-indexing file:', fileId);
  },

  // Delete a file from listing
  async deleteFile(fileId: string): Promise<void> {
    await delay(MOCK_DELAY);
    console.log('🗑️ [DEV MODE] Deleting file:', fileId);
  },
};
