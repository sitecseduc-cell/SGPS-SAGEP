import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, X, User, Database, ArrowRight } from 'lucide-react';

const AuditDetailsModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const formatValue = (val) => {
        if (val === null || val === undefined) return <span className="text-slate-400 italic">null</span>;
        if (typeof val === 'object') return JSON.stringify(val);
        if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
        return String(val);
    };

    // Identificar mudanças
    const getChanges = () => {
        if (log.operation === 'INSERT') {
            return Object.keys(log.new_data || {}).map(key => ({
                key,
                oldVal: null,
                newVal: log.new_data[key],
                type: 'add'
            }));
        }
        if (log.operation === 'DELETE') {
            return Object.keys(log.old_data || {}).map(key => ({
                key,
                oldVal: log.old_data[key],
                newVal: null,
                type: 'remove'
            }));
        }
        // UPDATE
        const keys = new Set([...Object.keys(log.old_data || {}), ...Object.keys(log.new_data || {})]);
        const changes = [];
        keys.forEach(key => {
            const oldV = log.old_data?.[key];
            const newV = log.new_data?.[key];
            if (JSON.stringify(oldV) !== JSON.stringify(newV)) {
                changes.push({ key, oldVal: oldV, newVal: newV, type: 'change' });
            }
        });
        return changes;
    };

    const changes = getChanges();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn border border-slate-200 dark:border-slate-700">
                {/* Header do Modal */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.operation === 'INSERT' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            log.operation === 'DELETE' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Detalhes da Auditoria</h3>
                            <p className="text-xs text-slate-500 font-mono">{log.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo Scrollável */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-white dark:bg-slate-800">

                    {/* Metadados */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Tabela Afetada</span>
                            <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{log.table_name}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Data e Hora</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">{format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700 col-span-2">
                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Responsável (User ID)</span>
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-slate-400" />
                                <span className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">{log.user_id || 'Sistema / Automático'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Diff Viewer */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <Database size={16} className="text-slate-400" />
                            Alterações Realizadas
                        </h4>

                        {changes.length === 0 ? (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 text-slate-500 text-center rounded-lg italic text-sm">
                                Nenhuma alteração de dados detectada (Metadados ou log vazio).
                            </div>
                        ) : (
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-sm shadow-sm">
                                <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 py-2 px-4 font-bold text-slate-500 text-xs uppercase tracking-wide">
                                    <div className="col-span-3">Campo</div>
                                    <div className="col-span-4">Valor Anterior</div>
                                    <div className="col-span-1 text-center"></div>
                                    <div className="col-span-4">Novo Valor</div>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                    {changes.map((change, idx) => (
                                        <div key={idx} className="grid grid-cols-12 py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors items-center">
                                            <div className="col-span-3 font-mono text-slate-600 dark:text-slate-300 text-xs font-semibold break-words pr-2">
                                                {change.key}
                                            </div>

                                            <div className={`col-span-4 break-words p-1.5 rounded ${change.type === 'add' ? 'text-slate-300 dark:text-slate-600' : 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border border-red-100 dark:border-red-900/30'}`}>
                                                {change.type === 'add' ? <span className="opacity-30">-</span> : formatValue(change.oldVal)}
                                            </div>

                                            <div className="col-span-1 flex justify-center text-slate-300 dark:text-slate-600">
                                                <ArrowRight size={14} />
                                            </div>

                                            <div className={`col-span-4 break-words p-1.5 rounded ${change.type === 'remove' ? 'text-slate-300 dark:text-slate-600' : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30'}`}>
                                                {change.type === 'remove' ? <span className="opacity-30">-</span> : formatValue(change.newVal)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors shadow-sm">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditDetailsModal;
