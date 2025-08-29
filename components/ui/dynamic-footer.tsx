import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DynamicFooterProps {
  selectedCount: number;
  onCancel: () => void;
  onLoadSelected: () => void;
  isLoading: boolean;
}

export function DynamicFooter({
  selectedCount,
  onCancel,
  onLoadSelected,
  isLoading
}: DynamicFooterProps) {
  if (selectedCount === 0) return null;

  return (
    <>
      <div className="dynamic-footer fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDEDF0] shadow-lg z-50">
        <div className="footer-content px-6 py-4 flex items-center justify-between">
          <div className="footer-left">
            <span className="text-sm text-[#5F6368]">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="footer-right flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              className="cancel-selection-btn"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={onLoadSelected}
              disabled={isLoading}
              className="load-selected-files-btn bg-[#18181B] text-white hover:bg-[#27272A]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Load Selected Files
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add bottom padding when footer is visible */}
      <div className="h-20"></div>
    </>
  );
}
