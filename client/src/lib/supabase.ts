import { createClient } from '@supabase/supabase-js'

let supabase: any = null

async function initSupabase() {
  try {
    // Try to get config from backend endpoint first
    console.log('Fetching Supabase config from backend...')
    const response = await fetch('/api/config')
    
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

// Initialize immediately
initSupabase()

export { supabase }
