import React, { useState } from 'react';
import { Search, User, FileText, Calendar, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export default function PesquisaCandidatos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [candidato, setCandidato] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setCandidato(null);

        try {
            // Busca simplificada por nome ou CPF (assumindo que CPF está na coluna cpf)
            // Ajuste conforme seu schema real (atualmente vejo 'nome', 'cpf', 'cargo', etc em Inscritos.jsx)
            const { data, error } = await supabase
                .from('candidatos')
                .select('*')
                .or(`nome.ilike.%${searchTerm}%,cpf.eq.${searchTerm}`)
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            setCandidato(data);
            if (!data) toast.info('Nenhum candidato encontrado com estes dados.');

        } catch (error) {
            console.error(error);
            toast.error('Erro ao buscar candidato.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">Pesquisar Candidato</h2>
                <p className="text-slate-500">Localize ficha individual, histórico e status.</p>
            </div>

            {/* Barra de Pesquisa */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                            placeholder="Digite o Nome ou CPF do candidato..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </form>
            </div>

            {/* Resultados */}
            {candidato && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                    <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{candidato.nome}</h3>
                                <p className="text-slate-500 flex items-center gap-2 text-sm">
                                    CPF: {candidato.cpf}
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">{candidato.status}</span>
                                </p>
                            </div>
                        </div>
                        <button className="text-blue-600 font-bold text-sm hover:underline">
                            Ver Histórico Completo &rarr;
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider border-b pb-2">Dados da Inscrição</h4>

                            <div className="flex items-start gap-3">
                                <Briefcase size={18} className="text-slate-400 mt-1" />
                                <div>
                                    <label className="block text-xs text-slate-500">Cargo Pretendido</label>
                                    <span className="font-medium text-slate-700">{candidato.cargo}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-slate-400 mt-1" />
                                <div>
                                    <label className="block text-xs text-slate-500">Localidade / Município</label>
                                    <span className="font-medium text-slate-700">{candidato.localidade || candidato.municipio || 'Não informado'}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar size={18} className="text-slate-400 mt-1" />
                                <div>
                                    <label className="block text-xs text-slate-500">Data de Inscrição</label>
                                    <span className="font-medium text-slate-700">
                                        {candidato.created_at ? new Date(candidato.created_at).toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider border-b pb-2">Informações Adicionais</h4>
                            <div className="flex items-start gap-3">
                                <FileText size={18} className="text-slate-400 mt-1" />
                                <div>
                                    <label className="block text-xs text-slate-500">Processo Seletivo</label>
                                    <span className="font-medium text-slate-700">{candidato.processo || 'Geral'}</span>
                                </div>
                            </div>
                            {/* Adicionar mais campos conforme existirem no banco */}
                        </div>
                    </div>
                </div>
            )}

            {hasSearched && !candidato && !loading && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <User size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Nenhum registro localizado para "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}
