import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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

// --- IMPORTANTE: NOVA PÁGINA ---
import VagasEspeciais from './pages/VagasEspeciais';
import Planejamento from './pages/Planejamento';
import Lotacao from './pages/Lotacao';
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="planejamento" element={<Planejamento />} />
              <Route path="processos" element={<Processos />} />
              <Route path="lotacao" element={<Lotacao />} />
              <Route path="vagas" element={<ControleVagas />} />
              <Route path="inscritos" element={<Inscritos />} />

              {/* --- NOVA ROTA DE VAGAS ESPECIAIS --- */}
              <Route path="vagas-especiais" element={<VagasEspeciais />} />
              {/* ------------------------------------ */}

              <Route path="pesquisa" element={<PesquisaCandidatos />} />
              <Route path="qtd" element={<QuantidadeInscritos />} />
              <Route path="pre" element={<PreAvaliacao />} />

              <Route path="workflow" element={<Kanban />} />
              <Route path="auditoria" element={<Auditoria />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="seguranca" element={<Seguranca />} />

              <Route path="*" element={<EmConstrucao titulo="Página em Desenvolvimento" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}