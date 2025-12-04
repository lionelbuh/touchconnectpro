import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

console.log('Supabase init - URL exists:', !!supabaseUrl)
console.log('Supabase init - Key exists:', !!supabaseAnonKey)
console.log('Supabase init - URL value:', supabaseUrl)

let supabase: any = null
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client created successfully')
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
  }
} else {
  console.error('Missing Supabase env vars. URL:', !!supabaseUrl, 'Key:', !!supabaseAnonKey)
}

export { supabase }
