import { 
  FolderIcon, 
  FileIcon, 
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import type { FileResource } from '@/lib/types/api';

interface FileTypeIconProps {
  file: FileResource;
  className?: string;
}

export function FileTypeIcon({ file, className = "w-5 h-5" }: FileTypeIconProps) {
  if (file.inode_type === 'directory') {
    return <FolderIcon className={`${className} text-[#18181B]`} />;
  }

  // Get file extension
  const fileName = file.inode_path?.name || file.inode_path?.path || '';
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Return appropriate icon based on file type
  switch (extension) {
    case 'pdf':
      return <FileText className={`${className} text-red-500`} />;
    case 'doc':
    case 'docx':
      return <FileText className={`${className} text-blue-500`} />;
    case 'txt':
      return <FileText className={`${className} text-gray-500`} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className={`${className} text-green-500`} />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <FileVideo className={`${className} text-purple-500`} />;
    case 'mp3':
    case 'wav':
    case 'flac':
      return <FileAudio className={`${className} text-orange-500`} />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return <FileCode className={`${className} text-yellow-500`} />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FileArchive className={`${className} text-gray-600`} />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className={`${className} text-green-600`} />;
    case 'ppt':
    case 'pptx':
      return <Presentation className={`${className} text-orange-600`} />;
    default:
      return <FileIcon className={`${className} text-gray-400`} />;
  }
}
