import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { GeminiService } from '../services/GeminiService';

export default function AiChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Olá! Sou o Assistente Inteligente do CPS, agora com acesso total aos dados do sistema. Pergunte sobre processos, vagas, candidatos ou auditoria!' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const responseText = await generateSmartResponse(userMsg.text);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: responseText }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Desculpe, estou enfrentando dificuldades técnicas no momento.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateSmartResponse = async (text) => {
        try {
            // 1. Coletar Contexto do Sistema (RAG Lite Expandido)
            const contextData = [];

            // A. Mapa do Sistema (Conhecimento Estático)
            const SYSTEM_MAP = `
            SOBRE O SISTEMA CPS (Gestão de Processos Públicos):
            - Módulo Processos: Criação e gestão de editais (PSS), com análise de PDF via IA.
            - Módulo Vagas: Controle de lotação, vacância e status de servidores.
            - Módulo Candidatos: Acompanhamento de inscritos (Kanban: Classificado -> Em Análise -> Pendência -> Homologado).
            - Módulo Planejamento: Gestão de orçamento (LOA) e limites prudenciais (LRF).
            - Módulo Auditoria: Rastreabilidade total de alterações (Logs) e Relatórios IOEPA.
            `;
            contextData.push(SYSTEM_MAP);

            // B. Dados em Tempo Real (Dinâmico)

            // Vagas (Amostra e Resumo)
            const { data: vagas, count: totalVagas } = await supabase.from('controle_vagas').select('municipio, cargo_funcao, vacancia, status', { count: 'exact' }).limit(10);
            if (vagas) {
                const vagasStr = vagas.map(v => `- ${v.cargo_funcao} (${v.municipio}): ${v.status}`).join('\n');
                contextData.push(`VAGAS (Total: ${totalVagas}):\n${vagasStr}\n...`);
            }

            // Processos
            const { data: processos } = await supabase.from('processos').select('nome, status, inicio, fim').order('created_at', { ascending: false }).limit(5);
            if (processos) {
                contextData.push(`PROCESSOS RECENTES:\n${processos.map(p => `- ${p.nome} [${p.status}] (${p.inicio} a ${p.fim})`).join('\n')}`);
            }

            // Estatísticas de Candidatos (Agregado simples)
            const { count: totalCandidatos } = await supabase.from('candidatos').select('*', { count: 'exact', head: true });
            const { count: convocados } = await supabase.from('candidatos').select('*', { count: 'exact', head: true }).eq('status', 'Convocado');
            contextData.push(`ESTATÍSTICAS GERAIS:\n- Total de Inscritos: ${totalCandidatos}\n- Total de Convocados: ${convocados}`);

            // C. Auditoria Recente (Segurança)
            const { data: audit } = await supabase.from('audit_logs').select('operation, table_name, created_at').order('created_at', { ascending: false }).limit(3);
            if (audit) {
                contextData.push(`ÚLTIMAS AÇÕES NO SISTEMA:\n${audit.map(a => `- ${a.operation} em ${a.table_name} às ${new Date(a.created_at).toLocaleTimeString()}`).join('\n')}`);
            }

            // 2. Usar o Serviço Centralizado com Prompt Rico
            const contextString = contextData.join('\n\n====================\n\n');
            const response = await GeminiService.chat(text, contextString);
            return response;

        } catch (error) {
            console.error("Erro na IA:", error);
            return "Estou tendo problemas para acessar os dados do sistema agora. Tente novamente.";
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Janela do Chat */}
            {isOpen && (
                <div className="mb-4 bg-white dark:bg-slate-800 w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-fadeIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <div>
                                <h3 className="font-bold text-sm">CPS Assistant</h3>
                                <p className="text-[10px] opacity-80">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 space-y-3 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-bl-none'
                                        }`}
                                >
                                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg rounded-bl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Pergunte sobre vagas, editais, auditoria..."
                                className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                className="absolute right-1 top-1 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Botão Flutuante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen
                    ? 'bg-red-500 hover:bg-red-600 rotate-90'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-110 animate-bounce-slow'
                    } text-white`}
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
            </button>
        </div>
    );
}
