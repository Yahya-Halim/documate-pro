import { DocumentItem, Folder, formatFileSize, downloadFile } from '@/lib/documents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Eye, Pencil, Trash2, Download } from 'lucide-react';

interface DocumentTableProps {
  documents: DocumentItem[];
  folders: Folder[];
  onView: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export function DocumentTable({ documents, folders, onView, onEdit, onDelete }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <h3 className="font-heading text-lg font-semibold">No documents yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Upload your first document to get started</p>
      </div>
    );
  }

  const getFolderInfo = (folderId: string) => folders.find(f => f.id === folderId);
  const getIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-destructive" />;
    return <Image className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 pl-4 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">Document</th>
            <th className="pb-3 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Folder</th>
            <th className="pb-3 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Size</th>
            <th className="pb-3 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Date</th>
            <th className="pb-3 pr-4 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => {
            const folder = getFolderInfo(doc.folder);
            return (
              <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    {getIcon(doc.type)}
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {doc.tags.slice(0, 2).map(t => (
                            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                          ))}
                          {doc.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{doc.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 hidden md:table-cell">
                  {folder && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: folder.color }} />
                      <span className="text-sm">{folder.name}</span>
                    </div>
                  )}
                </td>
                <td className="py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatFileSize(doc.size)}</td>
                <td className="py-3 text-sm text-muted-foreground hidden lg:table-cell">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onView(doc)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadFile(doc.id, doc.name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(doc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(doc)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
