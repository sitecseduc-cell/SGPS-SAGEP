import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldAlert, Search, Database, Clock, ArrowRight, User } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Loading';

export default function Auditoria() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTable, setFilterTable] = useState('todas');

    useEffect(() => {
        fetchLogs();
    }, [filterTable]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (filterTable !== 'todas') {
                query = query.eq('table_name', filterTable);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            // Em produção, usar toast.error aqui
        } finally {
            setLoading(false);
        }
    };

    // Função auxiliar para renderizar mudança resumida
    const renderChangeSummary = (op, oldData, newData) => {
        if (op === 'INSERT') return <span className="text-green-600">Novo registro criado</span>;
        if (op === 'DELETE') return <span className="text-red-600">Registro removido</span>;

        // Para UPDATE, tenta achar o campo que mudou (comparação simples)
        if (!oldData || !newData) return <span className="text-blue-600">Atualização realizada</span>;

        const changes = [];
        Object.keys(newData).forEach(key => {
            if (JSON.stringify(newData[key]) !== JSON.stringify(oldData[key])) {
                changes.push(key);
            }
        });

        if (changes.length === 0) return <span className="text-slate-400">Sem alterações visíveis</span>;

        return (
            <div className="text-xs">
                <span className="font-semibold text-slate-700">Alterado: </span>
                {changes.slice(0, 3).join(', ')}
                {changes.length > 3 && '...'}
            </div>
        );
    };

    const getOperationBadge = (op) => {
        switch (op) {
            case 'INSERT': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">ADIÇÃO</span>;
            case 'UPDATE': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">EDIÇÃO</span>;
            case 'DELETE': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">REMOÇÃO</span>;
            default: return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">AÇÃO</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="text-blue-600" /> Auditoria do Sistema
                    </h2>
                    <p className="text-slate-500">Registro completo de atividades e alterações de dados.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 border border-slate-200 rounded-lg shadow-sm">
                    <Database size={16} className="ml-2 text-slate-400" />
                    <select
                        value={filterTable}
                        onChange={(e) => setFilterTable(e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-600 focus:ring-0 cursor-pointer py-1"
                    >
                        <option value="todas">Todas as Tabelas</option>
                        <option value="candidatos">Candidatos</option>
                        <option value="controle_vagas">Controle de Vagas</option>
                        <option value="processos">Processos</option>
                    </select>
                </div>
            </div>

            {/* Tabela de Logs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Data/Hora</th>
                                <th className="px-6 py-4 font-bold">Usuário</th>
                                <th className="px-6 py-4 font-bold">Ação</th>
                                <th className="px-6 py-4 font-bold">Tabela</th>
                                <th className="px-6 py-4 font-bold">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <TableSkeleton rows={5} />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ShieldAlert size={32} className="opacity-20" />
                                            <p>Nenhum registro de auditoria encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-400" />
                                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs border border-slate-200">
                                                    <User size={12} className="text-slate-400" />
                                                </div>
                                                <span className="truncate max-w-[150px]" title={log.user_id}>
                                                    {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Sistema'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getOperationBadge(log.operation)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500">
                                            {log.table_name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderChangeSummary(log.operation, log.old_data, log.new_data)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700 flex items-start gap-3">
                <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                <div>
                    <h4 className="font-bold mb-1">Nota de Segurança</h4>
                    <p>Esta auditoria é gerada automaticamente pelo banco de dados. Ações realizadas diretamente via SQL ou manutenção de sistema também são registradas aqui para integridade total.</p>
                </div>
            </div>
        </div>
    );
}
