import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = React.lazy(() => import('./components/Layout'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Processos = React.lazy(() => import('./pages/Processos'));
const Inscritos = React.lazy(() => import('./pages/Inscritos'));
const Kanban = React.lazy(() => import('./pages/Kanban'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ControleVagas = React.lazy(() => import('./pages/ControleVagas'));
const Auditoria = React.lazy(() => import('./pages/Auditoria'));
const PesquisaCandidatos = React.lazy(() => import('./pages/PesquisaCandidatos'));
const QuantidadeInscritos = React.lazy(() => import('./pages/QuantidadeInscritos'));
const PreAvaliacao = React.lazy(() => import('./pages/PreAvaliacao'));
const Relatorios = React.lazy(() => import('./pages/Relatorios'));
const Seguranca = React.lazy(() => import('./pages/Seguranca'));

// --- IMPORTANTE: NOVA PÁGINA ---
const VagasEspeciais = React.lazy(() => import('./pages/VagasEspeciais'));
const Planejamento = React.lazy(() => import('./pages/Planejamento'));
const Lotacao = React.lazy(() => import('./pages/Lotacao'));
const UpdatePassword = React.lazy(() => import('./pages/UpdatePassword'));
const AdminPerfis = React.lazy(() => import('./pages/AdminPerfis'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

import TryBoundary from './components/TryBoundary';
import NetworkStatus from './components/NetworkStatus';
import ImmersiveLoader from './components/ImmersiveLoader';


export default function App() {
  return (
    <TryBoundary>
      <NetworkStatus />
      <BrowserRouter>
        <AuthProvider>
          <React.Suspense fallback={
            <ImmersiveLoader />
          }>
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
                  <Route path="notificacoes" element={<Notifications />} />

                  <Route path="admin/perfis" element={<AdminPerfis />} />
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    {/* <Route path="admin/perfis" element={<AdminPerfis />} /> */}
                  </Route>
                  {/* ------------------------------------ */}

                  <Route path="pesquisa" element={<PesquisaCandidatos />} />
                  <Route path="qtd" element={<QuantidadeInscritos />} />
                  <Route path="pre" element={<PreAvaliacao />} />

                  <Route path="workflow" element={<Kanban />} />
                  <Route path="auditoria" element={<Auditoria />} />
                  <Route path="relatorios" element={<Relatorios />} />
                  <Route path="seguranca" element={<Seguranca />} />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
            <Toaster richColors position="top-right" />
          </React.Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TryBoundary>
  );
}