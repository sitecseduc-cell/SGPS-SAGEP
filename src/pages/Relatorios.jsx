import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import {
    FileSpreadsheet, FileText, Download, Printer,
    PieChart, Users, Briefcase, Calendar
} from 'lucide-react';

export default function Relatorios() {
    const [loading, setLoading] = useState(false);

    // Função genérica para exportar CSV
    const exportCSV = async (table, filename, columns = '*') => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from(table)
                .select(columns)
                .csv();

            if (error) throw error;

            const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Relatório ${filename} exportado com sucesso!`);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar relatório.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Central de Relatórios</h2>
                    <p className="text-slate-500">Exporte dados operacionais e gerenciais para análise externa.</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium print:hidden"
                >
                    <Printer size={18} /> Imprimir / PDF
                </button>
            </div>

            {/* Grid de Relatórios Operacionais */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-blue-500" /> Relatórios Operacionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Relatório 1: Candidatos Completo */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Base de Candidatos</h4>
                                <p className="text-xs text-slate-500">Dados completos de inscritos</p>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => exportCSV('candidatos', 'candidatos_full')}
                            className="w-full py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Download size={16} /> Baixar CSV
                        </button>
                    </div>

                    {/* Relatório 2: Quadro de Vagas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Controle de Vagas</h4>
                                <p className="text-xs text-slate-500">Ocupação e vacância atual</p>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => exportCSV('controle_vagas', 'controle_vagas')}
                            className="w-full py-2 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Download size={16} /> Baixar CSV
                        </button>
                    </div>

                    {/* Relatório 3: Processos Seletivos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Processos Seletivos</h4>
                                <p className="text-xs text-slate-500">Status de editais e cronogramas</p>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => exportCSV('processos', 'processos_seletivos')}
                            className="w-full py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Download size={16} /> Baixar CSV
                        </button>
                    </div>

                </div>
            </div>

            {/* Grid de Relatórios Gerenciais (Mock Layout para expansão futura) */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-orange-500" /> Relatórios de Auditoria & Segurança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 opacity-90">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Logs de Auditoria</h4>
                                <p className="text-xs text-slate-500">Histórico de alterações (Audit Trail)</p>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            onClick={() => exportCSV('audit_logs', 'auditoria_sistema')}
                            className="w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Download size={16} /> Exportar Logs
                        </button>
                    </div>

                </div>
            </div>

            {/* Nota de rodapé para impressão */}
            <div className="hidden print:block mt-20 text-center text-sm text-slate-400">
                <p>Relatório gerado pelo sistema SAGEP 2.0 em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
        </div>
    );
}
