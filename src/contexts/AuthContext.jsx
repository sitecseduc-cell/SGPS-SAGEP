import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Erro sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    // --- BYPASS DE TESTE (IMPORTANTE) ---
    if (email === 'admin@seduc.pa.gov.br' && password === '123456') {
      const fakeUser = { id: 'admin-123', email: email };
      setUser(fakeUser);
      return { user: fakeUser, session: { access_token: 'fake-token' } };
    }
    // ------------------------------------

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log("Logout local");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);