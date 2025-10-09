'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  csrfToken: string;
  sessionId: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Helper function to get cookies
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    
    return null;
  }, []);

  // Helper function to get session ID from cookie
  const getSessionIdFromCookie = useCallback((): string | null => {
    return getCookie('session_id');
  }, [getCookie]);

  // Logout function (defined first as it's used by other functions)
  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include', // Important: include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });

    // Clear in-memory tokens
    if (typeof window !== 'undefined') {
      delete (window as any).__csrfToken;
      delete (window as any).__sessionId;
    }
  }, []);

  // Refresh token function (defined before checkAuthStatus)
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: true,
          user: { id: 'admin', email: 'admin@site.com', role: 'admin' },
          loading: false,
          error: null,
        });
        return true;
      } else {
        // Refresh failed, logout
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const accessToken = getCookie('access_token');
      const sessionIdFromCookie = getSessionIdFromCookie();
      const sessionIdFromMemory = typeof window !== 'undefined' ? (window as any).__sessionId : null;
      const sessionId = sessionIdFromCookie || sessionIdFromMemory;
      
      if (!accessToken || !sessionId) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Verify token by making a request to a protected endpoint
      const response = await fetch('/api/admin/orders', {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: true,
          user: { id: 'admin', email: 'admin@site.com', role: 'admin' },
          loading: false,
          error: null,
        });
      } else {
        // Token is invalid, try to refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Authentication check failed',
      });
    }
  }, [getCookie, getSessionIdFromCookie, refreshToken]);

  const login = useCallback(async (password: string, rememberMe: boolean = false) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, rememberMe }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Store CSRF token in memory for API calls
        if (typeof window !== 'undefined') {
          (window as any).__csrfToken = data.csrfToken;
          (window as any).__sessionId = data.sessionId;
        }

        // Wait a moment for cookies to be properly set
        await new Promise(resolve => setTimeout(resolve, 100));

        setAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false,
          error: null,
        });

        return { success: true, message: data.message };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error,
        }));
        
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  const getAuthHeaders = useCallback(() => {
    const accessToken = getCookie('access_token');
    const csrfToken = typeof window !== 'undefined' ? (window as any).__csrfToken : null;
    const sessionIdFromCookie = getSessionIdFromCookie(); // Get from cookie instead of memory
    const sessionIdFromMemory = typeof window !== 'undefined' ? (window as any).__sessionId : null;
    const sessionId = sessionIdFromCookie || sessionIdFromMemory; // Prefer cookie over memory
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    if (sessionId) {
      headers['X-Session-Token'] = sessionId;
    }

    return headers;
  }, [getCookie, getSessionIdFromCookie]);

  const makeAuthenticatedRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    try {
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      
      console.log('🔧 Making authenticated request:', { url, method: options.method, headers });
      
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important: include cookies
        headers,
      });

      console.log('🔧 Authenticated request response:', { status: response.status, ok: response.ok });

      if (response.status === 401) {
        console.log('🔧 Token expired, attempting refresh...');
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        if (refreshed) {
          console.log('🔧 Token refreshed, retrying request...');
          // Retry the request with new token
          return fetch(url, {
            ...options,
            credentials: 'include', // Important: include cookies
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
          });
        } else {
          console.log('❌ Token refresh failed');
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  }, [getAuthHeaders, refreshToken]);

  // Check authentication status on mount (moved after all function definitions)
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    checkAuthStatus,
    getAuthHeaders,
    makeAuthenticatedRequest,
  };
}