
import React, { useState, useEffect } from 'react';
import { Layers, List, Edit3, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Planejamento() {
    const [activeTab, setActiveTab] = useState('vagas'); // 'vagas' or 'pontuacao'

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Planejamento & Editais</h2>
                    <p className="text-slate-500">Configure vagas e critérios de pontuação para o Edital.</p>
                </div>
            </div>

            {/* Tabs de Navegação Interna */}
            <div className="flex space-x-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('vagas')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'vagas'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Configurador de Vagas
                </button>
                <button
                    onClick={() => setActiveTab('pontuacao')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'pontuacao'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Matriz de Pontuação
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                {activeTab === 'vagas' ? <ConfiguradorVagas /> : <MatrizPontuacao />}
            </div>
        </div>
    );
}

// Sub-component: Configurador de Vagas
// Sub-component: Configurador de Vagas
function ConfiguradorVagas() {
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVagas();
    }, []);

    const fetchVagas = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('vagas').select('*');
            if (error) throw error;
            setVagas(data || []);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Layers size={20} className="text-blue-500" /> Vagas por Lotação
                </h3>
                <button
                    onClick={() => alert('Backend: Implementar cadastro')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                    <Plus size={16} /> Adicionar Vaga
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Município</th>
                            <th className="px-4 py-3">DRE</th>
                            <th className="px-4 py-3">Escola</th>
                            <th className="px-4 py-3 text-center">Vagas</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Carregando dados...</td></tr>
                        ) : vagas.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">Nenhuma vaga encontrada.</td></tr>
                        ) : (
                            vagas.map(v => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{v.municipio}</td>
                                    <td className="px-4 py-3 text-slate-600">{v.dre}</td>
                                    <td className="px-4 py-3 text-slate-600">{v.escola}</td>
                                    <td className="px-4 py-3 text-center font-bold text-blue-600">{v.qtd}</td>
                                    <td className="px-4 py-3 text-right text-slate-400">
                                        <button className="hover:text-blue-600 mr-2"><Edit3 size={16} /></button>
                                        <button className="hover:text-red-600"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Sub-component: Matriz de Pontuação
function MatrizPontuacao() {
    const [criterios, setCriterios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCriterios();
    }, []);

    const fetchCriterios = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('criterios_pontuacao').select('*');
            if (error) throw error;
            setCriterios(data || []);
        } catch (error) {
            console.error('Erro ao buscar critérios:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <List size={20} className="text-emerald-500" /> Tabela de Títulos
                </h3>
                <button
                    onClick={() => alert('Backend: Implementar cadastro')}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700"
                >
                    <Plus size={16} /> Novo Critério
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Título / Critério</th>
                            <th className="px-4 py-3">Área de Avaliação</th>
                            <th className="px-4 py-3 text-center">Pontuação Unitária</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500">Carregando critérios...</td></tr>
                        ) : criterios.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">Nenhum critério definido.</td></tr>
                        ) : (
                            criterios.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{c.titulo}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                            {c.area}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-emerald-600">{c.pontos ? c.pontos.toFixed(1) : '0.0'}</td>
                                    <td className="px-4 py-3 text-right text-slate-400">
                                        <button className="hover:text-blue-600 mr-2"><Edit3 size={16} /></button>
                                        <button className="hover:text-red-600"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                    <strong>Nota:</strong> Alterações na matriz de pontuação só afetarão novos processos seletivos ou reprocessamentos iniciados após a mudança.
                </p>
            </div>
        </div>
    );
}
