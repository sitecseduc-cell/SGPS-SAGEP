import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Lightbulb, MessageSquare, CheckCircle, FileText, Send, User } from 'lucide-react';
import { GeminiService } from '../services/GeminiService';

const AnalysisModal = ({ isOpen, onClose, analysisData, fullText, onCreateProcess }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', text: 'Olá! Examinei o documento. Posso tirar dúvidas específicas sobre o edital, como *prazos*, *salários* ou *etapas*.' }
    ]);
    const [isChatting, setIsChatting] = useState(false);

    if (!isOpen || !analysisData) return null;

    const { raw_data } = analysisData;
    const deepData = raw_data || {};

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const userMsg = chatMessage;
        setChatMessage('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsChatting(true);

        try {
            const historyForApi = chatHistory.map(h => ({ role: h.role, text: h.text }));
            const response = await GeminiService.chatDocument(userMsg, fullText, historyForApi);
            setChatHistory(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'model', text: "Erro ao conectar com a IA." }]);
        } finally {
            setIsChatting(false);
        }
    };

    // Helper para Empty State
    const EmptyState = ({ text }) => (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm italic">{text}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn bg-black/60">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 relative">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <SparklesIcon />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Análise de Edital</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {deepData.dados_basicos?.nome || analysisData.nome || "Documento sem título"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Layout */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar / Tabs */}
                    <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
                        <nav className="p-4 space-y-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <FileText size={18} /> Visão Geral
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'insights' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <Lightbulb size={18} /> Riscos & Sugestões
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <MessageSquare size={18} /> Chat IA
                            </button>
                        </nav>

                        <div className="mt-auto p-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-2">Resumo da IA</h4>
                                <p className="text-xs text-indigo-700 dark:text-indigo-400/80 leading-relaxed">
                                    A análise pode conter erros. Verifique sempre o documento original.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/50 p-8">

                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-slideUp">
                                <section>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        📄 Resumo & Banca
                                    </h3>
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-500 uppercase">
                                                {deepData.dados_basicos?.banca || "Banca Não Identificada"}
                                            </span>
                                            {deepData.dados_basicos?.vagas_total && (
                                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase">
                                                    {deepData.dados_basicos.vagas_total} Vagas Totais
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {deepData.dados_basicos?.resumo || analysisData.descricao || "Nenhum resumo disponível."}
                                        </p>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            🗓️ Cronograma
                                        </h3>
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                            {deepData.datas_importantes && deepData.datas_importantes.length > 0 ? (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {deepData.datas_importantes.map((d, i) => (
                                                        <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{d.evento}</span>
                                                            <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                                                                {d.data}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState text="Nenhuma data encontrada." />
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                            💼 Cargos Principais
                                        </h3>
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                            {deepData.cargos && deepData.cargos.length > 0 ? (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                                                    {deepData.cargos.map((c, i) => (
                                                        <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-slate-700 dark:text-slate-200">{c.nome}</span>
                                                                <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                                                                    {c.vagas} vagas
                                                                </span>
                                                            </div>
                                                            {c.salario && (
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                                    💰 {c.salario}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState text="Nenhum cargo identificado." />
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'insights' && (
                            <div className="space-y-8 animate-slideUp">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                                            ⚠️ Atenção Necessária
                                        </h3>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30 h-full">
                                            {deepData.pontos_atencao && deepData.pontos_atencao.length > 0 ? (
                                                <ul className="space-y-4">
                                                    {deepData.pontos_atencao.map((p, i) => (
                                                        <li key={i} className="flex gap-3 text-amber-900 dark:text-amber-100/80 text-sm leading-relaxed">
                                                            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
                                                            {p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <EmptyState text="Nenhum ponto de atenção crítico." />
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                                            💡 Sugestões Estratégicas
                                        </h3>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/30 h-full">
                                            {deepData.sugestoes_ia && deepData.sugestoes_ia.length > 0 ? (
                                                <ul className="space-y-4">
                                                    {deepData.sugestoes_ia.map((s, i) => (
                                                        <li key={i} className="flex gap-3 text-indigo-900 dark:text-indigo-100/80 text-sm leading-relaxed">
                                                            <CheckCircle size={18} className="shrink-0 mt-0.5 text-indigo-500" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <EmptyState text="Sem sugestões no momento." />
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'chat' && (
                            <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-slideUp">
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-bl-none'
                                                }`}>
                                                {msg.text.split('**').map((part, i) =>
                                                    i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isChatting && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-slate-400 text-xs font-bold animate-pulse flex items-center gap-2">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div> Digitando...
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                                    <form onSubmit={handleSendMessage} className="relative flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ex: Qual a escolaridade exigida para o cargo de Professor?"
                                            className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-xl pl-5 pr-14 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                            value={chatMessage}
                                            onChange={e => setChatMessage(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!chatMessage.trim() || isChatting}
                                            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition-all disabled:opacity-50 disabled:scale-95 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Data Wrapper */}
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 z-10 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => onCreateProcess(analysisData)}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Aprovar e Criar Processo
                    </button>
                </div>

            </div>
        </div>
    );
};

// Helper Icon
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
);

export default AnalysisModal;
