import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria um cliente "falso" se não houver chaves, para não quebrar o site visualmente
const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: { email: 'teste@demo.com' } }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select: () => ({ data: [], error: null }) }) // Mock básico de banco
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ AVISO: Variáveis do Supabase não encontradas. O sistema rodará em modo DEMONSTRAÇÃO (Mock).')
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient