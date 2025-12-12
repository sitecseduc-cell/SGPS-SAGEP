import { createClient } from '@supabase/supabase-js'

// Configuração do Banco de Dados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qtabcmusmorupvpkptif.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWJjbXVzbW9ydXB2cGtwdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkwMDIsImV4cCI6MjA4MDg4NTAwMn0.8dh6YD6rirR8mHA7ffdKmYqwzqHCypn2XAWkBQS5vf8"

// Cliente de segurança (Mock) para evitar tela branca se falhar a conexão
const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.reject(new Error("Supabase não configurado")),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select: () => ({ data: [], error: null }) })
}

// Exporta o cliente correto
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient