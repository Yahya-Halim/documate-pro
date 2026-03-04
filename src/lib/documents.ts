// Document Management System utilities

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'png' | 'jpg' | 'other';
  folder: string;
  size: number;
  uploadedAt: string;
  description: string;
  tags: string[];
  fileUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

const STORAGE_KEY = 'dms_documents';
const FOLDERS_KEY = 'dms_folders';

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'general', name: 'General', color: 'hsl(192, 70%, 38%)' },
  { id: 'invoices', name: 'Invoices', color: 'hsl(32, 80%, 55%)' },
  { id: 'contracts', name: 'Contracts', color: 'hsl(152, 60%, 40%)' },
  { id: 'images', name: 'Images', color: 'hsl(280, 60%, 50%)' },
];

export function getDocuments(): DocumentItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveDocuments(docs: DocumentItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function addDocument(doc: Omit<DocumentItem, 'id' | 'uploadedAt'>): DocumentItem {
  const docs = getDocuments();
  const newDoc: DocumentItem = {
    ...doc,
    id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
    uploadedAt: new Date().toISOString(),
  };
  docs.push(newDoc);
  saveDocuments(docs);
  return newDoc;
}

export function updateDocument(id: string, updates: Partial<DocumentItem>): DocumentItem | null {
  const docs = getDocuments();
  const idx = docs.findIndex(d => d.id === id);
  if (idx === -1) return null;
  docs[idx] = { ...docs[idx], ...updates };
  saveDocuments(docs);
  return docs[idx];
}

export function deleteDocument(id: string): boolean {
  const docs = getDocuments();
  const filtered = docs.filter(d => d.id !== id);
  if (filtered.length === docs.length) return false;
  saveDocuments(filtered);
  // Also remove stored file
  localStorage.removeItem(`dms_file_${id}`);
  return true;
}

export function getDocumentById(id: string): DocumentItem | undefined {
  return getDocuments().find(d => d.id === id);
}

export function getFolders(): Folder[] {
  const raw = localStorage.getItem(FOLDERS_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_FOLDERS;
}

export function saveFolders(folders: Folder[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function addFolder(name: string, color: string): Folder {
  const folders = getFolders();
  const newFolder: Folder = {
    id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
    name,
    color,
  };
  folders.push(newFolder);
  saveFolders(folders);
  return newFolder;
}

export function deleteFolder(id: string): boolean {
  const folders = getFolders();
  const filtered = folders.filter(f => f.id !== id);
  if (filtered.length === folders.length) return false;
  saveFolders(filtered);
  // Move docs in this folder to 'general'
  const docs = getDocuments();
  docs.forEach(d => {
    if (d.folder === id) d.folder = 'general';
  });
  saveDocuments(docs);
  return true;
}

export function storeFile(docId: string, dataUrl: string) {
  localStorage.setItem(`dms_file_${docId}`, dataUrl);
}

export function getStoredFile(docId: string): string | null {
  return localStorage.getItem(`dms_file_${docId}`);
}

export function getFileTypeFromName(name: string): DocumentItem['type'] {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'png') return 'png';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  return 'other';
}

export function exportToCSV(docs: DocumentItem[]): string {
  const headers = ['ID', 'Name', 'Type', 'Folder', 'Size (bytes)', 'Uploaded At', 'Description', 'Tags'];
  const rows = docs.map(d => [
    d.id,
    `"${d.name}"`,
    d.type,
    d.folder,
    d.size.toString(),
    d.uploadedAt,
    `"${d.description}"`,
    `"${d.tags.join(', ')}"`,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(docs: DocumentItem[]) {
  const csv = exportToCSV(docs);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `documents_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadFile(docId: string, fileName: string) {
  const data = getStoredFile(docId);
  if (!data) return;
  const a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  a.click();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
