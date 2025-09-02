"use client";

import React from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileTypeIcon } from './file-type-icon';
import { FileActions } from './file-actions';
import type { FileResource } from '@/lib/types/api';

interface FileListViewProps {
  files: FileResource[];
  expandedFolders: Set<string>;
  selectedFiles: Set<string>;
  isFolderLoading: (folderId: string) => boolean;
  getFileName: (file: FileResource) => string;
  getFileSize: (file: FileResource) => string;
  getDisplayStatus: (file: FileResource) => string;
  getStatusBadgeVariant: (status: string) => string;
  getFilesInFolder: (folderId: string) => FileResource[];
  isFolderFullySelected: (folderId: string) => boolean;
  isFolderPartiallySelected: (folderId: string) => boolean;
  isAllSelected: () => boolean;
  isIndeterminateEnhanced: () => boolean;
  toggleFolderExpansion: (folderId: string) => void;
  toggleFileSelection: (fileId: string) => void;
  toggleFolderSelection: (folderId: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  handleIndex: (resourceId: string) => void;
  handleDeindex: (resourceId: string) => void;
  handleRemove: (resourcePath: string) => void;
  indexMutation: { isPending: boolean };
  deindexMutation: { isPending: boolean };
  removeFromListingMutation: { isPending: boolean };
}

export function FileListView({
  files,
  expandedFolders,
  selectedFiles,
  isFolderLoading,
  getFileName,
  getFileSize,
  getDisplayStatus,
  getStatusBadgeVariant,
  getFilesInFolder,
  isFolderFullySelected,
  isFolderPartiallySelected,
  isAllSelected,
  isIndeterminateEnhanced,
  toggleFolderExpansion,
  toggleFileSelection,
  toggleFolderSelection,
  selectAllFiles,
  deselectAllFiles,
  handleIndex,
  handleDeindex,
  handleRemove,
  indexMutation,
  deindexMutation,
  removeFromListingMutation,
}: FileListViewProps) {
  return (
    <div className="files-list bg-white rounded-lg border border-[#EDEDF0] overflow-hidden">
      <div className="overflow-x-auto sm:overflow-x-visible">
        <Table className="files-table min-w-full">
        <TableHeader>
          <TableRow className="table-header-row border-b border-[#EDEDF0] bg-[#F8F9FA]">
            <TableHead className="selection-column text-[#5F6368] font-medium w-12">
              <input
                type="checkbox"
                checked={isAllSelected()}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminateEnhanced();
                }}
                onChange={() => isAllSelected() ? deselectAllFiles() : selectAllFiles()}
                className="header-checkbox"
              />
            </TableHead>
            <TableHead className="name-column text-[#5F6368] font-medium w-full max-w-0">Name</TableHead>
            <TableHead className="owner-column text-[#5F6368] font-medium hidden sm:table-cell">Owner</TableHead>
            <TableHead className="modified-column text-[#5F6368] font-medium hidden lg:table-cell">Last modified</TableHead>
            <TableHead className="size-column text-[#5F6368] font-medium hidden md:table-cell">File size</TableHead>
            <TableHead className="actions-column text-right text-[#5F6368] font-medium w-20">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
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
                    <div className="file-details flex items-center gap-1 min-w-0 max-w-[150px] sm:max-w-none">
                      <p className="file-name text-[#202124] text-sm truncate">
                        {getFileName(file)}
                      </p>
                      {/* Folder Expansion Toggle */}
                      {file.inode_type === 'directory' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolderExpansion(file.resource_id);
                          }}
                          className="folder-toggle-btn hover:bg-zinc-100 rounded transition-colors"
                        >
                          {expandedFolders.has(file.resource_id) ? (
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-800 border-neutral-500 rounded-lg" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-700 border-neutral-500 rounded-lg" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="owner-cell text-[#5F6368] text-sm hidden sm:table-cell">
                  me
                </TableCell>
                <TableCell className="modified-cell text-[#5F6368] text-sm hidden lg:table-cell">
                  {new Date(file.updated_at || file.created_at || Date.now()).toLocaleDateString()}
                </TableCell>
                <TableCell className="size-cell text-[#5F6368] text-sm hidden md:table-cell">
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
                        <div className="flex items-center justify-center gap-2 text-[#5F6368] text-sm sm:text-sm">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Loading folder contents...</span>
                          <span className="sm:hidden">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Actual sub-files */}
                  {!isFolderLoading(file.resource_id) && getFilesInFolder(file.resource_id).map((subFile) => (
                    <React.Fragment key={`${file.resource_id}-${subFile.resource_id}`}>
                      <TableRow 
                        className="sub-file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0] cursor-pointer bg-[#FAFAFB]"
                      >
                        <TableCell className="selection-cell pl-8">
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(subFile.resource_id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (subFile.inode_type === 'directory') {
                                toggleFolderSelection(subFile.resource_id);
                              } else {
                                toggleFileSelection(subFile.resource_id);
                              }
                            }}
                            className="file-checkbox"
                          />
                        </TableCell>
                        <TableCell className="name-cell">
                          <div className="file-info flex items-center gap-3">
                            <span className="file-icon">
                              <FileTypeIcon file={subFile} />
                            </span>
                            <div className="file-details flex items-center gap-2 min-w-0 max-w-[70px] sm:max-w-none">
                              <p className="file-name text-[#202124] text-sm truncate">
                                {getFileName(subFile)}
                              </p>
                              {/* Subfolder Expansion Toggle */}
                              {subFile.inode_type === 'directory' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFolderExpansion(subFile.resource_id);
                                  }}
                                  className="folder-toggle-btn hover:bg-zinc-100 rounded transition-colors p-1"
                                >
                                  {expandedFolders.has(subFile.resource_id) ? (
                                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="owner-cell text-[#5F6368] text-sm hidden sm:table-cell">
                          me
                        </TableCell>
                        <TableCell className="modified-cell text-[#5F6368] text-sm hidden lg:table-cell">
                          {new Date(subFile.updated_at || subFile.created_at || Date.now()).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="size-cell text-[#5F6368] text-sm hidden md:table-cell">
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
                      
                      {/* Sub-subfiles within expanded subfolders */}
                      {subFile.inode_type === 'directory' && expandedFolders.has(subFile.resource_id) && (
                        <>
                          {/* Loading state for subfolder */}
                          {isFolderLoading(subFile.resource_id) && (
                            <TableRow className="sub-sub-file-row border-b border-[#EDEDF0] bg-[#F5F5F5]">
                              <TableCell colSpan={6} className="text-center py-3 pl-12">
                                <div className="flex items-center justify-center gap-2 text-[#5F6368] text-sm sm:text-sm">
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span className="hidden sm:inline">Loading subfolder contents...</span>
                                  <span className="sm:hidden">Loading...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {/* Actual sub-subfiles */}
                          {!isFolderLoading(subFile.resource_id) && getFilesInFolder(subFile.resource_id).map((subSubFile) => (
                            <TableRow 
                              key={`${subFile.resource_id}-${subSubFile.resource_id}`}
                              className="sub-sub-file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0] cursor-pointer bg-[#F5F5F5]"
                            >
                              <TableCell className="selection-cell pl-12">
                                <input
                                  type="checkbox"
                                  checked={selectedFiles.has(subSubFile.resource_id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (subSubFile.inode_type === 'directory') {
                                      toggleFolderSelection(subSubFile.resource_id);
                                    } else {
                                      toggleFileSelection(subSubFile.resource_id);
                                    }
                                  }}
                                  className="file-checkbox"
                                />
                              </TableCell>
                              <TableCell className="name-cell">
                                <div className="file-info flex items-center gap-3">
                                  <span className="file-icon">
                                    <FileTypeIcon file={subSubFile} />
                                  </span>
                                  <div className="file-details min-w-0 max-w-[200px] sm:max-w-none">
                                    <p className="file-name text-[#202124] text-sm truncate">
                                      {getFileName(subSubFile)}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="owner-cell text-[#5F6368] text-sm hidden sm:table-cell">
                                me
                              </TableCell>
                              <TableCell className="modified-cell text-[#5F6368] text-sm hidden lg:table-cell">
                                {new Date(subSubFile.updated_at || subSubFile.created_at || Date.now()).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="size-cell text-[#5F6368] text-sm hidden md:table-cell">
                                {getFileSize(subSubFile)}
                              </TableCell>
                              <TableCell className="actions-cell text-right">
                                <FileActions
                                  file={subSubFile}
                                  status={getDisplayStatus(subSubFile)}
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
                </>
              )}
            </React.Fragment>
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}