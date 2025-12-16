import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

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
import ControleVagas from './pages/ControleVagas';
import Auditoria from './pages/Auditoria';
import PesquisaCandidatos from './pages/PesquisaCandidatos';
import QuantidadeInscritos from './pages/QuantidadeInscritos';
import PreAvaliacao from './pages/PreAvaliacao';
import Relatorios from './pages/Relatorios';
import Seguranca from './pages/Seguranca';

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
              <Route path="vagas" element={<ControleVagas />} />
              <Route path="inscritos" element={<Inscritos />} />

              {/* Novas Funcionalidades Independentes */}
              <Route path="pesquisa" element={<PesquisaCandidatos />} />
              <Route path="qtd" element={<QuantidadeInscritos />} />
              <Route path="pre" element={<PreAvaliacao />} />

              <Route path="workflow" element={<Kanban />} />
              <Route path="auditoria" element={<Auditoria />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="seguranca" element={<Seguranca />} />

              {/* Rota 404 para páginas não criadas */}
              <Route path="*" element={<EmConstrucao titulo="Página em Desenvolvimento" />} />
            </Route>
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}