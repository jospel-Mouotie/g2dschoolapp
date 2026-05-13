// hooks/useApi.ts
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export function useApi() {
  const { token } = useAuth();

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`🔐 Appel API avec token: ${url}`);
    } else {
      console.log(`⚠️ Appel API sans token: ${url}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      console.error(`❌ Erreur API ${url}:`, error);
      throw new Error(error.error || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  }, [token]);

  return { fetchWithAuth };
}