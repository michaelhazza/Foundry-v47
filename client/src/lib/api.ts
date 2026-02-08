/**
 * API Client for multi-tenant SaaS platform
 * Handles authentication, request/response formatting, and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get stored auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Set auth token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Remove auth token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Build headers for API request
   */
  private buildHeaders(authRequired: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authRequired) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errors: Record<string, string[]> | undefined;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errors = errorData.errors;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        errors,
      };

      // Clear token on 401 Unauthorized
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }

      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Make GET request
   */
  async get<T>(
    path: string,
    queryParams?: Record<string, string | number | boolean>,
    authRequired: boolean = true
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders(authRequired),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make POST request
   */
  async post<T>(
    path: string,
    data?: unknown,
    authRequired: boolean = true
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.buildHeaders(authRequired),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make PATCH request
   */
  async patch<T>(
    path: string,
    data?: unknown,
    authRequired: boolean = true
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.buildHeaders(authRequired),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make DELETE request
   */
  async delete<T>(
    path: string,
    authRequired: boolean = true
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.buildHeaders(authRequired),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Download file
   */
  async downloadFile(
    path: string,
    filename: string,
    authRequired: boolean = true
  ): Promise<void> {
    const headers: HeadersInit = {};

    if (authRequired) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Upload file
   */
  async uploadFile<T>(
    path: string,
    file: File,
    additionalData?: Record<string, string>,
    authRequired: boolean = true
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};

    if (authRequired) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export type
export type { ApiError };
