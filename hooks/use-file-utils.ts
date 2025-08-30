import { useCallback } from 'react';
import type { FileResource } from '@/lib/types/api';

export function useFileUtils() {
  // Get file name
  const getFileName = useCallback((file: FileResource) => {
    return file.inode_path?.name || file.inode_path?.path?.split('/').pop() || 'Unknown';
  }, []);

  // Get file size
  const getFileSize = useCallback((file: FileResource) => {
    if (file.inode_type === 'directory') return '--';
    if (file.size !== undefined && file.size !== null) {
      const { formatFileSize } = require('@/lib/api/files');
      return formatFileSize(file.size);
    }
    return 'Unknown';
  }, []);

  // Get display status
  const getDisplayStatus = useCallback((file: FileResource, fileStatuses: Record<string, string>) => {
    if (file.inode_type === 'directory') {
      return fileStatuses[file.resource_id] || file.status || 'no-status';
    }
    const status = fileStatuses[file.resource_id] || file.status || 'not-indexed';
    return status;
  }, []);

  // Get status badge variant
  const getStatusBadgeVariant = useCallback((status: string) => {
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
  }, []);

  // Get file type icon
  const getFileTypeIcon = useCallback((file: FileResource) => {
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
  }, []);

  // Get all files in folder tree (recursive)
  const getAllFilesInFolderTree = useCallback((
    files: FileResource[],
    folderContents: Record<string, FileResource[]>,
    expandedFolders: Set<string>
  ) => {
    const allFiles = new Set<FileResource>();
    
    const addFilesRecursively = (fileList: FileResource[]) => {
      fileList.forEach(file => {
        allFiles.add(file);
        
        // If it's an expanded folder, add its contents recursively
        if (file.inode_type === 'directory' && 
            expandedFolders.has(file.resource_id) && 
            folderContents[file.resource_id]) {
          addFilesRecursively(folderContents[file.resource_id]);
        }
      });
    };
    
    addFilesRecursively(files);
    return Array.from(allFiles);
  }, []);

  // Get total visible files count
  const getTotalVisibleFiles = useCallback((
    files: FileResource[],
    folderContents: Record<string, FileResource[]>,
    expandedFolders: Set<string>
  ) => {
    return getAllFilesInFolderTree(files, folderContents, expandedFolders).length;
  }, []);

  // Get total selectable files count (excluding directories)
  const getTotalSelectableFiles = useCallback((
    files: FileResource[],
    folderContents: Record<string, FileResource[]>,
    expandedFolders: Set<string>
  ) => {
    return getAllFilesInFolderTree(files, folderContents, expandedFolders)
      .filter(file => file.inode_type === 'file')
      .length;
  }, []);

  // Get visible file IDs
  const getVisibleFileIds = useCallback((
    files: FileResource[],
    folderContents: Record<string, FileResource[]>,
    expandedFolders: Set<string>
  ) => {
    return getAllFilesInFolderTree(files, folderContents, expandedFolders)
      .map(file => file.resource_id);
  }, []);

  return {
    getFileName,
    getFileSize,
    getDisplayStatus,
    getStatusBadgeVariant,
    getFileTypeIcon,
    getAllFilesInFolderTree,
    getTotalVisibleFiles,
    getTotalSelectableFiles,
    getVisibleFileIds,
  };
}
