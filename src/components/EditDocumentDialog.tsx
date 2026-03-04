import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DocumentItem, Folder } from '@/lib/documents';

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentItem;
  folders: Folder[];
  onSave: (id: string, updates: Partial<DocumentItem>) => void;
}

export function EditDocumentDialog({ open, onOpenChange, document, folders, onSave }: EditDocumentDialogProps) {
  const [name, setName] = useState(document.name);
  const [folder, setFolder] = useState(document.folder);
  const [description, setDescription] = useState(document.description);
  const [tags, setTags] = useState(document.tags.join(', '));

  const handleSave = () => {
    onSave(document.id, {
      name,
      folder,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
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
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
