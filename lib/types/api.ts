/**
 * API Types for Stack AI Google Drive Integration
 * Based on knowledge_base_workflow.ipynb
 */

// Authentication types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthHeaders {
  Authorization: string;
  [key: string]: string;
}

// Resource types from API responses
export interface FileResource {
  resource_id: string;
  inode_type: 'file' | 'directory';
  inode_path: {
    path: string;
    name?: string; // Some APIs might provide name separately
  };
  status?: 'indexed' | 'pending' | 'error' | 'deindexed';
  size?: number;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  next_cursor?: string | null;
  current_cursor?: string | null;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

// Connection types
export interface Connection {
  connection_id: string;
  name: string;
  connection_provider: string;
  created_at: string;
  updated_at: string;
}

// Knowledge Base types
export interface KnowledgeBase {
  knowledge_base_id: string;
  connection_id: string;
  connection_source_ids: string[];
  indexing_params: {
    ocr: boolean;
    unstructured: boolean;
    embedding_params: {
      embedding_model: string;
      api_key: string | null;
    };
    chunker_params: {
      chunk_size: number;
      chunk_overlap: number;
      chunker: string;
    };
  };
  org_level_role: string | null;
  cron_job_id: string | null;
}

// File operation types
export interface CreateFileRequest {
  resource_type: 'file';
  resource_path: string;
  file: File;
}

export interface DeleteFileRequest {
  resource_path: string;
}

// Search and filter types (extending our existing types)
export interface FileSearchParams {
  query?: string;
  resource_id?: string;
  resource_path?: string;
  cursor?: string;
  limit?: number;
}
