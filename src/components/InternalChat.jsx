import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, Globe, Hash, CornerDownLeft, ChevronLeft, User, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function InternalChat() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('global');
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // New: Search state
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // ... (Keep existing listener useEffects) ...
    // Listen for external open requests
    useEffect(() => {
        const handleOpenChat = (event) => {
            setIsOpen(true);
            if (event.detail?.userId) {
                fetchUserProfileAndOpen(event.detail.userId);
            }
        };
        window.addEventListener('open-internal-chat', handleOpenChat);
        return () => window.removeEventListener('open-internal-chat', handleOpenChat);
    }, []);

    const fetchUserProfileAndOpen = async (uid) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
        if (data) {
            setSelectedUser(data);
            setActiveTab('direct_chat');
        }
    };

    // Load Data
    useEffect(() => {
        if (!isOpen) return;

        if (activeTab === 'users') {
            fetchUsers();
        }

        if (activeTab === 'global' || activeTab === 'direct_chat') {
            fetchMessages();
            const channel = subscribeToMessages();
            return () => { supabase.removeChannel(channel); };
        }
    }, [isOpen, activeTab, selectedUser]);

    // Auto-scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, activeTab]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ... (Keep fetch functions, but improved) ...
    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)
            .order('full_name'); // Order by name

        if (error) console.error("Error fetching users:", error);
        else setUsersList(data || []);
    };

    const fetchMessages = async () => {
        try {
            let query = supabase
                .from('chat_messages')
                .select(`
                    id, content, created_at, sender_id, receiver_id,
                    sender:profiles!sender_id (full_name, avatar_url)
                `)
                .order('created_at', { ascending: true })
                .limit(50);

            if (activeTab === 'global') {
                query = query.is('receiver_id', null);
            } else if (activeTab === 'direct_chat' && selectedUser) {
                query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`);
            } else {
                return;
            }

            const { data, error } = await query;
            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                async (payload) => {
                    const newMsg = payload.new;
                    let isRelevant = false;

                    if (activeTab === 'global' && !newMsg.receiver_id) isRelevant = true;
                    else if (activeTab === 'direct_chat' && selectedUser) {
                        const isDirect = (newMsg.sender_id === user.id && newMsg.receiver_id === selectedUser.id) ||
                            (newMsg.sender_id === selectedUser.id && newMsg.receiver_id === user.id);
                        if (isDirect) isRelevant = true;
                    }

                    if (isRelevant) {
                        const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newMsg.sender_id).single();
                        setMessages(prev => [...prev, { ...newMsg, sender: data }]);
                    }
                }
            )
            .subscribe();
        return channel;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        const text = newMessage.trim();
        setNewMessage('');
        try {
            await supabase.from('chat_messages').insert({
                content: text,
                sender_id: user.id,
                receiver_id: activeTab === 'direct_chat' ? selectedUser?.id : null
            });
        } catch (error) {
            toast.error("Erro ao enviar.");
            setNewMessage(text);
        }
    };

    const handleUserSelect = (targetUser) => {
        setSelectedUser(targetUser);
        setActiveTab('direct_chat');
        setMessages([]);
    };

    // --- UTILS ---
    const getDateLabel = (date) => {
        const d = new Date(date);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Hoje';
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
        return d.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((acc, msg) => {
        const dateLabel = getDateLabel(msg.created_at);
        if (!acc[dateLabel]) acc[dateLabel] = [];
        acc[dateLabel].push(msg);
        return acc;
    }, {});

    // Filtered Users
    const filteredUsers = usersList.filter(u =>
        (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-28 z-[60] flex flex-col items-end pointer-events-none font-sans">
            {isOpen && (
                <div className="mb-4 bg-white dark:bg-slate-800 w-80 md:w-96 h-[550px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-fadeIn flex flex-col transform transition-all">

                    {/* HEADER */}
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            {activeTab === 'direct_chat' ? (
                                <button onClick={() => { setActiveTab('users'); setSelectedUser(null); }} className="hover:bg-slate-800 p-1.5 rounded-full transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                            ) : (
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <MessageCircle size={20} className="text-blue-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-sm leading-tight">
                                    {activeTab === 'direct_chat' ? selectedUser?.full_name : 'Chat da Equipe'}
                                </h3>
                                <div className="flex items-center gap-1.5 opacity-70">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* TABS */}
                    {activeTab !== 'direct_chat' && (
                        <div className="flex bg-slate-100 p-1 dark:bg-slate-900 shrink-0">
                            {['global', 'users'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === tab
                                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {tab === 'global' ? <Globe size={14} /> : <Users size={14} />}
                                    {tab === 'global' ? 'Global' : 'Direto'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* CONTENT */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 relative custom-scrollbar flex flex-col" ref={chatContainerRef}>

                        {/* MESSAGES VIEW */}
                        {(activeTab === 'global' || activeTab === 'direct_chat') && (
                            <div className="p-4 space-y-6">
                                {Object.keys(groupedMessages).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-40 mt-10">
                                        <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-full mb-3">
                                            {activeTab === 'global' ? <Hash size={24} /> : <User size={24} />}
                                        </div>
                                        <p className="text-xs text-center font-medium">Nenhuma mensagem ainda.<br />Comece a conversa!</p>
                                    </div>
                                ) : (
                                    Object.entries(groupedMessages).map(([date, msgs]) => (
                                        <div key={date} className="space-y-4">
                                            <div className="flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                    {date}
                                                </span>
                                            </div>
                                            {msgs.map((msg, idx) => {
                                                const isMe = msg.sender_id === user.id;
                                                // Check for sequence to group bubbles
                                                const isSequence = idx > 0 && msgs[idx - 1].sender_id === msg.sender_id;

                                                return (
                                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSequence ? '-mt-2' : ''}`}>
                                                        {!isMe && !isSequence && (
                                                            <div className="flex items-center gap-2 mb-1 ml-1">
                                                                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold uppercase ring-2 ring-white dark:ring-slate-800">
                                                                    {(msg.sender?.full_name || '?').substring(0, 2)}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                                                    {msg.sender?.full_name}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className={`px-4 py-2 max-w-[85%] text-sm rounded-2xl shadow-sm relative group transition-all hover:shadow-md ${isMe
                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-bl-sm'
                                                            }`}>
                                                            {msg.content}
                                                            <div className={`text-[9px] mt-1 text-right w-full flex justify-end items-center gap-1 ${isMe ? 'opacity-70 text-blue-100' : 'opacity-50'}`}>
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* USERS LIST VIEW */}
                        {activeTab === 'users' && (
                            <div className="p-2 space-y-2">
                                <div className="px-2 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 pb-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Buscar colega..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                {filteredUsers.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleUserSelect(u)}
                                        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-blue-100 rounded-xl transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            {(u.full_name || 'U').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-700 transition-colors">
                                                {u.full_name || 'Usuário'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{u.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* FOOTER INPUT */}
                    {(activeTab === 'global' || activeTab === 'direct_chat') && (
                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0 shadow-lg z-20">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:scale-95 transition-all shadow-md group"
                                >
                                    <Send size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* FLOATING TRIGGER BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-white dark:border-slate-800 group hover:scale-110 active:scale-95 ${isOpen
                    ? 'bg-red-500 text-white rotate-90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} className="group-hover:animate-bounce-slow" />}
            </button>
        </div>
    );
}
