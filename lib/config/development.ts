/**
 * ⚠️ DEVELOPMENT ONLY ⚠️
 * This file contains mock data and configurations for development.
 * DO NOT use this in production or commit sensitive data here.
 * 
 * TODO: Remove this file and its imports before deploying to production.
 */

// Check if dev mode is manually forced via localStorage
const isManuallyEnabled = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('forceDevMode') === 'true';
  }
  return false;
};

export const DEV_MODE = isManuallyEnabled() || process.env.NODE_ENV === 'development';

// Mock auth token for development
export const MOCK_AUTH_TOKEN = 'mock_dev_token_do_not_use_in_production';

// Mock organization ID for development
export const MOCK_ORG_ID = 'mock_org_123';

// Mock Google Drive connection for development
export const MOCK_CONNECTION = {
  connection_id: 'mock_connection_123',
  name: 'Mock Google Drive',
  connection_provider: 'gdrive',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock file/folder data for development
export const MOCK_FILES = [
  {
    resource_id: 'mock_folder_1',
    inode_type: 'directory',
    inode_path: { path: '/Documents', name: 'Documents' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    resource_id: 'mock_file_1',
    inode_type: 'file',
    inode_path: { path: '/Documents/test.pdf', name: 'test.pdf' },
    status: 'indexed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    resource_id: 'mock_file_2',
    inode_type: 'file',
    inode_path: { path: '/Documents/notes.txt', name: 'notes.txt' },
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
