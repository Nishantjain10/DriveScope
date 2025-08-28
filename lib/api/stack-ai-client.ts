/**
 * Stack AI API Client
 * Handles authentication and base API functionality
 * Based on knowledge_base_workflow.ipynb patterns
 */

import { 
  AuthCredentials, 
  AuthHeaders, 
  ApiError 
} from '@/lib/types/api';

class StackAIClient {
  private baseUrl = 'https://api.stack-ai.com';
  private supabaseAuthUrl = 'https://sb.stack-ai.com';
  private anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3VhZGZxaGtseG9rbWxodHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NTg5ODAsImV4cCI6MTk4OTAzNDk4MH0.Xjry9m7oc42_MsLRc1bZhTTzip3srDjJ6fJMkwhXQ9s';
  
  private authHeaders: AuthHeaders | null = null;
  private orgId: string | null = null;

  /**
   * Authenticate with Stack AI
   * Based on the notebook's get_auth_headers function
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthHeaders> {
    try {
      const requestUrl = `${this.supabaseAuthUrl}/auth/v1/token?grant_type=password`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': this.anonKey,
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          gotrue_meta_security: {},
        }),
      });

      if (!response.ok) {
        throw new ApiError(`Authentication failed: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      const accessToken = data.access_token;

      this.authHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Get organization ID
      await this.fetchOrgId();

      return this.authHeaders;
    } catch (error) {
      throw new ApiError('Authentication failed', 401, error);
    }
  }

  /**
   * Get the current organization ID
   */
  private async fetchOrgId(): Promise<void> {
    if (!this.authHeaders) {
      throw new ApiError('Not authenticated', 401);
    }

    try {
      const response = await fetch(`${this.baseUrl}/organizations/me/current`, {
        headers: this.authHeaders,
      });

      if (!response.ok) {
        throw new ApiError('Failed to fetch organization', response.status);
      }

      const data = await response.json();
      this.orgId = data.org_id;
    } catch (error) {
      throw new ApiError('Failed to fetch organization ID', 500, error);
    }
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.authHeaders) {
      throw new ApiError('Not authenticated', 401);
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.authHeaders,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          `API request failed: ${response.statusText}`, 
          response.status, 
          errorText
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network request failed', 500, error);
    }
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders(): AuthHeaders | null {
    return this.authHeaders;
  }

  /**
   * Get organization ID
   */
  getOrgId(): string | null {
    return this.orgId;
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authHeaders && !!this.orgId;
  }

  /**
   * Clear authentication
   */
  logout(): void {
    this.authHeaders = null;
    this.orgId = null;
  }
}

// Create a singleton instance
export const stackAIClient = new StackAIClient();

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
