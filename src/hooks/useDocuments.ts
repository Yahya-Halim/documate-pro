import { useState, useCallback } from 'react';
import { DocumentItem, Folder, getDocuments, getFolders, addDocument, updateDocument, deleteDocument, addFolder, deleteFolder, storeFile, getFileTypeFromName } from '@/lib/documents';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>(getDocuments);
  const [folders, setFolders] = useState<Folder[]>(getFolders);

  const refresh = useCallback(() => {
    setDocuments(getDocuments());
    setFolders(getFolders());
  }, []);

  const handleAddDocument = useCallback((file: File, folder: string, description: string, tags: string[]) => {
    return new Promise<DocumentItem>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const doc = addDocument({
          name: file.name,
          type: getFileTypeFromName(file.name),
          folder,
          size: file.size,
          description,
          tags,
          fileUrl: undefined,
        });
        storeFile(doc.id, reader.result as string);
        refresh();
        resolve(doc);
      };
      reader.readAsDataURL(file);
    });
  }, [refresh]);

  const handleUpdateDocument = useCallback((id: string, updates: Partial<DocumentItem>) => {
    updateDocument(id, updates);
    refresh();
  }, [refresh]);

  const handleDeleteDocument = useCallback((id: string) => {
    deleteDocument(id);
    refresh();
  }, [refresh]);

  const handleAddFolder = useCallback((name: string, color: string) => {
    addFolder(name, color);
    refresh();
  }, [refresh]);

  const handleDeleteFolder = useCallback((id: string) => {
    deleteFolder(id);
    refresh();
  }, [refresh]);

  return {
    documents,
    folders,
    refresh,
    addDocument: handleAddDocument,
    updateDocument: handleUpdateDocument,
    deleteDocument: handleDeleteDocument,
    addFolder: handleAddFolder,
    deleteFolder: handleDeleteFolder,
  };
}
