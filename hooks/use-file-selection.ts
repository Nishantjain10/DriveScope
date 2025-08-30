import { useCallback } from 'react';
import type { FileResource } from '@/lib/types/api';

export function useFileSelection(
  selectedFiles: Set<string>,
  setSelectedFiles: (updater: (prev: Set<string>) => Set<string>) => void,
  folderContents: Record<string, FileResource[]>,
  loadingFolders: Set<string>,
  autoLoadFolderContents: (folderId: string) => void
) {
  // Selection helpers for strict hierarchy

  // Direct parent of a file or folder. returns undefined at root
  const getDirectParentId = useCallback(
    (childId: string): string | undefined => {
      for (const [folderId, subFiles] of Object.entries(folderContents)) {
        if (subFiles.some(sf => sf.resource_id === childId)) return folderId;
      }
      return undefined;
    },
    [folderContents]
  );

  // Get all descendant ids for a folder, recursive, from what is already loaded
  const getAllDescendantIds = useCallback(
    (folderId: string): string[] => {
      const out: string[] = [];
      const stack = [...(folderContents[folderId] || [])];

      while (stack.length) {
        const node = stack.pop()!;
        out.push(node.resource_id);
        if (node.inode_type === 'directory') {
          const kids = folderContents[node.resource_id] || [];
          for (const k of kids) stack.push(k);
        }
      }
      return out;
    },
    [folderContents]
  );

  // True only if every descendant is selected. if a subfolder is unloaded we only check what we have
  const areAllDescendantsSelected = useCallback(
    (folderId: string, sel: Set<string>): boolean => {
      const descendants = getAllDescendantIds(folderId);
      if (descendants.length === 0) return sel.has(folderId);
      return descendants.every(id => sel.has(id));
    },
    [getAllDescendantIds]
  );

  // Walk up and fix all ancestors of a given node id
  const bubbleSelectionUpFrom = useCallback(
    (nodeId: string, sel: Set<string>) => {
      let parent = getDirectParentId(nodeId);
      while (parent) {
        if (areAllDescendantsSelected(parent, sel)) {
          sel.add(parent);
        } else {
          sel.delete(parent);
        }
        parent = getDirectParentId(parent);
      }
    },
    [getDirectParentId, areAllDescendantsSelected]
  );

  // Cascade selection to all descendants of a folder id
  const cascadeSelectionToDescendants = useCallback(
    (folderId: string, select: boolean, sel: Set<string>) => {
      const all = getAllDescendantIds(folderId);
      for (const id of all) {
        if (select) sel.add(id);
        else sel.delete(id);
      }
      if (select) sel.add(folderId);
      else sel.delete(folderId);
    },
    [getAllDescendantIds]
  );

  // Toggle a single file or folder id
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);

      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);

      bubbleSelectionUpFrom(fileId, next);
      return next;
    });
  };

  // Toggle a folder by selecting or deselecting all of its descendants
  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      if (!folderContents[folderId] && !loadingFolders.has(folderId)) {
        autoLoadFolderContents(folderId);
      }

      setSelectedFiles(prev => {
        const next = new Set(prev);

        const allSelected = areAllDescendantsSelected(folderId, next);

        cascadeSelectionToDescendants(folderId, !allSelected, next);

        bubbleSelectionUpFrom(folderId, next);

        return next;
      });
    },
    [
      folderContents,
      loadingFolders,
      autoLoadFolderContents,
      areAllDescendantsSelected,
      cascadeSelectionToDescendants,
      bubbleSelectionUpFrom
    ]
  );

  // Select all files
  const selectAllFiles = useCallback((files: FileResource[]) => {
    const allFileIds = new Set<string>();

    files.forEach(file => {
      const isInSubfolder = Object.values(folderContents).some(subFiles =>
        subFiles.some(subFile => subFile.resource_id === file.resource_id)
      );
      if (!isInSubfolder) allFileIds.add(file.resource_id);

      if (file.inode_type === 'directory' && !folderContents[file.resource_id] && !loadingFolders.has(file.resource_id)) {
        autoLoadFolderContents(file.resource_id);
      }
    });

    Object.values(folderContents).forEach(subFiles => {
      subFiles.forEach(subFile => allFileIds.add(subFile.resource_id));
    });

    setSelectedFiles(() => allFileIds);
  }, [folderContents, loadingFolders, autoLoadFolderContents, setSelectedFiles]);

  // Deselect all files
  const deselectAllFiles = () => setSelectedFiles(() => new Set());

  // Check if all visible files are selected
  const isAllSelected = useCallback((files: FileResource[], expandedFolders: Set<string>) => {
    const visibleIds = getVisibleFileIds(files, folderContents, expandedFolders);
    if (visibleIds.length === 0) return false;
    return visibleIds.every(id => selectedFiles.has(id));
  }, [selectedFiles, folderContents]);

  // Check if selection is indeterminate
  const isIndeterminate = useCallback((files: FileResource[], expandedFolders: Set<string>) => {
    const visibleIds = getVisibleFileIds(files, folderContents, expandedFolders);
    if (visibleIds.length === 0) return false;
    const selectedVisible = visibleIds.filter(id => selectedFiles.has(id)).length;
    return selectedVisible > 0 && selectedVisible < visibleIds.length;
  }, [selectedFiles, folderContents]);

  // Enhanced indeterminate check
  const isIndeterminateEnhanced = useCallback((files: FileResource[]) => {
    const totalSelectable = getTotalSelectableFiles(files, folderContents);
    const totalVisible = getTotalVisibleFiles(files, folderContents, new Set());
    if (Object.keys(folderContents).length > 0) {
      return selectedFiles.size > 0 && selectedFiles.size < totalSelectable && totalSelectable > 0;
    }
    return selectedFiles.size > 0 && selectedFiles.size < totalVisible && totalVisible > 0;
  }, [selectedFiles.size, folderContents]);

  // Check if folder is fully selected
  const isFolderFullySelected = useCallback((folderId: string) => {
    return areAllDescendantsSelected(folderId, selectedFiles);
  }, [areAllDescendantsSelected, selectedFiles]);

  // Check if folder is partially selected
  const isFolderPartiallySelected = useCallback((folderId: string) => {
    const all = getAllDescendantIds(folderId);
    if (all.length === 0) return false;
    const selectedCount = all.filter(id => selectedFiles.has(id)).length;
    return selectedCount > 0 && selectedCount < all.length;
  }, [getAllDescendantIds, selectedFiles]);

  // Get total selected count
  const getTotalSelectedCount = useCallback((files: FileResource[]) => {
    let total = 0;
    files.forEach(file => {
      if (selectedFiles.has(file.resource_id)) {
        const isInSubfolder = Object.values(folderContents).some(subFiles =>
          subFiles.some(subFile => subFile.resource_id === file.resource_id)
        );
        if (!isInSubfolder) total++;
      }
    });
    Object.values(folderContents).forEach(subFiles => {
      subFiles.forEach(subFile => {
        if (selectedFiles.has(subFile.resource_id)) total++;
      });
    });
    return total;
  }, [selectedFiles, folderContents]);

  // Get visible selected count
  const getVisibleSelectedCount = useCallback((files: FileResource[], expandedFolders: Set<string>) => {
    let visibleCount = 0;
    files.forEach(file => {
      if (selectedFiles.has(file.resource_id)) visibleCount++;
    });
    Object.entries(folderContents).forEach(([folderId, subFiles]) => {
      if (expandedFolders.has(folderId)) {
        subFiles.forEach(subFile => {
          if (selectedFiles.has(subFile.resource_id)) visibleCount++;
        });
      }
    });
    return visibleCount;
  }, [selectedFiles, folderContents]);

  // Helper functions
  const getVisibleFileIds = (files: FileResource[], folderContents: Record<string, FileResource[]>, expandedFolders: Set<string>) => {
    const ids = new Set<string>();

    files.forEach(f => {
      const isInSubfolder = Object.values(folderContents).some(sub =>
        sub.some(sf => sf.resource_id === f.resource_id)
      );
      if (!isInSubfolder) ids.add(f.resource_id);
    });

    Object.entries(folderContents).forEach(([folderId, sub]) => {
      if (expandedFolders.has(folderId)) {
        sub.forEach(sf => ids.add(sf.resource_id));
      }
    });

    return Array.from(ids);
  };

  const getTotalVisibleFiles = (files: FileResource[], folderContents: Record<string, FileResource[]>, expandedFolders: Set<string>) => {
    let total = files.length;
    Object.entries(folderContents).forEach(([folderId, subFiles]) => {
      if (expandedFolders.has(folderId)) {
        total += subFiles.length;
      }
    });
    return total;
  };

  const getTotalSelectableFiles = (files: FileResource[], folderContents: Record<string, FileResource[]>) => {
    let total = files.length;
    Object.values(folderContents).forEach(subFiles => {
      total += subFiles.length;
    });
    return total;
  };

  return {
    // Selection functions
    toggleFileSelection,
    toggleFolderSelection,
    selectAllFiles,
    deselectAllFiles,
    
    // Selection checks
    isAllSelected,
    isIndeterminate,
    isIndeterminateEnhanced,
    isFolderFullySelected,
    isFolderPartiallySelected,
    
    // Counts
    getTotalSelectedCount,
    getVisibleSelectedCount,
    
    // Helper functions
    getDirectParentId,
    getAllDescendantIds,
    areAllDescendantsSelected,
    bubbleSelectionUpFrom,
    cascadeSelectionToDescendants,
  };
}
