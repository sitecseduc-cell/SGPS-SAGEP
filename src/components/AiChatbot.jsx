
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// Remove quotes if the user accidentally added them in .env
const rawKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
const apiKey = rawKey.replace(/['"]/g, '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export default function AiChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Olá! Sou o Assistente Inteligente do SAGEP. Posso ajudar com dúvidas gerais ou sobre um edital específico.' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Context Selection State
    const [availableProcesses, setAvailableProcesses] = useState([]);
    const [selectedContext, setSelectedContext] = useState('geral'); // 'geral' or process_id

    useEffect(() => {
        fetchProcesses();
    }, []);

    const fetchProcesses = async () => {
        const { data } = await supabase.from('processos').select('id, nome').order('created_at', { ascending: false });
        if (data) setAvailableProcesses(data);
    };

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
            // 1. Coletar Contexto do Sistema (RAG Lite)
            const contextData = [];
            let promptContextTitle = "CONTEXTO GERAL DO SISTEMA:";

            if (selectedContext !== 'geral') {
                // Fetch context specific to the process (Edital Text)
                const { data: procData } = await supabase
                    .from('processos')
                    .select('nome, edital_texto')
                    .eq('id', selectedContext)
                    .single();

                if (procData && procData.edital_texto) {
                    promptContextTitle = `CONTEXTO ESPECÍFICO DO EDITAL: ${procData.nome}`;
                    contextData.push(`TEXTO DO EDITAL:\n${procData.edital_texto.substring(0, 25000)}`); // Limit to avoid token limits
                    contextData.push(`NOTA: Responda APENAS com base no edital acima. Se não souber, diga que o edital não menciona.`);
                } else {
                    contextData.push(`(O usuário selecionou um processo, mas não há texto de edital salvo para ele.)`);
                }
            } else {
                // General Context (Database info)
                // Buscar Vagas
                const { data: vagas } = await supabase.from('vagas').select('municipio, escola, cargo, qtd').limit(10);
                if (vagas && vagas.length > 0) {
                    const vagasStr = vagas.map(v => `- ${v.cargo} em ${v.municipio} (${v.escola}): ${v.qtd} vagas`).join('\n');
                    contextData.push(`VAGAS DISPONÍVEIS:\n${vagasStr}`);
                }

                // Buscar Critérios
                const { data: criterios } = await supabase.from('criterios_pontuacao').select('titulo, pontos').limit(10);
                if (criterios && criterios.length > 0) {
                    const critStr = criterios.map(c => `- ${c.titulo}: ${c.pontos} pontos`).join('\n');
                    contextData.push(`CRITÉRIOS DE PONTUAÇÃO:\n${critStr}`);
                }

                // Buscar FAQs (Busca Semântica ou Textual simples)
                const { data: faqs } = await supabase.from('faqs').select('pergunta, resposta').textSearch('pergunta', text, { type: 'websearch', config: 'portuguese' }).limit(3);
                if (faqs && faqs.length > 0) {
                    const faqStr = faqs.map(f => `P: ${f.pergunta}\nR: ${f.resposta}`).join('\n');
                    contextData.push(`FAQs RELACIONADAS:\n${faqStr}`);
                }
            }

            // 2. Construir Prompt
            const contextString = contextData.join('\n\n');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
You are the Virtual Assistant for SAGEP.
Your goal is to answer questions based STRICTLY on the provided context.

${promptContextTitle}
${contextString}

USER QUESTION:
${text}
            `;

            // 3. Gerar Resposta
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Erro na IA:", error);
            // Fallback simples se a API falhar
            return "Estou tendo problemas para processar sua solicitação com a IA. Por favor, verifique se a chave API está configurada corretamente.";
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Janela do Chat */}
            {isOpen && (
                <div className="mb-4 bg-white dark:bg-slate-800 w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-fadeIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                        <div className="flex justify-between items-center mb-3">
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
                        {/* Context Selector */}
                        <select
                            value={selectedContext}
                            onChange={(e) => setSelectedContext(e.target.value)}
                            className="w-full bg-white/20 border border-white/30 text-white text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-white custom-select"
                        >
                            <option value="geral" className="text-slate-800">🌍 Contexto Geral (Vagas, FAQs)</option>
                            <optgroup label="Perguntar sobre Edital">
                                {availableProcesses.map(p => (
                                    <option key={p.id} value={p.id} className="text-slate-800">📄 {p.nome}</option>
                                ))}
                            </optgroup>
                        </select>
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
