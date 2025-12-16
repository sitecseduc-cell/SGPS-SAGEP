import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function PreAvaliacao() {
    const [candidatos, setCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    const fetchCandidatos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('candidatos')
            .select('*')
            .eq('status', 'Em Análise')
            .order('created_at', { ascending: true }); // FIFO: Primeiro a entrar, primeiro a ser avaliado

        if (error) {
            toast.error('Erro ao carregar candidatos.');
            console.error(error);
        } else {
            setCandidatos(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCandidatos();
    }, []);

    const handleAvaliacao = async (id, novoStatus) => {
        setProcessing(id);
        try {
            const { error } = await supabase
                .from('candidatos')
                .update({ status: novoStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Candidato ${novoStatus === 'Classificado' ? 'APROVADO' : 'REPROVADO'} com sucesso.`);

            // Remove da lista local para animar/atualizar
            setCandidatos(prev => prev.filter(c => c.id !== id));

        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar status.');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Pré-Avaliação de Candidatos</h2>
                    <p className="text-slate-500">Analise e trie os candidatos "Em Análise".</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
                    {candidatos.length} Pendentes
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : candidatos.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <CheckCircle size={48} className="mx-auto text-green-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Tudo limpo!</h3>
                    <p className="text-slate-500">Não há candidatos pendentes de pré-avaliação no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {candidatos.map((candidato) => (
                        <div key={candidato.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md">

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{candidato.nome}</h4>
                                    <div className="flex flex-wrap gap-2 text-sm text-slate-500 mt-1">
                                        <span className="font-medium text-slate-700">{candidato.cargo}</span>
                                        <span>•</span>
                                        <span>CPF: {candidato.cpf}</span>
                                        <span>•</span>
                                        <span>{candidato.municipio || candidato.localidade}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Inscrito em: {new Date(candidato.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                                <button
                                    onClick={() => handleAvaliacao(candidato.id, 'Desclassificado')}
                                    disabled={processing === candidato.id}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                                >
                                    <XCircle size={18} /> Reprovar
                                </button>
                                <button
                                    onClick={() => handleAvaliacao(candidato.id, 'Classificado')}
                                    disabled={processing === candidato.id}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md shadow-green-200 transition-colors disabled:opacity-50"
                                >
                                    {processing === candidato.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    Aprovar
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
