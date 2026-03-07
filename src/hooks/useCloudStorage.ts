import React, { useState, useEffect } from 'react';
import { DocumentItem, Folder } from '../lib/documents';

interface CloudStorageData {
  documents: DocumentItem[];
  folders: Folder[];
  lastSync?: string;
}

const CLOUD_STORAGE_KEY = 'fleettracker_cloud_data';
const SYNC_ENDPOINT = 'https://api.github.com/repos/Yahya-Halim/documate-pro/contents/data.json';

export function useCloudStorage() {
  const [data, setData] = useState<CloudStorageData>({
    documents: [],
    folders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [syncError, setSyncError] = useState<string>('');

  // Load data from GitHub or localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setSyncError('');
      
      // First try to load from GitHub
      const response = await fetch(SYNC_ENDPOINT, {
        headers: {
          'Authorization': `token ${localStorage.getItem('github_token') || ''}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const githubData = await response.json();
        if (githubData.content) {
          const decodedData = JSON.parse(atob(githubData.content));
          setData(decodedData);
          setLastSync(new Date().toISOString());
          setIsOnline(true);
          localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(decodedData));
        }
      } else {
        throw new Error('Failed to fetch from GitHub');
      }
    } catch (error) {
      console.warn('Cloud sync failed, using local data:', error);
      
      // Fallback to localStorage
      const localData = localStorage.getItem(CLOUD_STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData);
        setData(parsedData);
        setLastSync(parsedData.lastSync || 'Never');
        setIsOnline(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveToCloud = async (newData: CloudStorageData) => {
    try {
      setSyncError('');
      const dataToSave: CloudStorageData = {
        ...newData,
        lastSync: new Date().toISOString()
      };
      
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${localStorage.getItem('github_token') || ''}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update data ${new Date().toISOString()}`,
          content: btoa(JSON.stringify(newData, null, 2)),
          sha: await getCurrentSha()
        })
      });

      if (response.ok) {
        setData(newData);
        setLastSync(new Date().toISOString());
        setIsOnline(true);
        localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(newData));
      } else {
        throw new Error('Failed to save to GitHub');
      }
    } catch (error) {
      console.error('Save to cloud failed:', error);
      setSyncError('Failed to sync with GitHub. Data saved locally only.');
      
      // Save locally as fallback
      localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    }
  };

  const getCurrentSha = async () => {
    try {
      const response = await fetch(SYNC_ENDPOINT, {
        headers: {
          'Authorization': `token ${localStorage.getItem('github_token') || ''}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.sha;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const updateDocuments = (documents: DocumentItem[]) => {
    const newData = { ...data, documents };
    setData(newData);
    saveToCloud(newData);
  };

  const updateFolders = (folders: Folder[]) => {
    const newData = { ...data, folders };
    setData(newData);
    saveToCloud(newData);
  };

  const addDocument = (document: DocumentItem) => {
    const newData = {
      ...data,
      documents: [...data.documents, document]
    };
    setData(newData);
    saveToCloud(newData);
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    const newData = {
      ...data,
      documents: data.documents.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    };
    setData(newData);
    saveToCloud(newData);
  };

  const deleteDocument = (id: string) => {
    const newData = {
      ...data,
      documents: data.documents.filter(doc => doc.id !== id)
    };
    setData(newData);
    saveToCloud(newData);
  };

  const addFolder = (folder: Folder) => {
    const newData = {
      ...data,
      folders: [...data.folders, folder]
    };
    setData(newData);
    saveToCloud(newData);
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    const newData = {
      ...data,
      folders: data.folders.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      )
    };
    setData(newData);
    saveToCloud(newData);
  };

  const deleteFolder = (id: string) => {
    const newData = {
      ...data,
      folders: data.folders.filter(folder => folder.id !== id)
    };
    setData(newData);
    saveToCloud(newData);
  };

  const setupGitHubToken = () => {
    const token = prompt('Enter your GitHub Personal Access Token:', localStorage.getItem('github_token') || '');
    if (token) {
      localStorage.setItem('github_token', token);
      loadData(); // Retry loading with new token
    }
  };

  const forceSync = () => {
    loadData();
  };

  return {
    data,
    isLoading,
    isOnline,
    lastSync,
    syncError,
    updateDocuments,
    updateFolders,
    addDocument,
    updateDocument,
    deleteDocument,
    addFolder,
    updateFolder,
    deleteFolder,
    setupGitHubToken,
    forceSync
  };
}
