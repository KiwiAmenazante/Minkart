import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Sanitizar la URL por si el usuario incluyó /rest/v1 o slashes al final por error
export const supabaseUrl = rawUrl
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/auth\/v1\/?$/, '')
  .replace(/\/+$/, '')

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto') &&
  supabaseUrl.startsWith('https://')
)

// Fallback a URL dummy para evitar excepciones si no hay credenciales aún
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-minka.supabase.co'
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'

export const supabase = createClient(validUrl, validKey)