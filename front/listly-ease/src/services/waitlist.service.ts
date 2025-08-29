import { tokenStorage } from '../utils/token';

export interface Service {
  id: string;
  organizerId: string;
  name: string;
  description?: string;
  slug: string;
  waitlistTitle?: string;
  waitlistDescription?: string;
  waitlistBackground?: string;
  image?: string;
  category?: string; // Legacy field for backward compatibility
  categories?: string[]; // New field for multiple categories (max 3)
  tagline?: string;
  fullDescription?: string;
  icon?: string;
  participantCount: number;
  developer?: string;
  language?: string; // Legacy field
  languages?: string[]; // New field for multiple languages
  platform?: string; // Legacy field
  platforms?: string[]; // New field for multiple platforms
  launchDate?: string;
  screenshots?: string[];
  rating?: number;
  waitlistUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  slug: string;
  waitlistTitle?: string;
  waitlistDescription?: string;
  waitlistBackground?: string;
  image?: string;
  category?: string; // Legacy field
  categories?: string[]; // New field for multiple categories (max 3)
  tagline?: string;
  fullDescription?: string;
  icon?: string;
  developer?: string;
  language?: string; // Legacy field
  languages?: string[]; // New field
  platform?: string; // Legacy field
  platforms?: string[]; // New field
  launchDate?: string;
  screenshots?: string[];
  rating?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  slug?: string;
  waitlistTitle?: string;
  waitlistDescription?: string;
  waitlistBackground?: string;
  image?: string;
  category?: string; // Legacy field
  categories?: string[]; // New field for multiple categories (max 3)
  tagline?: string;
  fullDescription?: string;
  icon?: string;
  developer?: string;
  language?: string; // Legacy field
  languages?: string[]; // New field
  platform?: string; // Legacy field
  platforms?: string[]; // New field
  launchDate?: string;
  screenshots?: string[];
  rating?: number;
}

export interface WaitlistDetails {
  title: string;
  description: string;
  background: string;
  currentParticipants: number;
}

export interface JoinWaitlistRequest {
  email: string;
}

export interface JoinWaitlistResponse {
  message: string;
  waitlistEntryId: string;
}

class WaitlistService {
  private readonly baseUrl = '/api';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = tokenStorage.get();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !endpoint.startsWith('/public/')) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP error! status: ${response.status}`;
      
      if (response.status === 401) {
        tokenStorage.remove();
        // Only redirect to login if this is NOT a public endpoint
        if (!endpoint.startsWith('/public/')) {
          // Don't redirect automatically, just throw the error
          // Let the calling code decide what to do
          throw new Error('Authentication required');
        }
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(message);
    }

    // Handle CSV downloads
    if (response.headers.get('content-type')?.includes('text/csv')) {
      return response.blob() as any;
    }

    return response.json();
  }

  // Service management endpoints (protected)
  async createService(data: CreateServiceRequest): Promise<Service> {
    return this.makeRequest<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getServices(): Promise<Service[]> {
    return this.makeRequest<Service[]>('/services');
  }

  async getService(id: string): Promise<Service> {
    return this.makeRequest<Service>(`/services/${id}`);
  }

  async updateService(id: string, data: UpdateServiceRequest): Promise<Service> {
    return this.makeRequest<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  async exportParticipants(id: string): Promise<Blob> {
    return this.makeRequest<Blob>(`/services/${id}/participants`);
  }

  // Public waitlist endpoints
  async getWaitlistBySlug(slug: string): Promise<WaitlistDetails> {
    return this.makeRequest<WaitlistDetails>(`/public/waitlists/${slug}`);
  }

  async joinWaitlist(slug: string, data: JoinWaitlistRequest): Promise<JoinWaitlistResponse> {
    return this.makeRequest<JoinWaitlistResponse>(`/public/waitlists/${slug}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getParticipantCount(slug: string): Promise<{ currentParticipants: number }> {
    return this.makeRequest<{ currentParticipants: number }>(`/public/waitlists/${slug}/count`);
  }

  // Public services endpoint
  async getAllPublicServices(): Promise<Pick<Service, 'id' | 'name' | 'description' | 'slug' | 'image' | 'category' | 'categories' | 'participantCount'>[]> {
    return this.makeRequest<Pick<Service, 'id' | 'name' | 'description' | 'slug' | 'image' | 'category' | 'categories' | 'participantCount'>[]>('/public/services');
  }

  // Helper method to download CSV
  async downloadParticipantsCsv(serviceId: string, serviceName: string): Promise<void> {
    try {
      const blob = await this.exportParticipants(serviceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participants-${serviceName.toLowerCase().replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      throw error;
    }
  }
}

export const waitlistService = new WaitlistService();