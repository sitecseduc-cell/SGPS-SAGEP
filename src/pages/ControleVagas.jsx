import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, FileSpreadsheet, Download, Loader2, Check, Edit, Trash, BrainCircuit } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import NewVacancyModal from '../components/NewVacancyModal';
import SmartConvocationModal from '../components/SmartConvocationModal';

export default function ControleVagas() {
    const [showConvocationModal, setShowConvocationModal] = useState(false);
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewVacancyModal, setShowNewVacancyModal] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState(null);

    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        status: '',
        secretaria: ''
    });

    const [visibleColumns, setVisibleColumns] = useState({
        matvin: true,
        servidor: true,
        cargo: true,
        atividade: true,
        vacancia: true,
        status: true,
        lotacao: true,
        dre: false,
        secretaria: false,
        municipio: true,
        atendido: true,
        convocado: true,
        obs: true
    });

    // Paginação
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 8;

    // Buscar dados do Supabase
    useEffect(() => {
        fetchVagas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm, activeFilters]);

    const fetchVagas = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('controle_vagas')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`servidor.ilike.%${searchTerm}%,matvin.ilike.%${searchTerm}%,cargo_funcao.ilike.%${searchTerm}%`);
            }

            // Filtros Avançados
            if (activeFilters.status) {
                query = query.eq('status', activeFilters.status);
            }
            if (activeFilters.secretaria) {
                query = query.ilike('secretaria_pertencente', `%${activeFilters.secretaria}%`);
            }

            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            const { data, error, count } = await query
                .range(from, to)
                .order('servidor', { ascending: true });

            if (error) throw error;

            setVagas(data || []);
            setTotalItems(count || 0);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            toast.error('Não foi possível carregar as vagas.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditVacancy = (vaga) => {
        setEditingVacancy(vaga);
        setShowNewVacancyModal(true);
    };

    const handleDeleteVacancy = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta vaga?')) return;

        try {
            const { error } = await supabase.from('controle_vagas').delete().eq('id', id);
            if (error) throw error;
            toast.success('Vaga excluída com sucesso.');
            fetchVagas(); // Recarrega a lista
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir vaga.');
        }
    };

    const handleNewVacancySaved = () => {
        fetchVagas();
        setEditingVacancy(null);
    };

    const handleCloseModal = () => {
        setShowNewVacancyModal(false);
        setEditingVacancy(null);
    };

    const toggleColumn = (colKey) => {
        setVisibleColumns(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    // Exportação simplificada
    const handleExport = () => {
        const headers = [
            'MATVIN', 'SERVIDOR', 'CARGO', 'ATIVIDADE', 'VACANCIA',
            'STATUS', 'ULTIMA_LOTACAO', 'DRE', 'SECRETARIA', 'MUNICIPIO', 'ATENDIDO', 'CONVOCADO', 'OBS'
        ];

        const csvRows = [headers.join(',')];

        vagas.forEach(v => {
            const row = [
                v.matvin,
                `"${v.servidor}"`,
                `"${v.cargo_funcao}"`,
                v.atividade,
                v.vacancia,
                v.status,
                `"${v.ultima_lotacao}"`,
                v.dre,
                v.secretaria_pertencente,
                v.municipio,
                v.atendido_candidato,
                v.candidato_convocado,
                `"${v.observacao || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'controle_vagas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const handleNextPage = () => { if (page < totalPages) setPage(p => p + 1); };
    const handlePrevPage = () => { if (page > 1) setPage(p => p - 1); };

    return (
        <div className="animate-fadeIn space-y-6 pb-10">
            {/* Header com Botões */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Controle de Vagas</h2>
                    <p className="text-slate-500">Gerencie a ocupação e vacância em toda a rede.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowConvocationModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                    >
                        <BrainCircuit size={18} />
                        <span>Convocação IA</span>
                    </button>

                    <button
                        onClick={() => setShowNewVacancyModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Nova Vaga</span>
                    </button>
                    {/* ... other buttons */}
                </div>
            </div>

            {/* Tabela de Vagas */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Servidor / Vaga</th>
                                {visibleColumns.cargo && <th className="px-4 py-3">Cargo</th>}
                                {visibleColumns.municipio && <th className="px-4 py-3">Município/DRE</th>}
                                {visibleColumns.status && <th className="px-4 py-3">Status</th>}
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vagas.length === 0 && !loading && (
                                <tr><td colSpan="10" className="p-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                            )}
                            {vagas.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-700">{v.servidor || 'VAGA EM ABERTO'}</div>
                                        <div className="text-xs text-slate-400">Mat: {v.matvin || '-'}</div>
                                    </td>
                                    {visibleColumns.cargo && <td className="px-4 py-3 text-slate-600">{v.cargo_funcao}</td>}
                                    {visibleColumns.municipio && (
                                        <td className="px-4 py-3 text-slate-600">
                                            <div>{v.municipio}</div>
                                            <div className="text-xs text-slate-400">{v.dre}</div>
                                        </td>
                                    )}
                                    {visibleColumns.status && (
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'LIVRE' || v.status === 'VAGO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {v.status}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEditVacancy(v)} className="p-2 hover:bg-slate-100 rounded text-blue-600"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteVacancy(v.id)} className="p-2 hover:bg-slate-100 rounded text-red-600"><Trash size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Footer Paginação */}
                <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                    <span>Total: {totalItems} registros</span>
                    <div className="flex gap-2">
                        <button onClick={handlePrevPage} disabled={page === 1} className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50">Ant</button>
                        <span>Pág {page} de {totalPages || 1}</span>
                        <button onClick={handleNextPage} disabled={page === totalPages} className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50">Prox</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <NewVacancyModal
                isOpen={showNewVacancyModal}
                onClose={handleCloseModal}
                onSave={handleNewVacancySaved}
                initialData={editingVacancy}
            />

            <SmartConvocationModal
                isOpen={showConvocationModal}
                onClose={() => setShowConvocationModal(false)}
                vacancies={vagas} // Passa as vagas atuais
                onSuccess={() => fetchVagas()}
            />
        </div>
    );
}