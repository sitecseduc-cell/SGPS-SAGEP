import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  // Se não tem usuário, manda pro login
  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Se tem regras específicas e o usuário não atende
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-800">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-lg text-slate-600 mb-8">Você não tem permissão para acessar esta página.</p>
        <div className="px-4 py-2 bg-slate-200 rounded text-sm font-mono text-slate-600">
          Seu perfil: <strong>{role || 'Indefinido'}</strong>
        </div>
      </div>
    );
  }

  // Se tem usuário, deixa passar (renderiza as rotas filhas)
  return <Outlet />;
}