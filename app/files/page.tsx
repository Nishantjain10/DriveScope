"use client";

import "../app.css";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSearchBar } from '@/components/ui/file-search-bar';
import { FileTypeIcon } from '@/components/ui/file-type-icon';
import { FileActions } from '@/components/ui/file-actions';
import { DynamicFooter } from '@/components/ui/dynamic-footer';
import { useFileExplorer } from '@/hooks/use-file-explorer';
import { 
  RefreshCw,
  ArrowLeft,
  Grid3X3,
  List,
  Upload,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const {
    // State
    viewMode,
    selectedFiles,
    filteredAndSortedFiles,
    expandedFolders,
    
    // Loading states
    connectionsLoading,
    filesLoading,
    connectionsError,
    
    // Mutations
    indexMutation,
    deindexMutation,
    removeFromListingMutation,
    
    // Event handlers
    handleFiltersChange,
    handleRefresh,
    handleBulkIndex,
    
    // Helper functions
    getFileName,
    getFileSize,
    getDisplayStatus,
    getStatusBadgeVariant,
    
    // Folder functions
    toggleFolderExpansion,
    getFilesInFolder,
    isFolderLoading,
    
    // Selection functions
    toggleFileSelection,
    toggleFolderSelection,
    selectAllFiles,
    deselectAllFiles,
    isAllSelected,
    isIndeterminate,
    isFolderFullySelected,
    isFolderPartiallySelected,
    
    // Actions
    setViewMode,
    setSelectedFiles,
  } = useFileExplorer();

  // Handle file actions
  const handleIndex = (resourceId: string) => {
    indexMutation.mutate({ resourceId });
  };

  const handleDeindex = (resourceId: string) => {
    deindexMutation.mutate({ resourceId });
  };

  const handleRemove = (resourcePath: string) => {
    removeFromListingMutation.mutate({ resourcePath });
  };

  // Loading state
  if (connectionsLoading || filesLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18181B] mx-auto mb-4"></div>
          <p className="text-[#5F6368]">Loading files...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (connectionsError) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load connections</p>
          <Link href="/">
            <Button variant="outline">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

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

            {/* File Content */}
            <div className="file-content flex-1 px-6 py-4">
              {connectionsLoading ? (
                <div className="loading-state flex items-center justify-center py-16">
                  <div className="loading-content text-center max-w-md mx-auto">
                    <div className="loading-animation mb-6">
                      <div className="loading-dots flex justify-center gap-2">
                        <div className="w-3 h-3 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                    <p className="text-[#5F6368] text-lg font-medium mb-2">Connecting to Google Drive...</p>
                    <p className="text-[#9AA0A6] text-sm">Establishing secure connection</p>
                  </div>
                </div>
              ) : filesLoading ? (
                <div className="loading-files-state flex items-center justify-center py-16">
                  <div className="loading-content text-center max-w-md mx-auto">
                    <div className="loading-animation mb-6">
                      <div className="loading-dots flex justify-center gap-2">
                        <div className="w-3 h-3 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                    <p className="text-[#5F6368] text-lg font-medium mb-2">Loading your files...</p>
                    <p className="text-[#9AA0A6] text-sm">Please wait while we fetch your Drive contents</p>
                  </div>
                </div>
              ) : filteredAndSortedFiles.length === 0 ? (
                <div className="empty-state text-center py-12">
                  <div className="empty-content max-w-md mx-auto">
                    <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-[#9AA0A6]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#202124] mb-2">No files found</h3>
                    <p className="text-[#5F6368] mb-4">
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
                            className="header-checkbox"
                          />
                        </TableHead>
                        <TableHead className="name-column text-[#5F6368] font-medium">Name</TableHead>
                        <TableHead className="owner-column text-[#5F6368] font-medium">Owner</TableHead>
                        <TableHead className="modified-column text-[#5F6368] font-medium">Last modified</TableHead>
                        <TableHead className="size-column text-[#5F6368] font-medium">File size</TableHead>
                        <TableHead className="actions-column text-right text-[#5F6368] font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedFiles.map((file) => (
                        <React.Fragment key={file.resource_id}>
                          {/* Main File/Folder Row */}
                          <TableRow 
                            className="file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0] cursor-pointer"
                          >
                                                      <TableCell className="selection-cell">
                            <input
                              type="checkbox"
                              checked={file.inode_type === 'directory' ? isFolderFullySelected(file.resource_id) : selectedFiles.has(file.resource_id)}
                              ref={(input) => {
                                if (input && file.inode_type === 'directory') {
                                  input.indeterminate = isFolderPartiallySelected(file.resource_id);
                                }
                              }}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (file.inode_type === 'directory') {
                                  toggleFolderSelection(file.resource_id);
                                } else {
                                  toggleFileSelection(file.resource_id);
                                }
                              }}
                              className="file-checkbox"
                            />
                          </TableCell>
                            <TableCell className="name-cell">
                              <div className="file-info flex items-center gap-3">
                                <span className="file-icon">
                                  <FileTypeIcon file={file} />
                                </span>
                                <div className="file-details flex items-center gap-2">
                                  <p className="file-name text-[#202124] text-sm">
                                    {getFileName(file)}
                                  </p>
                                  {/* Folder Expansion Toggle */}
                                  {file.inode_type === 'directory' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFolderExpansion(file.resource_id);
                                      }}
                                      className="folder-toggle-btn ml-2 p-1 hover:bg-zinc-100 rounded transition-colors"
                                    >
                                      {expandedFolders.has(file.resource_id) ? (
                                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                                      )}
                                    </button>
                                  )}
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
                              <FileActions
                                file={file}
                                status={getDisplayStatus(file)}
                                statusVariant={getStatusBadgeVariant(getDisplayStatus(file))}
                                onIndex={handleIndex}
                                onDeindex={handleDeindex}
                                onRemove={handleRemove}
                                isIndexing={indexMutation.isPending}
                                isDeindexing={deindexMutation.isPending}
                                isRemoving={removeFromListingMutation.isPending}
                              />
                            </TableCell>
                          </TableRow>
                          
                          {/* Sub-files within expanded folders */}
                          {file.inode_type === 'directory' && expandedFolders.has(file.resource_id) && (
                            <>
                              {/* Loading state for folder */}
                              {isFolderLoading(file.resource_id) && (
                                <TableRow className="sub-file-row border-b border-[#EDEDF0] bg-[#FAFAFB]">
                                  <TableCell colSpan={6} className="text-center py-4">
                                    <div className="flex items-center justify-center gap-2 text-[#5F6368]">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Loading folder contents...
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                              
                              {/* Actual sub-files */}
                              {!isFolderLoading(file.resource_id) && getFilesInFolder(file.resource_id).map((subFile) => (
                                  <TableRow 
                                    key={`${file.resource_id}-${subFile.resource_id}`}
                                    className="sub-file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0] cursor-pointer bg-[#FAFAFB]"
                                  >
                                    <TableCell className="selection-cell pl-8">
                                      <input
                                        type="checkbox"
                                        checked={selectedFiles.has(subFile.resource_id)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          toggleFileSelection(subFile.resource_id);
                                        }}
                                        className="file-checkbox"
                                      />
                                    </TableCell>
                                    <TableCell className="name-cell">
                                      <div className="file-info flex items-center gap-3">
                                        <span className="file-icon">
                                          <FileTypeIcon file={subFile} />
                                        </span>
                                        <div className="file-details">
                                          <p className="file-name text-[#202124] text-sm text-zinc-600">
                                            {getFileName(subFile)}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="owner-cell text-[#5F6368] text-sm">
                                      me
                                    </TableCell>
                                    <TableCell className="modified-cell text-[#5F6368] text-sm">
                                      {new Date(subFile.updated_at || subFile.created_at || Date.now()).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="size-cell text-[#5F6368] text-sm">
                                      {getFileSize(subFile)}
                                    </TableCell>
                                    <TableCell className="actions-cell text-right">
                                      <FileActions
                                        file={subFile}
                                        status={getDisplayStatus(subFile)}
                                        statusVariant={getStatusBadgeVariant(getDisplayStatus(subFile))}
                                        onIndex={handleIndex}
                                        onDeindex={handleDeindex}
                                        onRemove={handleRemove}
                                        isIndexing={indexMutation.isPending}
                                        isDeindexing={deindexMutation.isPending}
                                        isRemoving={removeFromListingMutation.isPending}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </>
                          )}
                        </React.Fragment>
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
                          className="file-checkbox"
                        />
                      </div>
                      
                      <div className="card-content text-center">
                        <div className="file-icon-large mb-3">
                          <div className="w-12 h-12 mx-auto">
                            <FileTypeIcon file={file} className="w-12 h-12" />
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
                          <FileActions
                            file={file}
                            status={getDisplayStatus(file)}
                            statusVariant={getStatusBadgeVariant(getDisplayStatus(file))}
                            onIndex={handleIndex}
                            onDeindex={handleDeindex}
                            onRemove={handleRemove}
                            isIndexing={indexMutation.isPending}
                            isDeindexing={deindexMutation.isPending}
                            isRemoving={removeFromListingMutation.isPending}
                          />
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

      {/* Dynamic Footer */}
      <DynamicFooter
        selectedCount={selectedFiles.size}
        onCancel={() => setSelectedFiles(new Set())}
        onLoadSelected={handleBulkIndex}
        isLoading={indexMutation.isPending}
      />
    </div>
  );
}