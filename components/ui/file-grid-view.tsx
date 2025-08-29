"use client";

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { BreadcrumbNav } from './breadcrumb-nav';
import { LoadingBar } from './loading-bar';
import { FileTypeIcon } from './file-type-icon';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { FileResource } from '@/lib/types/api';

interface FileGridViewProps {
  currentFolderId: string | null;
  currentFolderContents: FileResource[];
  navigationStack: Array<{ id: string; name: string; }>;
  isFolderLoading: (folderId: string) => boolean;
  getFileName: (file: FileResource) => string;
  getFileSize: (file: FileResource) => string;
  getDisplayStatus: (file: FileResource) => string;
  getStatusBadgeVariant: (status: string) => string;
  isFolderFullySelected: (folderId: string) => boolean;
  isFolderPartiallySelected: (folderId: string) => boolean;
  selectedFiles: Set<string>;
  navigateToFolder: (folderId: string, folderName: string) => void;
  navigateToBreadcrumb: (targetStack: Array<{ id: string; name: string }>, targetFolder: { id: string; name: string }) => void;
  navigateBack: () => void;
  toggleFileSelection: (fileId: string) => void;
  toggleFolderSelection: (folderId: string) => void;
  handleIndex: (resourceId: string) => void;
  handleDeindex: (resourceId: string) => void;
  handleRemove: (resourcePath: string) => void;
  indexMutation: { isPending: boolean };
  deindexMutation: { isPending: boolean };
  removeFromListingMutation: { isPending: boolean };
}

export function FileGridView({
  currentFolderId,
  currentFolderContents,
  navigationStack,
  isFolderLoading,
  getFileName,
  getFileSize,
  getDisplayStatus,
  getStatusBadgeVariant,
  isFolderFullySelected,
  isFolderPartiallySelected,
  selectedFiles,
  navigateToFolder,
  navigateToBreadcrumb,
  navigateBack,
  toggleFileSelection,
  toggleFolderSelection,
  handleIndex,
  handleDeindex,
  handleRemove,
  indexMutation,
  deindexMutation,
  removeFromListingMutation,
}: FileGridViewProps) {
  return (
    <div className="files-grid-container">
      {/* Navigation Breadcrumb */}
      <BreadcrumbNav
        currentFolderId={currentFolderId}
        navigationStack={navigationStack}
        navigateBack={navigateBack}
        navigateToFolder={navigateToFolder}
        navigateToBreadcrumb={navigateToBreadcrumb}
      />

      {/* Loading Bar */}
      {isFolderLoading(currentFolderId || '') && <LoadingBar />}

      {/* Grid View */}
      <div className="files-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentFolderContents.map((file) => (
                      <div 
              key={file.resource_id}
              className={`file-card bg-white rounded-lg border border-[#EDEDF0] p-4 hover:shadow-md transition-all cursor-pointer relative ${
                isFolderLoading(file.resource_id) ? 'opacity-50' : ''
              }`}
            >
            {/* Selection Checkbox */}
            <div className="selection-checkbox absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
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
            </div>

            {/* More Options Menu */}
            <div className="more-options absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="more-options-btn p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (file.inode_type === 'directory') {
                        navigateToFolder(file.resource_id, getFileName(file));
                      }
                    }}
                  >
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (getDisplayStatus(file) === 'indexed') {
                        handleDeindex(file.resource_id);
                      } else {
                        handleIndex(file.resource_id);
                      }
                    }}
                  >
                    {getDisplayStatus(file) === 'indexed' ? 'Remove from Knowledge Base' : 'Add to Knowledge Base'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file.inode_path.path || file.resource_id);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    Remove from Listing
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div 
              className="card-content text-center mt-4 cursor-pointer"
              onClick={() => {
                if (file.inode_type === 'directory') {
                  navigateToFolder(file.resource_id, getFileName(file));
                }
              }}
            >
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
                <Badge 
                  variant={getStatusBadgeVariant(getDisplayStatus(file)) as "default" | "secondary" | "destructive" | "outline" | "no-border"}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
