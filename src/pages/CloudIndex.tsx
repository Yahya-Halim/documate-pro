import React, { useState, useEffect } from 'react';
import { useCloudStorage } from '../hooks/useCloudStorage';
import { DocumentItem, Folder } from '../lib/documents';

export default function Index() {
  const {
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
  } = useCloudStorage();

  const [showFilePicker, setShowFilePicker] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">FleetTracker - Cloud Sync</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">
                  {isOnline ? '🌐 Connected to GitHub' : '📱 Local Mode'}
                </span>
              </div>
              <button
                onClick={setupGitHubToken}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                🔑 Setup GitHub Token
              </button>
              <button
                onClick={forceSync}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                🔄 Force Sync
              </button>
            </div>
          </div>

          {/* Sync Status */}
          {lastSync && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  📅 Last Sync: {new Date(lastSync).toLocaleString()}
                </span>
                {isOnline && (
                  <span className="text-xs text-green-600">
                    ✅ Data shared across all devices
                  </span>
                )}
              </div>
            </div>
          )}

          {syncError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <span className="text-sm text-red-700">⚠️ {syncError}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Documents</h3>
              <p className="text-3xl font-bold text-blue-600">{data.documents.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📁 Folders</h3>
              <p className="text-3xl font-bold text-green-600">{data.folders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 Sync Status</h3>
              <p className="text-lg font-bold">
                {isOnline ? (
                  <span className="text-green-600">✅ Online</span>
                ) : (
                  <span className="text-yellow-600">⚠️ Offline</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.open('/documents', '_blank')}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left"
              >
                <h3 className="font-semibold text-blue-900">📄 Manage Documents</h3>
                <p className="text-sm text-gray-600 mt-1">Upload, edit, and organize your documents</p>
              </button>
              <button
                onClick={() => window.open('/folders', '_blank')}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left"
              >
                <h3 className="font-semibold text-green-900">📁 Manage Folders</h3>
                <p className="text-sm text-gray-600 mt-1">Create and organize folders</p>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">📋 How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Click "Setup GitHub Token" to connect to your GitHub repository</li>
              <li>Your data will be automatically synced to GitHub and shared across all devices</li>
              <li>Access your data from any device by visiting this GitHub Pages site</li>
              <li>All changes are automatically saved to the cloud</li>
              <li>If GitHub sync fails, data is saved locally and will sync when connection is restored</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
