import { useState, useMemo } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentItem, downloadCSV } from '@/lib/documents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UploadDialog } from '@/components/UploadDialog';
import { EditDocumentDialog } from '@/components/EditDocumentDialog';
import { AddFolderDialog } from '@/components/AddFolderDialog';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentTable } from '@/components/DocumentTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, FolderPlus, Download, Search, FileText, FolderOpen, Trash2 } from 'lucide-react';

const Index = () => {
  const { documents, folders, addDocument, updateDocument, deleteDocument, addFolder, deleteFolder } = useDocuments();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = useMemo(() => {
    let docs = documents;
    if (activeFolder) docs = docs.filter(d => d.folder === activeFolder);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [documents, activeFolder, searchQuery]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(d => {
      counts[d.folder] = (counts[d.folder] || 0) + 1;
    });
    return counts;
  }, [documents]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold leading-tight">DocVault</h1>
              <p className="text-xs text-muted-foreground">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadCSV(documents)} disabled={documents.length === 0}>
              <Download className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Folders */}
          <aside className="lg:w-56 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Folders</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFolderDialogOpen(true)}>
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  !activeFolder ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                }`}
                onClick={() => setActiveFolder(null)}
              >
                <FolderOpen className="h-4 w-4" />
                All Documents
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">{documents.length}</Badge>
              </button>
              {folders.map(f => (
                <div key={f.id} className="group flex items-center">
                  <button
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeFolder === f.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'
                    }`}
                    onClick={() => setActiveFolder(f.id)}
                  >
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: f.color }} />
                    {f.name}
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">{folderCounts[f.id] || 0}</Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => { deleteFolder(f.id); if (activeFolder === f.id) setActiveFolder(null); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name, description or tag..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card border">
              <DocumentTable
                documents={filteredDocs}
                folders={folders}
                onView={setPreviewDoc}
                onEdit={setEditDoc}
                onDelete={setDeleteDoc}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Dialogs */}
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} folders={folders} onUpload={addDocument} />
      {editDoc && <EditDocumentDialog open={!!editDoc} onOpenChange={(o) => !o && setEditDoc(null)} document={editDoc} folders={folders} onSave={updateDocument} />}
      {previewDoc && <DocumentPreview open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)} document={previewDoc} folders={folders} />}
      <AddFolderDialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen} onAdd={addFolder} />

      <AlertDialog open={!!deleteDoc} onOpenChange={(o) => !o && setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDoc?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteDoc) { deleteDocument(deleteDoc.id); setDeleteDoc(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
