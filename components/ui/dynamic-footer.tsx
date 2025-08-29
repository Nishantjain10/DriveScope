import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DynamicFooterProps {
  selectedCount: number;
  totalSelectedCount: number;
  visibleSelectedCount: number;
  isCountingInProgress: boolean;
  onCancel: () => void;
  onLoadSelected: () => void;
  onRemoveSelected?: () => void;
  hasIndexedFiles?: boolean;
  isLoading?: boolean;
}

export function DynamicFooter({
  selectedCount,
  totalSelectedCount,
  visibleSelectedCount,
  isCountingInProgress,
  onCancel,
  onLoadSelected,
  onRemoveSelected,
  hasIndexedFiles = false,
  isLoading = false,
}: DynamicFooterProps) {
  // Only show footer when items are selected
  if (selectedCount === 0) return null;
  
  const showNestedCount = totalSelectedCount > visibleSelectedCount;
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isCountingInProgress ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Counting folder contents...</span>
                </div>
              ) : (
                <span className="text-sm text-gray-600">
                  {showNestedCount ? (
                    <>
                      <span className="font-medium">{visibleSelectedCount}</span> visible,{' '}
                      <span className="font-medium">{totalSelectedCount}</span> total selected
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{visibleSelectedCount}</span> selected
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            
            {hasIndexedFiles && onRemoveSelected && (
              <Button
                variant="outline"
                onClick={onRemoveSelected}
                disabled={isLoading}
                className="text-red-600 border-red-200 hover:text-red-700 hover:border-red-300"
              >
                Remove Selected
              </Button>
            )}
            
            <Button
              onClick={onLoadSelected}
              disabled={isLoading}
              className="bg-[#18181B] hover:bg-[#262626] text-white"
            >
              {isLoading ? 'Processing...' : 'Load Selected Files'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add bottom padding when footer is visible */}
      <div className="h-20"></div>
    </>
  );
}
