/**
 * Stack AI API Client
 * Handles authentication and base API functionality
 * Based on knowledge_base_workflow.ipynb patterns
 */

import { 
  AuthCredentials, 
  AuthHeaders
} from '@/lib/types/api';

class StackAIClient {
  private baseUrl = process.env.NEXT_PUBLIC_STACK_AI_API_URL;
  private supabaseAuthUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL;
  private anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  private authHeaders: AuthHeaders | null = null;
  private orgId: string | null = null;

  /**
   * Authenticate with Stack AI
   * Based on the notebook's get_auth_headers function
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthHeaders> {
    if (!this.baseUrl || !this.supabaseAuthUrl || !this.anonKey) {
      throw new ApiError(
        'API configuration missing. Please set NEXT_PUBLIC_STACK_AI_API_URL, NEXT_PUBLIC_SUPABASE_AUTH_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
        500
      );
    }

    try {
      const requestUrl = `${this.supabaseAuthUrl}/auth/v1/token?grant_type=password`;
      
      // Match notebook's request format exactly
      const requestBody = {
        email: credentials.email,  // Don't trim - match notebook exactly
        password: credentials.password,  // Don't trim - match notebook exactly
        gotrue_meta_security: {},  // Empty object as in notebook
      };

      console.log('🔐 Authentication Request:', {
        url: requestUrl,
        anon_key_length: this.anonKey.length,
      });

      // Use the exact same format as the Python requests library
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',  // Added to match requests library
          'Content-Type': 'application/json',
          'Apikey': this.anonKey,
        },
        body: JSON.stringify(requestBody),
        // Don't add any extra options that aren't in the notebook
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Authentication Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new ApiError(`Authentication failed: ${response.statusText}`, response.status);
      }

      console.log('✅ Authentication response:', {
        status: response.status,
        has_access_token: !!data.access_token,
      });

      const accessToken = data.access_token;

      this.authHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Get organization ID
      await this.fetchOrgId();

      return this.authHeaders;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
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

  /**
   * Authenticate with test credentials from the task
   * Note: In production, these should come from secure environment variables
   * For this task, the credentials are provided in the task specification
   */
  async authenticateWithTestCredentials(): Promise<AuthHeaders> {
    // These credentials are provided in the task specification for testing
    // Task file states: Email: stackaitest@gmail.com, Password: !z4ZnxkyLYs#vR
    const testEmail = process.env.NEXT_PUBLIC_STACK_AI_EMAIL;
    const testPassword = process.env.NEXT_PUBLIC_STACK_AI_PASSWORD;
    
    if (!testEmail || !testPassword) {
      throw new ApiError(
        'Test credentials not configured. Please set NEXT_PUBLIC_STACK_AI_EMAIL and NEXT_PUBLIC_STACK_AI_PASSWORD environment variables.',
        401
      );
    }
    
    return this.authenticate({
      email: testEmail,
      password: testPassword,
    });
  }
}

// Create a singleton instance
export const stackAIClient = new StackAIClient();

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
