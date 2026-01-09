import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, Globe, Hash, CornerDownLeft, ChevronLeft, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function InternalChat() {
    const { user } = useAuth();
    console.log('InternalChat rendering', user);

    // States
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('global'); // 'global' | 'users' | 'direct_chat'
    const [selectedUser, setSelectedUser] = useState(null); // User we are chatting with
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [usersList, setUsersList] = useState([]);
    const messagesEndRef = useRef(null);

    // Listen for external open requests
    useEffect(() => {
        const handleOpenChat = (event) => {
            setIsOpen(true);
            if (event.detail?.userId) {
                // If a specific user is requested (e.g. from notification)
                // We need to find the user object first implies we need to have fetched users or fetch him now.
                // For simplicity, we might just switch tab or try to set selectedUser if we have users list.
                // A robust way: fetch that single user profile and set it.
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

    // Initial Load & Listeners
    useEffect(() => {
        if (!isOpen) return;

        // Load Users when tab changes to users
        if (activeTab === 'users') {
            fetchUsers([]);
        }

        // Load Messages corresponding to the active view
        if (activeTab === 'global' || activeTab === 'direct_chat') {
            fetchMessages();
            subscribeToMessages();
        }

        return () => {
            // Cleanup subscription
            supabase.removeAllChannels();
        };
    }, [isOpen, activeTab, selectedUser]); // Re-run when view changes

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, activeTab]);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id); // Exclude self

        if (error) console.error("Error fetching users:", error);
        else setUsersList(data || []);
    };

    const fetchMessages = async () => {
        try {
            let query = supabase
                .from('chat_messages')
                .select(`
                    id, content, created_at, sender_id, receiver_id,
                    profiles:sender_id (full_name, avatar_url)
                `)
                .order('created_at', { ascending: true })
                .limit(50);

            if (activeTab === 'global') {
                query = query.is('receiver_id', null);
            } else if (activeTab === 'direct_chat' && selectedUser) {
                console.log('Fetching DM between:', user.id, 'and', selectedUser.id);
                // Using a clearer OR syntax for Supabase
                query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`);
            } else {
                return; // No messages to fetch for list view
            }

            const { data, error } = await query;

            if (error) {
                console.error("Erro ao carregar mensagens:", error);
                if (error.code === '42P01') {
                    toast.error("Tabela de chat não encontrada.");
                } else {
                    toast.error("Erro ao carregar chat: " + error.message);
                }
            } else {
                setMessages(data || []);
            }
        } catch (err) {
            console.error("Exception in fetchMessages:", err);
        }
    };

    const subscribeToMessages = () => {
        // We use a broad subscription and filter manually in client for simplicity in this demo,
        // or we could set up specific filters. For low volume, filtering here is fine.
        const channel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                async (payload) => {
                    const newMsg = payload.new;

                    // 1. Check if this message belongs to the current view
                    let isRelevant = false;

                    if (activeTab === 'global' && !newMsg.receiver_id) {
                        isRelevant = true;
                    } else if (activeTab === 'direct_chat' && selectedUser) {
                        const isFromMeToHim = newMsg.sender_id === user.id && newMsg.receiver_id === selectedUser.id;
                        const isFromHimToMe = newMsg.sender_id === selectedUser.id && newMsg.receiver_id === user.id;
                        if (isFromMeToHim || isFromHimToMe) isRelevant = true;
                    }

                    if (isRelevant) {
                        // Fetch profile info
                        const { data } = await supabase
                            .from('profiles')
                            .select('full_name, avatar_url')
                            .eq('id', newMsg.sender_id)
                            .single();

                        setMessages(prev => [...prev, { ...newMsg, profiles: data }]);
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
            const msgData = {
                content: text,
                sender_id: user.id,
                receiver_id: activeTab === 'direct_chat' ? selectedUser?.id : null
            };

            const { error } = await supabase.from('chat_messages').insert(msgData);

            if (error) throw error;
        } catch (error) {
            console.error(error);
            toast.error("Erro: " + (error.message || "Falha ao enviar."));
            setNewMessage(text);
        }
    };

    const handleUserSelect = (targetUser) => {
        setSelectedUser(targetUser);
        setActiveTab('direct_chat');
        setMessages([]); // Clear previous view
    };

    const handleBackToUsers = () => {
        setSelectedUser(null);
        setActiveTab('users');
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 bg-white dark:bg-slate-800 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-fadeIn flex flex-col">

                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                        <div className="flex items-center gap-2">
                            {activeTab === 'direct_chat' ? (
                                <button onClick={handleBackToUsers} className="mr-1 hover:bg-slate-700 p-1 rounded">
                                    <ChevronLeft size={18} />
                                </button>
                            ) : (
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <MessageCircle size={18} className="text-blue-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-sm">
                                    {activeTab === 'direct_chat' ? selectedUser?.full_name : 'Chat da Equipe'}
                                </h3>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs (Navigation) */}
                    {activeTab !== 'direct_chat' && (
                        <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                            <button
                                onClick={() => setActiveTab('global')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'global' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Globe size={14} /> Global
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Users size={14} /> Direto
                            </button>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar relative">

                        {/* GLOBAL & DIRECT CHAT VIEW */}
                        {(activeTab === 'global' || activeTab === 'direct_chat') && (
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-10 opacity-50">
                                        <div className="bg-slate-200 dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            {activeTab === 'global' ? <Hash className="text-slate-500" /> : <User className="text-slate-500" />}
                                        </div>
                                        <p className="text-xs">
                                            {activeTab === 'global' ? "Nenhuma mensagem global." : "Inicie a conversa!"}
                                        </p>
                                    </div>
                                )}

                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    const showName = (activeTab === 'global') && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);

                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {showName && !isMe && (
                                                <span className="text-[10px] text-slate-500 ml-1 mb-1 font-bold">
                                                    {msg.profiles?.full_name || 'Usuário'}
                                                </span>
                                            )}
                                            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm relative group ${isMe
                                                ? 'bg-slate-800 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                                <span className="text-[9px] opacity-50 block text-right mt-1 -mb-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* USERS LIST VIEW */}
                        {activeTab === 'users' && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Selecione um usuário</h4>
                                {usersList.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <p className="text-xs">Nenhum outro usuário encontrado.</p>
                                    </div>
                                ) : (
                                    usersList.map((u) => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleUserSelect(u)}
                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl transition-all group text-left"
                                        >
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-sm">
                                                        {(u.full_name || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-700">
                                                    {u.full_name || 'Usuário Sem Nome'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">Clique para conversar</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area (Only for Global or Direct Chat) */}
                    {(activeTab === 'global' || activeTab === 'direct_chat') && (
                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={activeTab === 'global' ? "Mensagem para todos..." : `Mensagem para ${selectedUser?.full_name?.split(' ')[0]}...`}
                                    className="flex-1 pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            )}

            {/* Float Button trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg shadow-slate-900/20 transition-all duration-300 flex items-center justify-center border-2 border-white dark:border-slate-800 ${isOpen
                    ? 'bg-slate-700 text-white hover:bg-slate-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800 animate-pulse-slow'
                    }`}
                title="Chat da Equipe"
            >
                {isOpen ? <CornerDownLeft size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
}
