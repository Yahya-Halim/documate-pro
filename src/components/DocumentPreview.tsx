import { DocumentItem, Folder, getStoredFile } from '@/lib/documents';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Calendar, HardDrive, Tag } from 'lucide-react';
import { formatFileSize } from '@/lib/documents';

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentItem;
  folders: Folder[];
}

export function DocumentPreview({ open, onOpenChange, document, folders }: DocumentPreviewProps) {
  const fileData = getStoredFile(document.id);
  const folder = folders.find(f => f.id === document.folder);
  const isImage = document.type === 'png' || document.type === 'jpg';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            {isImage ? <Image className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-destructive" />}
            {document.name}
          </DialogTitle>
        </DialogHeader>

        {isImage && fileData && (
          <div className="rounded-lg overflow-hidden border">
            <img src={fileData} alt={document.name} className="w-full h-auto max-h-64 object-contain bg-muted" />
          </div>
        )}

        {document.type === 'pdf' && fileData && (
          <div className="rounded-lg overflow-hidden border bg-muted flex items-center justify-center h-48">
            <div className="text-center">
              <FileText className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">PDF Preview</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {document.description && (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(document.uploadedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" />
              {formatFileSize(document.size)}
            </span>
            {folder && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: folder.color }} />
                {folder.name}
              </span>
            )}
          </div>

          {document.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {document.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
