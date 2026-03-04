import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, FileText, Image } from 'lucide-react';
import { Folder } from '@/lib/documents';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  onUpload: (file: File, folder: string, description: string, tags: string[]) => Promise<any>;
}

export function UploadDialog({ open, onOpenChange, folders, onUpload }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState(folders[0]?.id || '');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setFolder(folders[0]?.id || '');
    setDescription('');
    setTags('');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    await onUpload(file, folder, description, tags.split(',').map(t => t.trim()).filter(Boolean));
    setUploading(false);
    reset();
    onOpenChange(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const acceptedTypes = '.pdf,.png,.jpg,.jpeg';
  const fileIcon = file?.type.includes('pdf') ? <FileText className="h-8 w-8 text-destructive" /> : <Image className="h-8 w-8 text-primary" />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Upload Document</DialogTitle>
        </DialogHeader>

        <div
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center gap-3">
              {fileIcon}
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop a file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG accepted</p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label>Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {folders.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="invoice, 2024, finance" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
