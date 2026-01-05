import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import logoSistema from '../assets/brassao.svg';
import AiChatbot from './AiChatbot';

import {
  LayoutDashboard, Users, Layers, Bell, LogOut, Search,
  FileText, Map, AlertTriangle, FileSpreadsheet, Shield, BookOpen, CheckCircle,
  KanbanSquare, Briefcase, ShieldAlert, Star, X, Sun, Moon
} from 'lucide-react';

// --- COMPONENTES AUXILIARES ---

const SidebarItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Link
      to={to}
      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 mb-1 text-sm ${isActive(to)
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 font-medium'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white dark:text-slate-400 dark:hover:bg-slate-700/50'
        }`}
    >
      <Icon size={18} />
      <span className="truncate">{label}</span>
    </Link>
  );
};

const SidebarGroup = ({ title, children }) => (
  <div className="mb-6">
    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 opacity-80">{title}</p>
    {children}
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function Layout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false); // Estado notificações

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Notificações Mockadas
  const notifications = [
    { id: 1, text: "Novo candidato inscrito em PSS 08/2025", time: "Há 10 min", unread: true },
    { id: 2, text: "Processo de Auditoria finalizado", time: "Há 2 horas", unread: false },
    { id: 3, text: "Backup do sistema realizado", time: "Ontem", unread: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-300">

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-72 bg-slate-900 dark:bg-slate-950 text-white flex flex-col hidden md:flex shadow-2xl z-50 transition-colors duration-300">
        <div className="p-6 border-b border-slate-800 dark:border-slate-900">
          <div className="flex items-center space-x-3">
            <img
              src={logoSistema}
              alt="Logo SAGEP"
              className="h-8 w-8 object-cover rounded-lg"
            />
            <div className="leading-tight">
              <span className="text-lg font-bold block">SAGEP</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Gov. Pará</span>
            </div>
          </div>
        </div>

        <nav id="sidebar-nav" className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <SidebarGroup title="Principal">
            <SidebarItem icon={LayoutDashboard} label="Visão Geral" to="/" />
            <SidebarItem icon={BookOpen} label="Planejamento & Editais" to="/planejamento" />
            <SidebarItem icon={Layers} label="Gestão de Processos" to="/processos" />
            <SidebarItem icon={Users} label="Gestão de Inscritos" to="/inscritos" />
            <SidebarItem icon={KanbanSquare} label="Convocação (Fluxo)" to="/workflow" />
            <SidebarItem icon={Map} label="Lotação & Contratação" to="/lotacao" />
          </SidebarGroup>

          <SidebarGroup title="Quadro de Pessoal">
            <SidebarItem icon={Briefcase} label="Quadro Geral" to="/vagas" />
            <SidebarItem icon={Star} label="Convocação Especial" to="/vagas-especiais" />
          </SidebarGroup>

          <SidebarGroup title="Ferramentas">
            <SidebarItem icon={Search} label="Pesquisar Candidatos" to="/pesquisa" />
            <SidebarItem icon={ShieldAlert} label="Auditoria & Controle" to="/auditoria" />
            <SidebarItem icon={FileSpreadsheet} label="Relatórios Gerenciais" to="/relatorios" />
            <SidebarItem icon={Shield} label="Segurança do Sistema" to="/seguranca" />
          </SidebarGroup>
        </nav>

        <div className="p-4 border-t border-slate-800 dark:border-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 text-red-400 hover:text-white hover:bg-red-500/20 transition-colors w-full px-4 py-2 rounded-lg text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm transition-colors duration-300">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">SGPS - Sistema de Gestão</h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
              <span className="mr-2 hidden sm:inline">Bem-vindo,</span>
              <strong className="text-slate-800 dark:text-white uppercase">{userName}</strong>
            </div>

            {/* TEMA (DARK MODE) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* NOTIFICAÇÕES */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 relative transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
              </button>

              {/* Dropdown de Notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Notificações</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">{n.text}</p>
                          {n.unread && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 ml-2"></span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors border-t border-slate-100 dark:border-slate-700">
                    Ver todas as atividades
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-900">
          <Outlet />
        </div>
      </main>
      <div id="chatbot-trigger">
        <AiChatbot />
      </div>
    </div>
  );
}