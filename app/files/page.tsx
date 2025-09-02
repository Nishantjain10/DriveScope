"use client";

import "../app.css";
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSearchBar } from '@/components/ui/file-search-bar';
import { DynamicFooter } from '@/components/ui/dynamic-footer';
import { FileGridView } from '@/components/ui/file-grid-view';
import { FileListView } from '@/components/ui/file-list-view';
import { FileSkeleton } from '@/components/ui/file-skeleton';
import { useFileExplorer } from '@/hooks/use-file-explorer';
import type { FileResource } from '@/lib/types/api';
import { 
  RefreshCw,
  ArrowLeft,
  Grid3X3,
  List,
  Upload
} from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const {
    // State
    viewMode,
    selectedFiles,
    filteredAndSortedFiles,
    expandedFolders,
    
    // Navigation state
    currentFolderId,
    currentFolderContents,
    navigationStack,
    
    // Loading states
    connectionsLoading,
    filesLoading,
    connectionsError,
    isBulkIndexing,
    isRefreshing,
    
    // Mutations
    indexMutation,
    deindexMutation,
    removeFromListingMutation,
    
    // Event handlers
    handleFiltersChange,
    handleRefresh,
    handleBulkIndex,
    handleBulkRemove,
    
    // Helper functions
    getFileName,
    getFileSize,
    getDisplayStatus,
    getStatusBadgeVariant,
    
    // Folder functions
    toggleFolderExpansion,
    getFilesInFolder,
    isFolderLoading,
    
    // Navigation functions
    navigateToFolder,
    navigateToBreadcrumb,
    navigateBack,
    
    // Selection functions
    toggleFileSelection,
    toggleFolderSelection,
    selectAllFiles,
    deselectAllFiles,
    isAllSelected,
    isIndeterminateEnhanced,
    isFolderFullySelected,
    isFolderPartiallySelected,
    getTotalSelectedCount,
    getVisibleSelectedCount,
    isCountingInProgress,
    
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

  // Loading state - now within the same wrapper as files
  if (connectionsLoading || filesLoading) {
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
                </div>
              </div>
              
              <div className="file-content flex-1 px-6 py-16">
                <div className="loading-state flex items-center justify-center">
                  <div className="loading-content text-center max-w-md mx-auto">
                    <div className="loading-animation mb-6">
                      <div className="loading-dots flex justify-center gap-2">
                        <div className="w-2 h-2 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#5F6368] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                    <p className="text-[#5F6368] text-sm font-medium mb-2">
                      {connectionsLoading ? 'Connecting to Google Drive...' : 'Loading your files...'}
                    </p>
                    <p className="text-[#9AA0A6] text-xs">
                      {connectionsLoading ? 'Establishing secure connection' : 'Please wait while we fetch your Drive contents'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    <div className="files-page min-h-screen p-5 relative" 
         style={{
           backgroundColor: '#FAFAFB',
           backgroundImage: `
             linear-gradient(to right, rgba(0, 0, 0, 0.015) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(0, 0, 0, 0.015) 1px, transparent 1px)
           `,
           backgroundSize: '32px 32px'
         }}>
      {/* Elegant Bordered Container */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="rounded-lg border border-[#19191C0A] bg-[#F9F9FA] p-4 shadow-[0px_9.36px_9.36px_0px_hsla(0,0%,0%,0.04)]">
          <div className="rounded-lg border border-[#FAFAFB] bg-white shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.03)] overflow-hidden">
            
            {/* Google Drive-like Header */}
            <div className="drive-header bg-white border-b border-[#EDEDF0] px-4 sm:px-6 py-4">
              <div className="header-content flex items-center justify-between">
                <div className="header-left flex items-center gap-2 sm:gap-4">
                  <Link href="/" className="back-button text-[#5F6368] hover:text-zinc-700 transition-colors">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <h1 className="page-title text-lg sm:text-xl font-normal text-[#202124]">
                    Google Drive
                  </h1>
                </div>
                
                <div className="header-right flex items-center gap-1 sm:gap-3">
                  <div className="view-controls flex items-center bg-[#F8F9FA] rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="view-btn h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <List className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="view-btn h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="refresh-btn border-[#DADCE0] hover:border-zinc-400 h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''} sm:mr-2`} />
                    <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                  
                  <Button size="sm" className="upload-btn h-7 sm:h-8 px-2 sm:px-3">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-section bg-white border-b border-[#EDEDF0] px-4 sm:px-6 py-3">
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
                <FileSkeleton viewMode={viewMode} count={8} />
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
                <FileListView
                  files={filteredAndSortedFiles}
                  expandedFolders={expandedFolders}
                  selectedFiles={selectedFiles}
                  isFolderLoading={isFolderLoading}
                  getFileName={getFileName}
                  getFileSize={getFileSize}
                  getDisplayStatus={getDisplayStatus}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  getFilesInFolder={getFilesInFolder}
                  isFolderFullySelected={isFolderFullySelected}
                  isFolderPartiallySelected={isFolderPartiallySelected}
                  isAllSelected={isAllSelected}
                  isIndeterminateEnhanced={isIndeterminateEnhanced}
                  toggleFolderExpansion={toggleFolderExpansion}
                  toggleFileSelection={toggleFileSelection}
                  toggleFolderSelection={toggleFolderSelection}
                  selectAllFiles={selectAllFiles}
                  deselectAllFiles={deselectAllFiles}
                  handleIndex={handleIndex}
                  handleDeindex={handleDeindex}
                  handleRemove={handleRemove}
                  indexMutation={indexMutation}
                  deindexMutation={deindexMutation}
                  removeFromListingMutation={removeFromListingMutation}
                />
              ) : (
                <FileGridView
                  currentFolderId={currentFolderId}
                  currentFolderContents={currentFolderId ? currentFolderContents : filteredAndSortedFiles}
                  navigationStack={navigationStack}
                  isFolderLoading={isFolderLoading}
                  getFileName={getFileName}
                  getFileSize={getFileSize}
                  getDisplayStatus={getDisplayStatus}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  isFolderFullySelected={isFolderFullySelected}
                  isFolderPartiallySelected={isFolderPartiallySelected}
                  selectedFiles={selectedFiles}
                  navigateToFolder={navigateToFolder}
                  navigateToBreadcrumb={navigateToBreadcrumb}
                  navigateBack={navigateBack}
                  toggleFileSelection={toggleFileSelection}
                  toggleFolderSelection={toggleFolderSelection}
                  handleIndex={handleIndex}
                  handleDeindex={handleDeindex}
                  handleRemove={handleRemove}
                  indexMutation={indexMutation}
                  deindexMutation={deindexMutation}
                  removeFromListingMutation={removeFromListingMutation}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Footer */}
      <DynamicFooter
        selectedCount={selectedFiles.size}
        totalSelectedCount={getTotalSelectedCount()}
        visibleSelectedCount={getVisibleSelectedCount()}
        isCountingInProgress={isCountingInProgress()}
        onCancel={() => setSelectedFiles(new Set())}
        onLoadSelected={handleBulkIndex}
        onRemoveSelected={handleBulkRemove}
        isLoading={isBulkIndexing}
        hasIndexedFiles={Array.from(selectedFiles).some(id => 
          getDisplayStatus({ resource_id: id, inode_type: 'file' } as FileResource) === 'indexed'
        )}
      />
    </div>
  );
}