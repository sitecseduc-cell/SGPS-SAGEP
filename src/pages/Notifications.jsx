import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
    Bell,
    MessageCircle,
    ShieldAlert,
    CheckCircle2,
    Search,
    Filter,
    Trash2,
    Inbox
} from 'lucide-react';
import { toast } from 'sonner';
import ImmersiveLoader from '../components/ImmersiveLoader';

export default function Notifications() {
    const { user, role } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, audit, chat
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            let allNotifs = [];

            // 1. Audit Logs (if admin/manager)
            if (role === 'admin' || role === 'gestor') {
                const { data: audits } = await supabase
                    .from('audit_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (audits) {
                    allNotifs.push(...audits.map(log => ({
                        id: `audit-${log.id}`,
                        originalId: log.id,
                        type: 'audit',
                        title: `Auditoria: ${log.operation}`,
                        description: `Ação em ${log.table_name || 'Sistema'}`,
                        details: JSON.stringify(log.old_data || log.new_data || {}, null, 2),
                        time: new Date(log.created_at),
                        read: false // Placeholder logic for now
                    })));
                }
            }

            // 2. Chat Messages
            const { data: messages } = await supabase
                .from('chat_messages')
                .select(`
            id, content, created_at, sender_id, receiver_id,
            profiles:sender_id (full_name)
        `)
                .or(`receiver_id.eq.${user.id},receiver_id.is.null`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (messages) {
                allNotifs.push(...messages.map(msg => ({
                    id: `chat-${msg.id}`,
                    originalId: msg.id,
                    type: 'chat',
                    title: msg.profiles?.full_name || 'Nova Mensagem',
                    description: msg.content,
                    time: new Date(msg.created_at),
                    read: true // Messages are fleeting, usually read
                })));
            }

            allNotifs.sort((a, b) => b.time - a.time);
            setNotifications(allNotifs);

        } catch (error) {
            console.error("Erro ao carregar notificações", error);
            toast.error("Erro ao carregar notificações");
        } finally {
            setLoading(false);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'audit' && n.type !== 'audit') return false;
        if (filter === 'chat' && n.type !== 'chat') return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return n.title.toLowerCase().includes(term) || n.description.toLowerCase().includes(term);
        }
        return true;
    });

    const formatTime = (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Bell className="text-blue-600" /> Notificações
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Histórico de atividades e alertas do sistema
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchNotifications}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Atualizar"
                    >
                        <Inbox size={20} />
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar nas notificações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'chat' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                    >
                        Mensagens
                    </button>
                    {(role === 'admin' || role === 'gestor') && (
                        <button
                            onClick={() => setFilter('audit')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'audit' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                        >
                            Auditoria
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[400px]">
                {loading ? (
                    <ImmersiveLoader />
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-slate-300" />
                        </div>
                        <p>Nenhuma notificação encontrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredNotifications.map((notif, index) => (
                            <div
                                key={`${notif.id}-${index}`}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'audit'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {notif.type === 'audit' ? <ShieldAlert size={20} /> : <MessageCircle size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                                                {notif.title}
                                            </h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                                {formatTime(notif.time)}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 mb-2">
                                            {notif.description}
                                        </p>

                                        {notif.type === 'audit' && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded text-xs font-mono text-slate-500 overflow-hidden truncate">
                                                {notif.details}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
