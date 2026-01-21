import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import bandeiraPara from '../assets/bandeira_para.png';

import AiChatbot from './AiChatbot';
import InternalChat from './InternalChat';
import AuditDetailsModal from './AuditDetailsModal';


import {
  LayoutDashboard, Users, Layers, Bell, LogOut, Search,
  FileText, Map, AlertTriangle, FileSpreadsheet, Shield, BookOpen, CheckCircle,
  KanbanSquare, Briefcase, ShieldAlert, Star, X, Sun, Moon, MessageCircle, Lock,
  Menu, Hexagon
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
      className={`relative group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1.5 text-sm font-medium overflow-hidden ${isActive(to)
        ? 'text-white shadow-lg shadow-indigo-500/30'
        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white'
        }`}
    >
      {isActive(to) && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-100 z-0" />
      )}

      <Icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive(to) ? 'text-white' : ''}`} />
      <span className="relative z-10">{label}</span>

      {!isActive(to) && (
        <div className="absolute left-0 bottom-0 w-1 h-1 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2" />
      )}
    </Link>
  );
};

const SidebarGroup = ({ title, children }) => (
  <div className="mb-8 animate-fadeIn">
    <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 opacity-90">{title}</p>
    {children}
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function Layout() {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // States for Audit Modal within Notifications
  const [selectedLog, setSelectedLog] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Helper to format role name nicely
  const formatRoleName = (r) => {
    if (!r) return 'Carregando...';
    const map = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'servidor': 'Servidor',
      'visitante': 'Visitante'
    };
    return map[r] || r;
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Realtime Subscriptions (Chat & Audit)
      const channel = supabase
        .channel('realtime-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            const newMsg = payload.new;
            toast.info('Nova mensagem recebida', {
              description: newMsg.content,
              icon: <MessageCircle size={18} className="text-indigo-500" />
            });
            fetchNotifications();
          }
        )
        .subscribe();

      let adminChannel = null;
      if (role === 'admin' || role === 'gestor') {
        adminChannel = supabase
          .channel('realtime-audits')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'audit_logs' },
            (payload) => fetchNotifications()
          )
          .subscribe();
      }

      return () => {
        supabase.removeChannel(channel);
        if (adminChannel) supabase.removeChannel(adminChannel);
      };
    }
  }, [user, showNotifications]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      let auditData = [];
      let chatData = [];

      if (role === 'admin' || role === 'gestor') {
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (data) auditData = data;
      }

      const { data: messages } = await supabase
        .from('chat_messages')
        .select(`
            id, content, created_at, sender_id, receiver_id,
            sender:profiles!sender_id (full_name)
        `)
        .or(`receiver_id.eq.${user.id},receiver_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messages) chatData = messages;

      const formattedAudit = auditData.map(log => ({
        id: `audit-${log.id}`,
        type: 'audit',
        text: `${log.operation} em ${log.table_name || 'Sistema'}`,
        subtext: 'Auditoria do Sistema',
        time: new Date(log.created_at),
        data: log,
        unread: false
      }));

      const formattedChat = chatData.map(msg => ({
        id: `chat-${msg.id}`,
        type: 'chat',
        text: msg.sender?.full_name ? `Mensagem de ${msg.sender.full_name}` : 'Nova mensagem',
        subtext: msg.content,
        time: new Date(msg.created_at),
        data: msg,
        unread: true
      }));

      const combined = [...formattedAudit, ...formattedChat].sort((a, b) => b.time - a.time).slice(0, 8);
      setNotifications(combined);
      setUnreadCount(formattedChat.length);

    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === 'audit') {
      setSelectedLog(notif.data);
      setIsAuditModalOpen(true);
      setShowNotifications(false);
    } else if (notif.type === 'chat') {
      const event = new CustomEvent('open-internal-chat', {
        detail: { userId: notif.data.sender_id }
      });
      window.dispatchEvent(event);
      setShowNotifications(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
    return `${Math.floor(diffInSeconds / 86400)} d atrás`;
  };

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden">

      {/* --- GLOW EFFECTS BEHIND --- */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* --- GLASS SIDEBAR --- */}
      <aside className="w-80 h-[96vh] my-[2vh] ml-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl flex flex-col hidden md:flex shadow-2xl z-50 transition-all duration-300">

        {/* Logo Area */}
        <div className="p-8 pb-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/50 dark:bg-white/10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0 overflow-hidden">
              <img src={bandeiraPara} alt="Bandeira do Pará" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-bold text-slate-800 dark:text-white leading-tight tracking-tight">
                CPS <span className="text-indigo-600 dark:text-indigo-400">Gestão</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Gov. Pará
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav id="sidebar-nav" className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-2">
          <SidebarGroup title="Principal">
            <SidebarItem icon={LayoutDashboard} label="Visão Geral" to="/" />
            <SidebarItem icon={BookOpen} label="Planejamento" to="/planejamento" />
            <SidebarItem icon={Layers} label="Processos" to="/processos" />
            <SidebarItem icon={Users} label="Inscritos" to="/inscritos" />
            <SidebarItem icon={KanbanSquare} label="Convocação" to="/workflow" />
            <SidebarItem icon={Map} label="Lotação" to="/lotacao" />
          </SidebarGroup>

          <SidebarGroup title="Gestão">
            <SidebarItem icon={Briefcase} label="Controle de Vagas" to="/vagas" />
            <SidebarItem icon={Star} label="Vagas Especiais" to="/vagas-especiais" />
          </SidebarGroup>

          <SidebarGroup title="Ferramentas">
            <SidebarItem icon={Search} label="Pesquisa" to="/pesquisa" />
            <SidebarItem icon={ShieldAlert} label="Auditoria" to="/auditoria" />
            <SidebarItem icon={FileSpreadsheet} label="Relatórios" to="/relatorios" />
            <SidebarItem icon={Shield} label="Segurança" to="/seguranca" />
            <SidebarItem icon={Lock} label="Acessos" to="/admin/perfis" />
          </SidebarGroup>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all w-full px-4 py-3 rounded-xl text-sm font-semibold group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Glass Header */}
        <header className="mx-4 mt-[2vh] mb-4 h-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl flex justify-between items-center px-8 z-40 transition-all">

          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger (hidden on desktop) */}
            <button className="md:hidden p-2 text-slate-500"><Menu /></button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-300 truncate">
              Portal do Servidor
            </h1>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">



            {/* User Profile Pill */}
            <div className="hidden md:flex items-center gap-3 pl-1 pr-4 py-1.5 bg-white/60 dark:bg-black/20 rounded-full border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-sm cursor-default hover:bg-white/80 transition-colors">
              <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/30">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
                  {formatRoleName(role)}
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 text-slate-500 hover:text-indigo-600 bg-white/50 dark:bg-black/20 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm border border-white/50"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 text-slate-500 hover:text-indigo-600 bg-white/50 dark:bg-black/20 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm border border-white/50 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              {/* Dropdown Notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden z-50 animate-fadeIn origin-top-right ring-1 ring-black/5">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      <Bell size={16} className="text-indigo-500" /> Notificações
                    </span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">Nenhuma notificação nova.</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`px-6 py-4 border-b border-slate-50 dark:border-white/5 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer group relative`}
                        >
                          {n.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                          <div className="flex gap-4">
                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'audit' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {n.type === 'audit' ? <ShieldAlert size={14} /> : <MessageCircle size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug truncate">
                                {n.text}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {n.subtext}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-2 block font-medium">{formatTimeAgo(n.time)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    to="/notificacoes"
                    onClick={() => setShowNotifications(false)}
                    className="block p-3 text-center bg-slate-50/50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-colors"
                  >
                    Ver todas
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main View */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:px-8 pb-20 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto w-full animate-fadeIn">
            <div key={useLocation().pathname} className="animate-page-transition w-full h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <div id="chatbot-trigger">
        <InternalChat />
        <AiChatbot />
      </div>

      <AuditDetailsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}