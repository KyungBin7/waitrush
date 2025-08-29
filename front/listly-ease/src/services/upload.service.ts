import { tokenStorage } from '../utils/token';

const API_BASE_URL = '/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  uploadedAt: string;
  totalImages?: number;
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  imageUrls: string[];
  uploadedAt: string;
  totalImages: number;
}

class UploadService {
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const token = tokenStorage.get();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 서비스 아이콘 이미지 업로드
   */
  async uploadIconImage(serviceId: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<UploadResponse>(
      `/upload/services/${serviceId}/icon`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  /**
   * 서비스 상세 이미지 업로드 (단일)
   */
  async uploadDetailImage(serviceId: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<UploadResponse>(
      `/upload/services/${serviceId}/detail`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  /**
   * 서비스 상세 이미지 업로드 (다중)
   */
  async uploadDetailImages(serviceId: string, files: File[]): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.makeRequest<MultipleUploadResponse>(
      `/upload/services/${serviceId}/details`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  /**
   * 서비스 상세 이미지 전체 교체
   */
  async replaceDetailImages(serviceId: string, files: File[]): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.makeRequest<MultipleUploadResponse>(
      `/upload/services/${serviceId}/details/replace`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  /**
   * 파일 검증 (프론트엔드에서 먼저 체크)
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File too large. Maximum size: 10MB',
      };
    }

    return { isValid: true };
  }
}

export const uploadService = new UploadService();