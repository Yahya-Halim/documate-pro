import { useState, useCallback } from 'react';
import { apiClient, ApiDocument, DocumentType, User } from '@/lib/api';

// Convert API document to frontend DocumentItem format
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
  // Additional fields from API
  document_type: string;
  document_type_name?: string;
  document_type_color?: string;
  rc_number?: string;
  load_number?: string;
  dispatcher?: string;
  broker_shipper?: string;
  pickup_address?: string;
  pickup_datetime?: string;
  dropoff_address?: string;
  dropoff_datetime?: string;
  miles?: number;
  dh_miles?: number;
  total_miles?: number;
  amount?: number;
  rate_per_mile?: number;
  bol_number?: string;
  dispatcher_company?: string;
  phone_number?: string;
  email?: string;
  rc_amount?: number;
  dispatcher_percentage?: number;
  dispatcher_amount?: number;
  receipt_number?: string;
  receipt_date?: string;
  invoice_number?: string;
  quickpay_percentage?: number;
  amount_received?: number;
  rlp_number?: string;
  date_received?: string;
  driver_id: string;
  driver_name: string;
  driver_username: string;
  receipt_url?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

function apiDocumentToDocumentItem(doc: ApiDocument): DocumentItem {
  const fileType = doc.document_name?.split('.').pop()?.toLowerCase() || 'other';
  
  return {
    id: doc.id,
    name: doc.document_name || doc.title,
    type: fileType === 'pdf' ? 'pdf' : fileType === 'png' ? 'png' : fileType === 'jpg' || fileType === 'jpeg' ? 'jpg' : 'other',
    folder: doc.document_type,
    size: 0, // Size not available from API
    uploadedAt: doc.created_at,
    description: doc.description || '',
    tags: [doc.document_type_name || doc.document_type],
    fileUrl: doc.receipt_url,
    // Include all API fields
    document_type: doc.document_type,
    document_type_name: doc.document_type_name,
    document_type_color: doc.document_type_color,
    rc_number: doc.rc_number,
    load_number: doc.load_number,
    dispatcher: doc.dispatcher,
    broker_shipper: doc.broker_shipper,
    pickup_address: doc.pickup_address,
    pickup_datetime: doc.pickup_datetime,
    dropoff_address: doc.dropoff_address,
    dropoff_datetime: doc.dropoff_datetime,
    miles: doc.miles,
    dh_miles: doc.dh_miles,
    total_miles: doc.total_miles,
    amount: doc.amount,
    rate_per_mile: doc.rate_per_mile,
    bol_number: doc.bol_number,
    dispatcher_company: doc.dispatcher_company,
    phone_number: doc.phone_number,
    email: doc.email,
    rc_amount: doc.rc_amount,
    dispatcher_percentage: doc.dispatcher_percentage,
    dispatcher_amount: doc.dispatcher_amount,
    receipt_number: doc.receipt_number,
    receipt_date: doc.receipt_date,
    invoice_number: doc.invoice_number,
    quickpay_percentage: doc.quickpay_percentage,
    amount_received: doc.amount_received,
    rlp_number: doc.rlp_number,
    date_received: doc.date_received,
    driver_id: doc.driver_id,
    driver_name: doc.driver_name,
    driver_username: doc.driver_username,
    receipt_url: doc.receipt_url,
  };
}

function documentTypeToFolder(docType: DocumentType): Folder {
  return {
    id: docType.id,
    name: docType.name,
    color: docType.color,
  };
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [docsData, docTypesData] = await Promise.all([
        apiClient.getDocuments(),
        apiClient.getDocumentTypes(),
      ]);

      const documents = docsData.map(apiDocumentToDocumentItem);
      const folders = docTypesData.map(documentTypeToFolder);

      setDocuments(documents);
      setFolders(folders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddDocument = useCallback(async (file: File, folder: string, description: string, tags: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current user info (for demo, using default values)
      const documentData = {
        title: file.name,
        document_type: folder,
        driver_id: 'admin-001', // Default admin user
        driver_name: 'Fleet Manager',
        driver_username: 'admin',
        description,
        document_name: file.name,
      };

      const formData = apiClient.createDocumentFormData(documentData, file);
      const newDoc = await apiClient.createDocument(formData);
      
      // Refresh documents list
      await refresh();
      
      return apiDocumentToDocumentItem(newDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const handleUpdateDocument = useCallback(async (id: string, updates: Partial<DocumentItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = apiClient.createDocumentFormData(updates);
      const updatedDoc = await apiClient.updateDocument(id, formData);
      
      // Update local state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id ? apiDocumentToDocumentItem(updatedDoc) : doc
        )
      );
      
      return apiDocumentToDocumentItem(updatedDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteDocument = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.deleteDocument(id);
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddFolder = useCallback(async (name: string, color: string) => {
    // This would require an API endpoint to create new document types
    // For now, just refresh to get the latest folders
    await refresh();
  }, [refresh]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    // This would require an API endpoint to delete document types
    // For now, just refresh to get the latest folders
    await refresh();
  }, [refresh]);

  // Initial load
  useState(() => {
    refresh();
  });

  return {
    documents,
    folders,
    loading,
    error,
    refresh,
    addDocument: handleAddDocument,
    updateDocument: handleUpdateDocument,
    deleteDocument: handleDeleteDocument,
    addFolder: handleAddFolder,
    deleteFolder: handleDeleteFolder,
  };
}
