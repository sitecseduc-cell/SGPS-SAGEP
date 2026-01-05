import React, { useState } from 'react';
import { Search, User, FileText, Calendar, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export default function PesquisaCandidatos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [dre, setDre] = useState('Todas');
    const [candidatos, setCandidatos] = useState([]); // Agora é uma lista
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Lista de regionais/localidades
    const dres = ['Todas', 'Belém', 'Ananindeua', 'Castanhal', 'Marabá', 'Santarém', 'Altamira', 'Tucuruí', 'Breves'];

    const handleSearch = async (e) => {
        e.preventDefault();
        // Permitir busca vazia se quiser listar todos de uma DRE, ou exigir termo
        // Aqui vamos exigir pelo menos 1 caracter ou filtro de DRE
        if (!searchTerm.trim() && dre === 'Todas') {
            toast.warning('Digite algo ou selecione uma localidade para buscar.');
            return;
        }

        setLoading(true);
        setHasSearched(true);
        setCandidatos([]);

        try {
            let query = supabase
                .from('candidatos')
                .select('*')
                .order('nome', { ascending: true });

            if (searchTerm.trim()) {
                // Busca por nome (ilike) OU cpf (eq ou ilike)
                // Usando or com sintaxe correta do supabase
                query = query.or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
            }

            if (dre !== 'Todas') {
                query = query.ilike('localidade', `%${dre}%`);
            }

            const { data, error } = await query; // Removeu limit(1) e single()

            if (error) throw error;

            setCandidatos(data || []);
            if (!data || data.length === 0) {
                toast.info('Nenhum candidato encontrado.');
            } else {
                toast.success(`${data.length} candidato(s) encontrado(s).`);
            }

        } catch (error) {
            console.error(error);
            toast.error('Erro ao buscar candidatos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">Pesquisar Candidato</h2>
                <p className="text-slate-500">Localize ficha individual, histórico e status em toda a base.</p>
            </div>

            {/* Barra de Pesquisa */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-4 z-20">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                            placeholder="Digite o Nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <select
                            value={dre}
                            onChange={(e) => setDre(e.target.value)}
                            className="w-full pl-4 pr-8 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg appearance-none text-slate-600"
                        >
                            {dres.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </form>
            </div>

            {/* Resultados - Lista */}
            <div className="space-y-4">
                {candidatos.map((candidato) => (
                    <div key={candidato.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">

                            {/* Avatar / Iniciais */}
                            <div className="flex-shrink-0 w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                {candidato.nome?.charAt(0).toUpperCase()}
                            </div>

                            {/* Informações Principais */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-slate-800 truncate">{candidato.nome}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${candidato.status === 'Classificado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                        candidato.status === 'Desclassificado' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        {candidato.status || 'Sem Status'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <FileText size={16} /> CPF: {candidato.cpf}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Briefcase size={16} /> {candidato.cargo || 'Cargo n/d'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={16} /> {candidato.localidade || 'Local n/d'}
                                    </span>
                                </div>
                            </div>

                            {/* Ações / Detalhes */}
                            <div className="flex-shrink-0">
                                <button className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                    Detalhes <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hasSearched && candidatos.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <User size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Nenhum registro localizado para sua busca.</p>
                </div>
            )}
        </div>
    );
}
