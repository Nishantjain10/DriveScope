import { 
  MoreVertical, 
  CheckCircle, 
  RotateCcw, 
  XCircle, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FileResource } from '@/lib/types/api';

interface FileActionsProps {
  file: FileResource;
  status: string;
  statusVariant: string;
  onIndex: (resourceId: string) => void;
  onDeindex: (resourceId: string) => void;
  onRemove: (resourcePath: string) => void;
  isIndexing: boolean;
  isDeindexing: boolean;
  isRemoving: boolean;
}

export function FileActions({
  file,
  status,
  statusVariant,
  onIndex,
  onDeindex,
  onRemove,
  isIndexing,
  isDeindexing,
  isRemoving
}: FileActionsProps) {
  const handleRemove = () => {
    const identifier = file.inode_path?.path || file.inode_path?.name || file.resource_id;
    onRemove(identifier);
  };

  return (
    <div className="action-buttons flex items-center justify-end gap-2">
      {/* Status Badge */}
      <Badge 
        variant={statusVariant as "default" | "secondary" | "destructive" | "outline" | "no-border"}
        className="status-badge text-xs px-2 py-1 font-medium"
      >
        {status === 'indexed' && '✅ Indexed'}
        {status === 'pending' && '⏳ Pending'}
        {status === 'error' && '❌ Error'}
        {status === 'deindexed' && '↩️ De-indexed'}
        {status === 'not-indexed' && '📄 Not Indexed'}
        {status === 'no-status' && ''}
      </Badge>
      
      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant="ghost" 
            className="action-btn h-8 w-8 p-0 hover:bg-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-zinc-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Index/De-index Actions for Knowledge Base - Files and folders can be indexed */}
          {(file.inode_type === 'file' || file.inode_type === 'directory') && (
            <>
              {status === 'indexed' ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onDeindex(file.resource_id);
                  }}
                  disabled={isDeindexing}
                  className="text-zinc-700 hover:bg-zinc-50"
                >
                  {isDeindexing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2 text-zinc-500" />
                  )}
                  Remove from Knowledge Base
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onIndex(file.resource_id);
                  }}
                  disabled={isIndexing}
                  className="text-zinc-700 hover:bg-zinc-50"
                >
                  {isIndexing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2 text-zinc-500" />
                  )}
                  Add to Knowledge Base
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Remove from listing action */}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
            disabled={isRemoving}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Remove from listing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
