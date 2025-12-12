import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importe o Contexto de Autenticação
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Importe o Layout e as Páginas
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import Inscritos from './pages/Inscritos';
import Kanban from './pages/Kanban';
import EmConstrucao from './pages/EmConstrucao';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          {/* Rota Pública (Login) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Sistema) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="processos" element={<Processos />} />
              <Route path="inscritos" element={<Inscritos />} />
              
              {/* Alias para o menu lateral */}
              <Route path="pesquisa" element={<Inscritos />} />
              <Route path="visualizar" element={<Inscritos />} />
              
              <Route path="workflow" element={<Kanban />} />
              
              {/* Rota 404 para páginas não criadas */}
              <Route path="*" element={<EmConstrucao titulo="Página em Desenvolvimento" />} />
            </Route>
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}