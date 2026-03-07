const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiDocument {
  id: string;
  title: string;
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
  document_name?: string;
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
  description?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'driver';
  created_at: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Documents
  async getDocuments(params: {
    driver_id?: string;
    document_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiDocument[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.request<ApiDocument[]>(`/documents${query ? `?${query}` : ''}`);
  }

  async getDocument(id: string): Promise<ApiDocument> {
    return this.request<ApiDocument>(`/documents/${id}`);
  }

  async createDocument(formData: FormData): Promise<ApiDocument> {
    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async updateDocument(id: string, formData: FormData): Promise<ApiDocument> {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Document Types
  async getDocumentTypes(): Promise<DocumentType[]> {
    return this.request<DocumentType[]>('/document-types');
  }

  // Users
  async getUsers(params: { role?: string } = {}): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params.role) {
      searchParams.append('role', params.role);
    }

    const query = searchParams.toString();
    return this.request<User[]>(`/users${query ? `?${query}` : ''}`);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    return this.request<{ status: string; database: string; timestamp: string }>('/health');
  }

  // File Upload Helper
  createDocumentFormData(data: Partial<ApiDocument>, file?: File): FormData {
    const formData = new FormData();
    
    // Add all document fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add file if provided
    if (file) {
      formData.append('file', file);
    }

    return formData;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
