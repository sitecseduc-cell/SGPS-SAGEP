/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Debug:', {
  urlExists: !!supabaseUrl,
  keyExists: !!supabaseAnonKey,
  urlValue: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'undefined',
  env: import.meta.env
});

// Exporta o cliente correto
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);