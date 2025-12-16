import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, FileSpreadsheet, Download, Loader2, Check, Edit, Trash } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import NewVacancyModal from '../components/NewVacancyModal';

export default function ControleVagas() {
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewVacancyModal, setShowNewVacancyModal] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState(null);

    // ... (UI States omitted)

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
            fetchVagas();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir vaga.');
        }
    };

    const handleNewVacancySaved = (savedData) => {
        fetchVagas();
        setEditingVacancy(null); // Limpa estado de edição
    };

    const handleCloseModal = () => {
        setShowNewVacancyModal(false);
        setEditingVacancy(null);
    };
    const [showColumnSelector, setShowColumnSelector] = useState(false);
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
    const itemsPerPage = 8; // Reduzi levemente para caber melhor na tela, se for o caso

    // Buscar dados do Supabase
    useEffect(() => {
        fetchVagas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm]);
    // Removendo 'visibleColumns' da dependência para não recarregar a API ao mudar colunas

    const fetchVagas = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('controle_vagas')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`servidor.ilike.%${searchTerm}%,matvin.ilike.%${searchTerm}%,cargo_funcao.ilike.%${searchTerm}%`);
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
        <div className="space-y-6 animate-fadeIn pb-20 relative">
            <NewVacancyModal
                isOpen={showNewVacancyModal}
                onClose={handleCloseModal}
                onSave={handleNewVacancySaved}
                initialData={editingVacancy}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Controle de Vagas</h2>
                    <p className="text-slate-500">Gerenciamento completo do quadro de vagas e lotações</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm font-medium">
                        <Download size={18} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={() => setShowNewVacancyModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium">
                        <Plus size={18} />
                        <span>Nova Vaga</span>
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, matrícula..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 whitespace-nowrap">
                        <Filter size={16} />
                        <span>Filtros</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowColumnSelector(!showColumnSelector)}
                            className={`flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-slate-100 whitespace-nowrap transition-colors ${showColumnSelector ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            <FileSpreadsheet size={16} />
                            <span>Colunas</span>
                        </button>

                        {/* Dropdown de Colunas */}
                        {showColumnSelector && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 animate-fadeIn">
                                <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Exibir Colunas</h4>
                                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                                    {Object.keys(visibleColumns).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => toggleColumn(key)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <span className="capitalize">{key.replace('_', ' ')}</span>
                                            {visibleColumns[key] && <Check size={16} className="text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-slate-500 px-2 whitespace-nowrap hidden lg:block">
                        Total: <strong>{totalItems}</strong>
                    </div>
                </div>
            </div>

            {/* Tabela com Scroll */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col relative min-h-[500px]">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.matvin && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">MatVin</th>}
                                {visibleColumns.servidor && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50 min-w-[200px]">Servidor</th>}
                                {visibleColumns.cargo && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50 min-w-[150px]">Cargo/Função</th>}
                                {visibleColumns.atividade && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Atividade</th>}
                                {visibleColumns.vacancia && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Vacância</th>}
                                {visibleColumns.status && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Status</th>}
                                {visibleColumns.lotacao && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50 min-w-[200px]">Última Lotação</th>}
                                {visibleColumns.dre && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">DRE</th>}
                                {visibleColumns.secretaria && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Secretaria</th>}
                                {visibleColumns.municipio && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Município</th>}
                                {visibleColumns.atendido && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Atendido</th>}
                                {visibleColumns.convocado && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50">Convocado</th>}
                                {visibleColumns.obs && <th className="px-6 py-4 font-bold whitespace-nowrap bg-slate-50 min-w-[200px]">Observação</th>}
                                <th className="px-6 py-4 font-bold text-right bg-slate-50 sticky right-0 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="100%" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Loader2 className="animate-spin mb-2 text-blue-500" size={32} />
                                            <p>Carregando registros...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : vagas.length === 0 ? (
                                <tr>
                                    <td colSpan="100%" className="py-20 text-center">
                                        <p className="text-slate-500">Nenhum registro encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                vagas.map((vaga) => (
                                    <tr key={vaga.id} className="hover:bg-slate-50 transition-colors group">
                                        {visibleColumns.matvin && <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{vaga.matvin}</td>}
                                        {visibleColumns.servidor && <td className="px-6 py-4 font-bold text-slate-800 uppercase text-xs">{vaga.servidor}</td>}
                                        {visibleColumns.cargo && (
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-medium text-slate-600 line-clamp-2 max-w-[200px] bg-slate-100 p-1.5 rounded" title={vaga.cargo_funcao}>
                                                    {vaga.cargo_funcao}
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.atividade && <td className="px-6 py-4 text-slate-600 text-xs">{vaga.atividade}</td>}
                                        {visibleColumns.vacancia && <td className="px-6 py-4 whitespace-nowrap text-xs">{vaga.vacancia}</td>}
                                        {visibleColumns.status && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${vaga.status === 'ATIVO'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {vaga.status}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.lotacao && <td className="px-6 py-4 text-slate-600 text-xs truncate max-w-[200px]" title={vaga.ultima_lotacao}>{vaga.ultima_lotacao}</td>}
                                        {visibleColumns.dre && <td className="px-6 py-4 text-slate-600 text-xs">{vaga.dre}</td>}
                                        {visibleColumns.secretaria && <td className="px-6 py-4 text-slate-600 text-xs">{vaga.secretaria_pertencente}</td>}
                                        {visibleColumns.municipio && <td className="px-6 py-4 text-slate-600 text-xs">{vaga.municipio}</td>}
                                        {visibleColumns.atendido && <td className="px-6 py-4 text-slate-600 text-xs truncate max-w-[150px]" title={vaga.atendido_candidato}>{vaga.atendido_candidato}</td>}
                                        {visibleColumns.convocado && (
                                            <td className="px-6 py-4 text-center">
                                                {(vaga.candidato_convocado && vaga.candidato_convocado.includes('SIM')) || (vaga.candidato_convocado && vaga.candidato_convocado.includes('CONVOCADO')) ? (
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mx-auto ring-4 ring-green-100"></div>
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-auto"></div>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.obs && <td className="px-6 py-4 text-slate-400 text-xs italic max-w-[200px] truncate" title={vaga.observacao}>{vaga.observacao}</td>}

                                        <td className="px-6 py-4 text-right bg-white group-hover:bg-slate-50 sticky right-0 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditVacancy(vaga)}
                                                    className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVacancy(vaga.id)}
                                                    className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Fixo */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between sticky bottom-0 z-20">
                    <span className="text-xs text-slate-500 hidden sm:block">
                        Mostrando <span className="font-semibold text-slate-700">{((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, totalItems)}</span> de <span className="font-semibold text-slate-700">{totalItems}</span>
                    </span>
                    <div className="flex space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            onClick={handlePrevPage}
                            disabled={page === 1}
                            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all uppercase tracking-wide">
                            Anterior
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold text-slate-600 flex items-center sm:hidden">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={page >= totalPages}
                            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all uppercase tracking-wide">
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
