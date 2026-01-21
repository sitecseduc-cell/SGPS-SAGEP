import React, { useState } from 'react';
import { X, Sparkles, UserCheck, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import { GeminiService } from '../services/GeminiService';
import { fetchCandidatos } from '../services/candidatos';
import { toast } from 'sonner';

export default function SmartConvocationModal({ isOpen, onClose, vacancies, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [step, setStep] = useState('intro'); // intro, loading, results

    if (!isOpen) return null;

    const handleStartAnalysis = async () => {
        setStep('loading');
        setLoading(true);
        try {
            // 1. Fetch Candidates
            const allCandidates = await fetchCandidatos();

            // 2. Filter valid candidates (e.g., only 'Classificado' or 'Aprovado')
            const validCandidates = allCandidates.filter(c =>
                c.status === 'Classificado' || c.status === 'Aprovado' || c.status === 'Inscrito'
            );

            // 3. Call AI
            const result = await GeminiService.generateConvocationSuggestion(vacancies, validCandidates);
            setSuggestions(result);
            setStep('results');

        } catch (error) {
            console.error(error);
            toast.error("Erro na análise inteligente: " + error.message);
            setStep('intro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Convocação Inteligente</h2>
                            <p className="text-sm text-slate-500">IA analisando cruzamento de vagas vs. candidatos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">

                    {step === 'intro' && (
                        <div className="text-center space-y-6 py-10">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Sparkles size={40} className="text-indigo-600" />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Pronto para Otimizar?</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    O sistema irá analisar <strong>{vacancies.length} vagas abertas</strong> e cruzar com a base de candidatos disponíveis, verificando compatibilidade de cargo, localidade e nota.
                                </p>
                            </div>
                            <button
                                onClick={handleStartAnalysis}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                            >
                                <BrainCircuit size={20} /> Iniciar Análise IA
                            </button>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium animate-pulse">Processando dados e regras de negócio...</p>
                        </div>
                    )}

                    {step === 'results' && suggestions && (
                        <div className="space-y-6 animate-slideUp">
                            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
                                <CheckCircle size={18} />
                                Análise concluída! Confira as sugestões abaixo.
                            </div>

                            <div className="space-y-4">
                                {suggestions.sugestoes.map((sug, idx) => {
                                    const vaga = vacancies.find(v => v.id == sug.vaga_id) || {};
                                    return (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group">

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold uppercase text-slate-400">Vaga #{sug.vaga_id}</span>
                                                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{vaga.municipio || 'N/A'}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {vaga.cargo_funcao || vaga.cargo || 'Cargo Desconhecido'}
                                                </h4>
                                            </div>

                                            <div className="hidden md:block text-slate-300">
                                                →
                                            </div>

                                            <div className="flex-1 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-bold text-indigo-900 flex items-center gap-2">
                                                            <UserCheck size={16} className="text-indigo-500" />
                                                            Candidato Sugerido (ID: {sug.candidato_id})
                                                        </h5>
                                                        <p className="text-xs text-indigo-700 mt-1">{sug.motivo}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-2xl font-bold text-indigo-600">{sug.match_score}%</span>
                                                        <span className="text-[10px] uppercase font-bold text-indigo-400">Match</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors opacity-50 group-hover:opacity-100">
                                                Aprovar
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {suggestions.sem_candidato && suggestions.sem_candidato.length > 0 && (
                                <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                                        <AlertTriangle size={18} /> Vagas sem sugestão ({suggestions.sem_candidato.length})
                                    </h4>
                                    <p className="text-sm text-amber-700">
                                        IDs: {suggestions.sem_candidato.join(', ')}. Não encontramos candidatos compatíveis na base para estas vagas.
                                    </p>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">
                        Fechar
                    </button>
                    {step === 'results' && (
                        <button onClick={() => toast.success("Convocação em massa iniciada!")} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all">
                            Confirmar Todas
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
