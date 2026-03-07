import React, { useState, useEffect } from 'react';
import { DocumentItem, Folder } from '../lib/documents';

interface LocalStorageData {
  documents: DocumentItem[];
  folders: Folder[];
}

const LOCAL_FILE_KEY = 'fleettracker_data_file_path';

export function useLocalStorageFile() {
  const [filePath, setFilePath] = useState<string>('');
  const [data, setData] = useState<LocalStorageData>({
    documents: [],
    folders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load file path on mount
  useEffect(() => {
    const savedPath = localStorage.getItem(LOCAL_FILE_KEY);
    if (savedPath) {
      setFilePath(savedPath);
      loadDataFromFile(savedPath);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadDataFromFile = async (path: string) => {
    try {
      // In a real browser environment, we'd use File System Access API
      // For now, we'll simulate with a file picker
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const text = await file.text();
          const jsonData = JSON.parse(text);
          setData(jsonData);
          setIsLoading(false);
        }
      };
      fileInput.click();
    } catch (error) {
      console.error('Error loading file:', error);
      setIsLoading(false);
    }
  };

  const saveDataToFile = async () => {
    if (!filePath) {
      // Prompt user to choose save location
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `fleettracker_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      return;
    }

    try {
      // In a real implementation with File System Access API
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `fleettracker_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const setFilePathAndSave = (path: string) => {
    setFilePath(path);
    localStorage.setItem(LOCAL_FILE_KEY, path);
  };

  const updateDocuments = (documents: DocumentItem[]) => {
    setData(prev => ({ ...prev, documents }));
  };

  const updateFolders = (folders: Folder[]) => {
    setData(prev => ({ ...prev, folders }));
  };

  const addDocument = (document: DocumentItem) => {
    setData(prev => ({
      ...prev,
      documents: [...prev.documents, document]
    }));
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setData(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    }));
  };

  const deleteDocument = (id: string) => {
    setData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  const addFolder = (folder: Folder) => {
    setData(prev => ({
      ...prev,
      folders: [...prev.folders, folder]
    }));
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setData(prev => ({
      ...prev,
      folders: prev.folders.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      )
    }));
  };

  const deleteFolder = (id: string) => {
    setData(prev => ({
      ...prev,
      folders: prev.folders.filter(folder => folder.id !== id)
    }));
  };

  return {
    filePath,
    data,
    isLoading,
    setFilePath: setFilePathAndSave,
    loadDataFromFile,
    saveDataToFile,
    updateDocuments,
    updateFolders,
    addDocument,
    updateDocument,
    deleteDocument,
    addFolder,
    updateFolder,
    deleteFolder
  };
}
