
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AiChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Olá! Sou a IA do SAGEP. Posso consultar o status de sua inscrição ou tirar dúvidas sobre Editais ativos.' }
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

        // Add user message
        const userMsg = { id: Date.now(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const responseText = await generateSmartResponse(userMsg.text);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Desculpe, tive um problema ao conectar com o servidor.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateSmartResponse = async (text) => {
        const lowerText = text.toLowerCase();

        // 1. Tentar buscar por CPF ou Nome (Status de Inscrição)
        // Regex simples para CPF
        const cpfMatch = text.match(/[\d]{3}\.?[\d]{3}\.?[\d]{3}-?[\d]{2}/);
        if (cpfMatch) {
            const cpf = cpfMatch[0].replace(/[^\d]/g, '');
            const { data, error } = await supabase
                .from('candidatos')
                .select('nome, status, processo')
                .ilike('cpf', `%${cpf}%`) // ilike é case insensitive, mas cpf idealmente é exato. Usando like para flexibilidade
                .limit(1);

            if (data && data.length > 0) {
                const c = data[0];
                return `Encontrei a inscrição de **${c.nome}**. O status atual no processo **${c.processo}** é: **${c.status}**.`;
            } else {
                return `Não encontrei nenhuma inscrição ativa com o CPF informado (${cpfMatch[0]}).`;
            }
        }

        // 2. Busca por Processo Seletivo (Edital)
        if (lowerText.includes('edital') || lowerText.includes('processo') || lowerText.includes('vaga')) {
            const { data } = await supabase
                .from('processos')
                .select('nome, status')
                .eq('status', 'Aberto')
                .limit(3);

            if (data && data.length > 0) {
                const nomes = data.map(p => p.nome).join(', ');
                return `Atualmente temos os seguintes processos abertos: ${nomes}. Visite a página de Editais para mais detalhes.`;
            }
            return 'No momento não encontrei processos seletivos abertos no sistema.';
        }

        // 3. Fallback: Base de Conhecimento (Tabela FAQs)
        // Se a tabela não existir, vai cair no erro ou retornar vazio.
        try {
            const { data } = await supabase
                .from('faqs')
                .select('resposta')
                .textSearch('pergunta', lowerText, { type: 'websearch', config: 'portuguese' })
                .limit(1);

            if (data && data.length > 0) {
                return data[0].resposta;
            }
        } catch (e) {
            console.log('Tabela FAQs pode não existir ou erro na busca fulltext', e);
        }

        // 4. Resposta Padrão
        return 'Entendo. Para consultas específicas, por favor informe seu CPF. Para dúvidas gerais, estou aprendendo com os novos Editais publicados.';
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
                                <h3 className="font-bold text-sm">SAGEP Assistant</h3>
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
                                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
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
                                placeholder="Ex: CPF 123.456.789-00 ou 'Editais abertos'"
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
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}
