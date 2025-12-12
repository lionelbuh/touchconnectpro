import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { API_BASE_URL } from '@/config'

// Use window object to ensure true singleton across module reloads (HMR)
declare global {
  interface Window {
    __SUPABASE_CLIENT__?: SupabaseClient;
    __SUPABASE_INIT_PROMISE__?: Promise<SupabaseClient | null>;
    __SUPABASE_INITIALIZING__?: boolean;
  }
}

function getExistingClient(): SupabaseClient | null {
  if (typeof window !== 'undefined' && window.__SUPABASE_CLIENT__) {
    return window.__SUPABASE_CLIENT__;
  }
  return null;
}

async function initSupabase(): Promise<SupabaseClient | null> {
  // Check for existing client in window (survives HMR)
  const existing = getExistingClient();
  if (existing) {
    return existing;
  }
  
  // Prevent multiple concurrent initializations
  if (typeof window !== 'undefined' && window.__SUPABASE_INITIALIZING__) {
    // Wait for existing initialization
    if (window.__SUPABASE_INIT_PROMISE__) {
      return window.__SUPABASE_INIT_PROMISE__;
    }
  }
  
  if (typeof window !== 'undefined') {
    window.__SUPABASE_INITIALIZING__ = true;
  }
  
  // Auth options for session persistence
  // Use a consistent storage key across all sessions
  const authOptions = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'tcp-supabase-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
  
  let client: SupabaseClient | null = null;
  
  try {
    // Try to get config from backend endpoint first
    const response = await fetch(`${API_BASE_URL}/api/config`)
    
    if (response.ok) {
      const { supabaseUrl, supabaseAnonKey } = await response.json()
      
      if (supabaseUrl && supabaseAnonKey) {
        // Double-check no client was created while we were fetching
        const existingAfterFetch = getExistingClient();
        if (existingAfterFetch) {
          if (typeof window !== 'undefined') {
            window.__SUPABASE_INITIALIZING__ = false;
          }
          return existingAfterFetch;
        }
        
        client = createClient(supabaseUrl, supabaseAnonKey, authOptions)
        if (typeof window !== 'undefined') {
          window.__SUPABASE_CLIENT__ = client;
        }
        console.log('Supabase client created with session persistence')
      }
    }
  } catch (error) {
    console.error('Failed to fetch config from backend:', error)
  }
  
  // Fallback to environment variables (for development)
  if (!client) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    
    if (supabaseUrl && supabaseAnonKey) {
      try {
        // Double-check no client was created
        const existingFinal = getExistingClient();
        if (existingFinal) {
          if (typeof window !== 'undefined') {
            window.__SUPABASE_INITIALIZING__ = false;
          }
          return existingFinal;
        }
        
        client = createClient(supabaseUrl, supabaseAnonKey, authOptions)
        if (typeof window !== 'undefined') {
          window.__SUPABASE_CLIENT__ = client;
        }
        console.log('Supabase client created from env vars')
      } catch (error) {
        console.error('Failed to create Supabase client:', error)
      }
    }
  }
  
  if (typeof window !== 'undefined') {
    window.__SUPABASE_INITIALIZING__ = false;
  }
  
  return client;
}

// Get or create init promise
function getInitPromise(): Promise<SupabaseClient | null> {
  if (typeof window !== 'undefined') {
    // Return existing client immediately if available
    const existing = getExistingClient();
    if (existing) {
      return Promise.resolve(existing);
    }
    
    // Return existing promise if initialization is in progress
    if (window.__SUPABASE_INIT_PROMISE__) {
      return window.__SUPABASE_INIT_PROMISE__;
    }
    
    // Start new initialization
    window.__SUPABASE_INIT_PROMISE__ = initSupabase();
    return window.__SUPABASE_INIT_PROMISE__;
  }
  return initSupabase();
}

// Start initialization immediately
const initPromise = getInitPromise();

// Async getter to ensure supabase is initialized before use
async function getSupabase(): Promise<SupabaseClient | null> {
  return await getInitPromise();
}

// Sync getter for backwards compatibility (may return null if not initialized)
const supabase = getExistingClient();

// Helper to clear all Supabase auth data from localStorage
function clearSupabaseSession(): void {
  if (typeof window === 'undefined') return;
  
  // Clear all Supabase auth tokens from localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear window client to force re-initialization on next getSupabase call
  delete window.__SUPABASE_CLIENT__;
  delete window.__SUPABASE_INIT_PROMISE__;
  delete window.__SUPABASE_INITIALIZING__;
  
  console.log('Cleared Supabase session data');
}

export { supabase, getSupabase, clearSupabaseSession }
