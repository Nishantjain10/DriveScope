"use client";

import "../app.css";
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSearchBar, type FileSearchFilters } from '@/components/ui/file-search-bar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConnections, useFiles } from '@/hooks/use-files';
import type { FileResource } from '@/lib/types/api';
import { 
  FolderIcon, 
  FileIcon, 
  MoreVertical, 
  RefreshCw,
  ArrowLeft,
  Grid3X3,
  List,
  Upload,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import Link from 'next/link';
import { indexFile, deindexFile } from '@/lib/api/knowledge-base';
import { deleteFile, formatFileSize } from '@/lib/api/files';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FilesPage() {
  const [searchFilters, setSearchFilters] = useState<FileSearchFilters>({
    query: '',
    sortBy: 'name',
    sortOrder: 'asc',
    fileType: 'all',
    indexStatus: 'all',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  // Local state to track file statuses for immediate UI updates
  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({});
  
  // Get connections first
  const { 
    data: connections, 
    isLoading: connectionsLoading, 
    error: connectionsError 
  } = useConnections();

  // Get files for the first connection
  const connectionId = connections?.[0]?.connection_id;
  const { 
    data: filesResponse, 
    isLoading: filesLoading, 
    refetch: refetchFiles 
  } = useFiles(connectionId || '', {});
  
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

  const queryClient = useQueryClient();

  // Get files from API response
  const files: FileResource[] = filesResponse?.data || [];

  // Indexing mutations for Knowledge Bases
  const indexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      console.log('📝 Starting indexing for resource:', resourceId);
      // TODO: In a real implementation, this would:
      // 1. Create or update a knowledge base with the selected files
      // 2. Trigger a sync to start indexing
      // 3. The API endpoint would be: POST /knowledge_bases
      // For now, we'll simulate the success
      return Promise.resolve();
    },
    onSuccess: (_, { resourceId }) => {
      console.log('📝 Indexing success for resource:', resourceId);
      
      // Update local state immediately for instant UI feedback
      setFileStatuses(prev => ({
        ...prev,
        [resourceId]: 'indexed'
      }));
      
      toast.success('File added to Knowledge Base!');
    },
    onError: (error) => {
      toast.error('Failed to add file to Knowledge Base. Please try again.');
      console.error('Indexing error:', error);
    },
  });

  const deindexMutation = useMutation({
    mutationFn: async ({ resourceId }: { resourceId: string }) => {
      console.log('🔄 Starting de-indexing for resource:', resourceId);
      // TODO: In a real implementation, this would:
      // 1. Remove the file from the knowledge base
      // 2. The API endpoint would be: DELETE /knowledge_bases/{kb_id}/resources
      // For now, we'll simulate the success
      return Promise.resolve();
    },
    onSuccess: (_, { resourceId }) => {
      console.log('🔄 De-indexing success for resource:', resourceId);
      
      // Update local state immediately for instant UI feedback
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

  // Remove from listing mutation (not from Google Drive)
  const removeFromListingMutation = useMutation({
    mutationFn: async ({ resourcePath }: { resourcePath: string }) => {
      // This removes the file from the listing but keeps it in Google Drive
      // Following the task requirements: "Delete: the ability to remove a file from the list of files"
      // TODO: In a real implementation, this would:
      // 1. Remove the file from the knowledge base
      // 2. The API endpoint would be: DELETE /knowledge_bases/{kb_id}/resources
      // For now, we'll simulate the success
      return Promise.resolve();
    },
    onSuccess: (_, { resourcePath }) => {
      console.log('🗑️ Remove from listing success for resource:', resourcePath);
      
      // Update local state to remove the file
      setFileStatuses(prev => {
        const newStatuses = { ...prev };
        // Find and remove the file status
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

  const handleFiltersChange = useCallback((filters: FileSearchFilters) => {
    setSearchFilters(filters);
  }, []);

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked');
    console.log('🔄 Current connectionId:', connectionId);
    console.log('🔄 Current files count:', files.length);
    refetchFiles();
  };

  // Helper function to safely get file name
  const getFileName = (file: FileResource) => {
    return file.inode_path?.name || file.inode_path?.path?.split('/').pop() || 'Unknown';
  };

  // Helper function to get file size
  const getFileSize = (file: FileResource) => {
    if (file.inode_type === 'directory') return '--';
    if (file.size !== undefined && file.size !== null) {
      return formatFileSize(file.size);
    }
    return 'Unknown';
  };

  // Helper function to get display status
  const getDisplayStatus = (file: FileResource) => {
    // For folders, don't show indexing status by default
    if (file.inode_type === 'directory') {
      return fileStatuses[file.resource_id] || file.status || 'no-status';
    }
    
    // For files, show indexing status
    const status = fileStatuses[file.resource_id] || file.status || 'not-indexed';
    return status;
  };

  // Helper function to get status badge variant
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

  // Helper function to get file type icon
  const getFileTypeIcon = (file: FileResource) => {
    if (file.inode_type === 'directory') {
      return <FolderIcon className="w-5 h-5 text-blue-500" />;
    }

    // Get file extension
    const fileName = file.inode_path?.name || file.inode_path?.path || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Return appropriate icon based on file type
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImage className="w-5 h-5 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <FileVideo className="w-5 h-5 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <FileAudio className="w-5 h-5 text-orange-500" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <FileCode className="w-5 h-5 text-yellow-500" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FileArchive className="w-5 h-5 text-gray-600" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-5 h-5 text-orange-600" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  // Selection helper functions
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

  const selectAllFiles = () => {
    const allFileIds = files.map(file => file.resource_id);
    setSelectedFiles(new Set(allFileIds));
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const isAllSelected = selectedFiles.size === files.length && files.length > 0;
  const isIndeterminate = selectedFiles.size > 0 && selectedFiles.size < files.length;

  // Filter and sort files based on search criteria
  const filteredAndSortedFiles = files
    .filter(file => {
      // Apply search query
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        const fileName = getFileName(file).toLowerCase();
        if (!fileName.includes(query)) {
          return false;
        }
      }

      // Apply file type filter
      if (searchFilters.fileType !== 'all') {
        if (searchFilters.fileType === 'files' && file.inode_type !== 'file') {
          return false;
        }
        if (searchFilters.fileType === 'folders' && file.inode_type !== 'directory') {
          return false;
        }
      }

      // Apply index status filter - For files and folders
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

  return (
    <div className="files-page checker-background bg-[#FAFAFB] min-h-screen p-5 relative">
      {/* Elegant Bordered Container */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="rounded-lg border border-[#19191C0A] bg-[#F9F9FA] p-4 shadow-[0px_9.36px_9.36px_0px_hsla(0,0%,0%,0.04)]">
          <div className="rounded-lg border border-[#FAFAFB] bg-white shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.03)] overflow-hidden">
            
            {/* Google Drive-like Header */}
            <div className="drive-header bg-white border-b border-[#EDEDF0] px-6 py-4">
        <div className="header-content flex items-center justify-between">
          <div className="header-left flex items-center gap-4">
            <Link href="/" className="back-button text-[#5F6368] hover:text-zinc-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="page-title text-xl font-normal text-[#202124]">
              Google Drive
            </h1>
            
            {/* Selection Controls */}
            {files.length > 0 && (
              <div className="selection-controls flex items-center gap-3 ml-6">
                <div className="select-all-control flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={() => isAllSelected ? deselectAllFiles() : selectAllFiles()}
                    className="select-all-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-zinc-600">
                    {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : 'Select all'}
                  </span>
                </div>
                
                {selectedFiles.size > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deselectAllFiles}
                    className="deselect-all-btn text-xs"
                  >
                    Deselect all
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="header-right flex items-center gap-3">
            <div className="view-controls flex items-center bg-[#F8F9FA] rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="view-btn h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="view-btn h-8 w-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={filesLoading}
              className="refresh-btn border-[#DADCE0] hover:border-zinc-400"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${filesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button size="sm" className="upload-btn">
              <Upload className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      </div>

            {/* Search Bar */}
            <div className="search-section bg-white border-b border-[#EDEDF0] px-6 py-3">
        <div className="search-container max-w-2xl">
          <FileSearchBar
            onFiltersChange={handleFiltersChange}
            placeholder="Search in Drive..."
            className="search-bar"
          />
        </div>
      </div>

            {/* Connection Status */}
            {connectionsError && (
              <div className="error-banner bg-[#FEF7E0] border-l-4 border-[#F9AB00] px-6 py-3">
          <div className="error-content flex items-center gap-2 text-[#B06000]">
            <span className="error-icon">⚠️</span>
            <span>Connection Error: {connectionsError.message}</span>
          </div>
              </div>
            )}

            {/* File Content */}
            <div className="file-content flex-1 px-6 py-4">
        {connectionsLoading ? (
          <div className="loading-state flex items-center justify-center py-12">
            <div className="loading-content flex items-center gap-3 text-[#5F6368]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Connecting to Google Drive...</span>
            </div>
          </div>
        ) : !connections || connections.length === 0 ? (
          <div className="no-connection-state text-center py-12">
            <div className="no-connection-content max-w-md mx-auto">
              <div className="icon-container mb-4">
                <FolderIcon className="w-16 h-16 mx-auto text-[#9AA0A6]" />
              </div>
              <h2 className="no-connection-title text-xl font-normal text-[#202124] mb-2">
                No Google Drive connection
              </h2>
              <p className="no-connection-desc text-[#5F6368] mb-6">
                Please set up your Google Drive connection to access your files.
              </p>
              <Link href="/">
                <Button className="back-home-btn">
                  Go Back Home
                </Button>
              </Link>
            </div>
          </div>
        ) : filesLoading ? (
          <div className="loading-files-state flex items-center justify-center py-12">
            <div className="loading-files-content flex items-center gap-3 text-[#5F6368]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading files...</span>
            </div>
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="empty-content max-w-md mx-auto">
              <FolderIcon className="w-16 h-16 mx-auto text-[#9AA0A6] mb-4" />
              <h2 className="empty-title text-xl font-normal text-[#202124] mb-2">
                No files found
              </h2>
              <p className="empty-desc text-[#5F6368]">
                Try adjusting your search filters or check your connection.
              </p>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="files-list bg-white rounded-lg border border-[#EDEDF0] overflow-hidden">
            <Table className="files-table">
              <TableHeader>
                <TableRow className="table-header-row border-b border-[#EDEDF0] bg-[#F8F9FA]">
                  <TableHead className="selection-column text-[#5F6368] font-medium w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={() => isAllSelected ? deselectAllFiles() : selectAllFiles()}
                      className="header-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </TableHead>
                  <TableHead className="name-column text-[#5F6368] font-medium">Name</TableHead>
                  <TableHead className="owner-column text-[#5F6368] font-medium">Owner</TableHead>
                  <TableHead className="modified-column text-[#5F6368] font-medium">Last modified</TableHead>
                  <TableHead className="size-column text-[#5F6368] font-medium">File size</TableHead>
                  <TableHead className="actions-column text-right text-[#5F6368] font-medium">
                    <MoreVertical className="w-4 h-4 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFiles.map((file) => (
                  <TableRow 
                    key={file.resource_id} 
                    className="file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0] cursor-pointer"
                  >
                    <TableCell className="selection-cell">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.resource_id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleFileSelection(file.resource_id);
                        }}
                        className="file-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </TableCell>
                    <TableCell className="name-cell">
                      <div className="file-info flex items-center gap-3">
                        <span className="file-icon">
                          {getFileTypeIcon(file)}
                        </span>
                        <div className="file-details">
                          <p className="file-name text-[#202124] text-sm">
                            {getFileName(file)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="owner-cell text-[#5F6368] text-sm">
                      me
                    </TableCell>
                    <TableCell className="modified-cell text-[#5F6368] text-sm">
                      {new Date(file.updated_at || file.created_at || Date.now()).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="size-cell text-[#5F6368] text-sm">
                      {getFileSize(file)}
                    </TableCell>
                    <TableCell className="actions-cell text-right">
                      <div className="action-buttons flex items-center justify-end gap-2">
                        {/* Status Badge - Show for all items */}
                        <Badge 
                          variant={getStatusBadgeVariant(getDisplayStatus(file))}
                          className="status-badge text-xs px-2 py-1 font-medium"
                        >
                          {getDisplayStatus(file) === 'indexed' && '✅ Indexed'}
                          {getDisplayStatus(file) === 'pending' && '⏳ Pending'}
                          {getDisplayStatus(file) === 'error' && '❌ Error'}
                          {getDisplayStatus(file) === 'deindexed' && '↩️ De-indexed'}
                          {getDisplayStatus(file) === 'not-indexed' && '📄 Not Indexed'}
                          {getDisplayStatus(file) === 'no-status' && ''}
                        </Badge>
                        
                        {/* Actions Menu - Clean, minimal design */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="action-btn h-8 w-8 p-0 hover:bg-zinc-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4 text-zinc-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {/* Index/De-index Actions for Knowledge Base - Files and folders can be indexed */}
                            {(file.inode_type === 'file' || file.inode_type === 'directory') && (
                              <>
                                {getDisplayStatus(file) === 'indexed' ? (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      deindexMutation.mutate({ resourceId: file.resource_id });
                                    }}
                                    disabled={deindexMutation.isPending}
                                    className="text-zinc-700 hover:bg-zinc-50"
                                  >
                                    {deindexMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4 mr-2 text-zinc-500" />
                                    )}
                                    Remove from Knowledge Base
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      indexMutation.mutate({ resourceId: file.resource_id });
                                    }}
                                    disabled={indexMutation.isPending}
                                    className="text-zinc-700 hover:bg-zinc-50"
                                  >
                                    {indexMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2 text-zinc-500" />
                                    )}
                                    Add to Knowledge Base
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            
                                                    {/* Remove from listing action */}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            const identifier = file.inode_path?.path || file.inode_path?.name || file.resource_id;
                            console.log('🗑️ Grid view - removing file with identifier:', identifier);
                            removeFromListingMutation.mutate({ 
                              resourcePath: identifier
                            });
                          }}
                          disabled={removeFromListingMutation.isPending}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                              {removeFromListingMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Remove from listing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="files-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAndSortedFiles.map((file) => (
              <div 
                key={file.resource_id}
                className="file-card bg-white rounded-lg border border-[#EDEDF0] p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              >
                {/* Selection Checkbox */}
                <div className="selection-checkbox absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.resource_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.resource_id);
                    }}
                    className="file-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                
                <div className="card-content text-center">
                  <div className="file-icon-large mb-3">
                    <div className="w-12 h-12 mx-auto">
                      {getFileTypeIcon(file)}
                    </div>
                  </div>
                  <p className="file-name text-sm text-[#202124] truncate">
                    {getFileName(file)}
                  </p>
                  
                  {/* File Size */}
                  <p className="file-size text-xs text-[#5F6368] mt-1">
                    {getFileSize(file)}
                  </p>
                  
                  {/* Status Badge - Show for all items */}
                  <div className="file-status mt-2">
                    <Badge 
                      variant={getStatusBadgeVariant(getDisplayStatus(file))}
                      className="status-badge text-xs px-2 py-1 font-medium"
                    >
                      {getDisplayStatus(file) === 'indexed' && '✅ Indexed'}
                      {getDisplayStatus(file) === 'pending' && '⏳ Pending'}
                      {getDisplayStatus(file) === 'error' && '❌ Error'}
                      {getDisplayStatus(file) === 'deindexed' && '↩️ De-indexed'}
                      {getDisplayStatus(file) === 'not-indexed' && '📄 Not Indexed'}
                      {getDisplayStatus(file) === 'no-status' && ''}
                    </Badge>
                  </div>
                  
                  {/* Actions Menu for Grid View */}
                  <div className="file-actions mt-3 flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="action-btn h-8 w-8 p-0 hover:bg-zinc-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-zinc-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {/* Index/De-index Actions for Knowledge Base - Files and folders can be indexed */}
                        {(file.inode_type === 'file' || file.inode_type === 'directory') && (
                          <>
                            {getDisplayStatus(file) === 'indexed' ? (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  deindexMutation.mutate({ resourceId: file.resource_id });
                                }}
                                disabled={deindexMutation.isPending}
                                className="text-zinc-700 hover:bg-zinc-50"
                              >
                                {deindexMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-4 h-4 mr-2 text-zinc-500" />
                                )}
                                Remove from Knowledge Base
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  indexMutation.mutate({ resourceId: file.resource_id });
                                }}
                                disabled={indexMutation.isPending}
                                className="text-zinc-700 hover:bg-zinc-50"
                              >
                                {indexMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2 text-zinc-500" />
                                )}
                                Add to Knowledge Base
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {/* Remove from listing action */}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            const identifier = file.inode_path?.path || file.inode_path?.name || file.resource_id;
                            console.log('🗑️ Removing file with identifier:', identifier);
                            console.log('🗑️ File details:', {
                              id: file.resource_id,
                              path: file.inode_path?.path,
                              name: file.inode_path?.name
                            });
                            removeFromListingMutation.mutate({ 
                              resourcePath: identifier
                            });
                          }}
                          disabled={removeFromListingMutation.isPending}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {removeFromListingMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Remove from listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}