"use client";

import "../app.css";
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
  Upload
} from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const {
    // State
    viewMode,
    selectedFiles,
    filteredAndSortedFiles,
    
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
    
    // Selection functions
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
    isAllSelected,
    isIndeterminate,
    
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
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#EDEDF0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-[#5F6368] hover:text-[#202124]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-[#EDEDF0]"></div>
            <h1 className="text-xl font-semibold text-[#202124]">Google Drive Files</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="refresh-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="upload-btn"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4">
        <FileSearchBar
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* View Toggle */}
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="view-toggle-btn"
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="view-toggle-btn"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
        </div>
        
        <div className="text-sm text-[#5F6368]">
          {filteredAndSortedFiles.length} item{filteredAndSortedFiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* File Content */}
      <div className="px-6 pb-6">
        {filteredAndSortedFiles.length === 0 ? (
          <div className="empty-state bg-white rounded-lg border border-[#EDEDF0] p-12 text-center">
            <div className="max-w-md mx-auto">
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
                      className="header-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
                          <FileTypeIcon file={file} />
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
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="files-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedFiles.map((file) => (
              <div 
                key={file.resource_id}
                className="file-card bg-white rounded-lg border border-[#EDEDF0] p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="file-card-header flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.resource_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.resource_id);
                    }}
                    className="file-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
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
                
                <div className="file-card-content text-center">
                  <div className="file-icon-wrapper mb-3 flex justify-center">
                    <FileTypeIcon file={file} className="w-12 h-12" />
                  </div>
                  <h3 className="file-name text-sm font-medium text-[#202124] mb-2 line-clamp-2">
                    {getFileName(file)}
                  </h3>
                  <p className="file-size text-xs text-[#5F6368] mb-2">
                    {getFileSize(file)}
                  </p>
                  <p className="file-date text-xs text-[#5F6368]">
                    {new Date(file.updated_at || file.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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