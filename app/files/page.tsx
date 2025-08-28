"use client";

import "../app.css";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSearchBar, type FileSearchFilters } from '@/components/ui/file-search-bar';
import { useConnections, useFiles } from '@/hooks/use-files';
import { 
  FolderIcon, 
  FileIcon, 
  MoreVertical, 
  RefreshCw,
  ArrowLeft,
  Grid3X3,
  List,
  Upload
} from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const [searchFilters, setSearchFilters] = useState<FileSearchFilters>({
    query: '',
    sortBy: 'name',
    sortOrder: 'asc',
    fileType: 'all',
    indexStatus: 'all',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  const files = filesResponse?.data || [];

  const handleFiltersChange = (filters: FileSearchFilters) => {
    setSearchFilters(filters);
  };

  const handleRefresh = () => {
    refetchFiles();
  };

  // Helper function to safely get file name
  const getFileName = (file: FileResource) => {
    return file.inode_path?.name || file.inode_path?.path?.split('/').pop() || 'Unknown';
  };

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
                    <TableCell className="name-cell">
                      <div className="file-info flex items-center gap-3">
                        <span className="file-icon">
                          {file.inode_type === 'directory' ? (
                            <FolderIcon className="w-5 h-5 text-[#5F6368]" />
                          ) : (
                            <FileIcon className="w-5 h-5 text-[#5F6368]" />
                          )}
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
                      {file.inode_type === 'directory' ? '-' : 'Unknown'}
                    </TableCell>
                    <TableCell className="actions-cell text-right">
                      <div className="action-buttons flex items-center justify-end gap-1">
                        {file.status && (
                          <Badge 
                            variant={
                              file.status === 'indexed' ? 'default' :
                              file.status === 'pending' ? 'secondary' :
                              file.status === 'error' ? 'destructive' : 'outline'
                            }
                            className="status-badge text-xs"
                          >
                            {file.status === 'indexed' && '✅'}
                            {file.status === 'pending' && '⏳'}
                            {file.status === 'error' && '❌'}
                            {file.status === 'deindexed' && '↩️'}
                          </Badge>
                        )}
                        <Button size="sm" variant="ghost" className="action-btn h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
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
                className="file-card bg-white rounded-lg border border-[#EDEDF0] p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="card-content text-center">
                  <div className="file-icon-large mb-3">
                    {file.inode_type === 'directory' ? (
                      <FolderIcon className="w-12 h-12 mx-auto text-zinc-600" />
                    ) : (
                      <FileIcon className="w-12 h-12 mx-auto text-[#5F6368]" />
                    )}
                  </div>
                  <p className="file-name text-sm text-[#202124] truncate">
                    {getFileName(file)}
                  </p>
                  {file.status && (
                    <div className="file-status mt-2">
                      <Badge 
                        variant={
                          file.status === 'indexed' ? 'default' :
                          file.status === 'pending' ? 'secondary' :
                          'outline'
                        }
                        className="status-badge text-xs"
                      >
                        {file.status === 'indexed' && '✅'}
                        {file.status === 'pending' && '⏳'}
                        {file.status === 'error' && '❌'}
                        {file.status === 'deindexed' && '↩️'}
                      </Badge>
                    </div>
                  )}
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