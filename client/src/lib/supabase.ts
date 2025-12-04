import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { API_BASE_URL } from '@/config'

let supabase: SupabaseClient | null = null
let initPromise: Promise<void> | null = null

async function initSupabase(): Promise<void> {
  // Only initialize once
  if (supabase) return
  
  try {
    // Try to get config from backend endpoint first
    console.log('Fetching Supabase config from backend...', `${API_BASE_URL}/api/config`)
    const response = await fetch(`${API_BASE_URL}/api/config`)
    
    if (response.ok) {
      const { supabaseUrl, supabaseAnonKey } = await response.json()
      console.log('Got Supabase config from backend')
      console.log('URL exists:', !!supabaseUrl)
      console.log('Key exists:', !!supabaseAnonKey)
      
      if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey)
        console.log('Supabase client created successfully')
        return
      }
    }
  } catch (error) {
    console.error('Failed to fetch config from backend:', error)
  }
  
  // Fallback to environment variables (for development)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  
  console.log('Using environment variables - URL exists:', !!supabaseUrl, 'Key exists:', !!supabaseAnonKey)
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey)
      console.log('Supabase client created from env vars')
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
    }
  } else {
    console.error('Missing Supabase credentials in both backend and env vars')
  }
}

// Start initialization immediately
initPromise = initSupabase()

// Async getter to ensure supabase is initialized before use
async function getSupabase(): Promise<SupabaseClient | null> {
  await initPromise
  return supabase
}

export { supabase, getSupabase }
