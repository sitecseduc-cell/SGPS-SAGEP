import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexto e Proteção
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout e Páginas
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
      {/* O AuthProvider envolve tudo para gerenciar o login e sessão */}
      <AuthProvider>
        <Routes>
          
          {/* Rota Pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas: Só acessíveis se estiver logado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              
              {/* Rotas Principais */}
              <Route index element={<Dashboard />} />
              <Route path="processos" element={<Processos />} />
              <Route path="workflow" element={<Kanban />} />
              <Route path="inscritos" element={<Inscritos />} />
              
              {/* Aliases para facilitar a navegação (redirecionam para Inscritos) */}
              <Route path="pesquisa" element={<Inscritos />} />
              <Route path="visualizar" element={<Inscritos />} />
              
              {/* Rota genérica para páginas em desenvolvimento */}
              <Route path="*" element={<EmConstrucao titulo="Página em Desenvolvimento" />} />
              
            </Route>
          </Route>

          {/* Se tentar acessar qualquer outra coisa fora do padrão, manda pro Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}