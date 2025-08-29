import { Button } from '@/components/ui/button';

interface DynamicFooterProps {
  selectedCount: number;
  totalSelectedCount: number;
  onCancel: () => void;
  onLoadSelected: () => void;
  onRemoveSelected?: () => void;
  hasIndexedFiles?: boolean;
  isLoading?: boolean;
}

export function DynamicFooter({
  selectedCount,
  totalSelectedCount,
  onCancel,
  onLoadSelected,
  onRemoveSelected,
  hasIndexedFiles = false,
  isLoading = false,
}: DynamicFooterProps) {
  const showNestedCount = totalSelectedCount > selectedCount;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {showNestedCount ? (
                <>
                  <span className="font-medium">{selectedCount}</span> visible,{' '}
                  <span className="font-medium">{totalSelectedCount}</span> total selected
                </>
              ) : (
                <>
                  <span className="font-medium">{selectedCount}</span> selected
                </>
              )}
            </span>
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
  );
}
