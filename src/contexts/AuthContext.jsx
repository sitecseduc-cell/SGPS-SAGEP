import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão ao iniciar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false); // Garante que a tela branca some
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login Seguro
  const signIn = async (email, password) => {
    // MODO DEMONSTRAÇÃO: Se usar este email específico, entra direto
    if (email === 'admin@seduc.pa.gov.br' && password === '123456') {
      const fakeUser = { id: '1', email: 'admin@seduc.pa.gov.br' };
      setUser(fakeUser);
      return { user: fakeUser };
    }

    // Tenta login real no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {!loading ? children : <div className="flex items-center justify-center h-screen bg-slate-50 text-blue-600">Carregando sistema...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);