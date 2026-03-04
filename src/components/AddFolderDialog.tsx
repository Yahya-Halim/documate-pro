import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AddFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, color: string) => void;
}

const PRESET_COLORS = [
  'hsl(192, 70%, 38%)',
  'hsl(32, 80%, 55%)',
  'hsl(152, 60%, 40%)',
  'hsl(280, 60%, 50%)',
  'hsl(340, 65%, 50%)',
  'hsl(210, 70%, 50%)',
];

export function AddFolderDialog({ open, onOpenChange, onAdd }: AddFolderDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName('');
    setColor(PRESET_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Folder Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Folder" />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-foreground' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
