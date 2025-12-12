import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Users, Layers, Bell, LogOut, Search, 
  FileText, Map, AlertTriangle, FileSpreadsheet, Shield, BookOpen, CheckCircle,
  KanbanSquare 
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth(); // Importa a função de sair do contexto
  
  // Verifica se o link é o atual para pintar de azul
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Função de Logout conectada ao Supabase
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Componente do Item do Menu
  const SidebarItem = ({ icon: Icon, label, to }) => (
    <Link 
      to={to}
      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 mb-1 text-sm ${
        isActive(to)
          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 font-medium' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="truncate">{label}</span>
    </Link>
  );

  const SidebarGroup = ({ title, children }) => (
    <div className="mb-6">
      <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 opacity-80">{title}</p>
      {children}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden md:flex shadow-2xl z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">P</div>
            <div className="leading-tight">
              <span className="text-lg font-bold block">SAGEP 2.0</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Gov. Pará</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <SidebarGroup title="Principal">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
            <SidebarItem icon={Layers} label="Gestão de Processos" to="/processos" />
            <SidebarItem icon={KanbanSquare} label="Fluxo (Kanban)" to="/workflow" />
          </SidebarGroup>

          <SidebarGroup title="Inscrições & Candidatos">
            <SidebarItem icon={Users} label="Gestão de Inscritos" to="/inscritos" />
            <SidebarItem icon={Search} label="Pesquisar Candidatos" to="/pesquisa" />
            <SidebarItem icon={Users} label="Quantidade de Inscritos" to="/qtd" />
          </SidebarGroup>

          <SidebarGroup title="Análise & Avaliação">
            <SidebarItem icon={FileText} label="Análise de Documentos" to="/docs" />
            <SidebarItem icon={BookOpen} label="Análise de Plano" to="/plano" />
            <SidebarItem icon={CheckCircle} label="Pré Avaliação" to="/pre" />
          </SidebarGroup>

          <SidebarGroup title="Administrativo">
            <SidebarItem icon={Map} label="Vincular Localidades" to="/local" />
            <SidebarItem icon={AlertTriangle} label="Recursos" to="/recursos" />
            <SidebarItem icon={FileSpreadsheet} label="Relatórios" to="/relatorios" />
            <SidebarItem icon={Shield} label="Segurança" to="/seguranca" />
          </SidebarGroup>
        </nav>

        <div className="p-4 border-t border-slate-800">
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Cabeçalho Fixo */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">SGPS - Sistema de Gestão</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <span className="mr-2 hidden sm:inline">Bem-vindo,</span>
              <strong className="text-slate-800 uppercase">LUAN GIULIANO</strong>
            </div>
            
            <button className="p-2 text-slate-400 hover:text-blue-600 relative transition-colors rounded-full hover:bg-slate-50">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Onde as páginas carregam */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <Outlet /> 
        </div>

      </main>
    </div>
  );
}