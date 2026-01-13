import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import {
    FileSpreadsheet, FileText, Download, Printer,
    PieChart as PieIcon, Users, Briefcase, Calendar, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import ImmersiveLoader from '../components/ImmersiveLoader';

export default function Relatorios() {
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loadingCharts, setLoadingCharts] = useState(true);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        setLoadingCharts(true);
        try {
            // Buscando dados reais para os gráficos
            const { data, error } = await supabase
                .from('candidatos')
                .select('cargo, status');

            if (error) throw error;

            if (!data || data.length === 0) {
                setChartData([]);
                setStatusData([]);
                return;
            }

            // 1. Processar Cargos (Top 5)
            const cargoCount = {};
            data.forEach(item => {
                const cargo = item.cargo || 'Não Informado';
                cargoCount[cargo] = (cargoCount[cargo] || 0) + 1;
            });

            // Converter para array e ordenar
            const sortedCargos = Object.entries(cargoCount)
                .map(([name, inscritos]) => ({ name, inscritos }))
                .sort((a, b) => b.inscritos - a.inscritos)
                .slice(0, 5); // Top 5

            setChartData(sortedCargos);

            // 2. Processar Status
            const statusCount = {};
            data.forEach(item => {
                const status = item.status || 'Indefinido';
                statusCount[status] = (statusCount[status] || 0) + 1;
            });

            const COLORS = {
                'Aprovado': '#10B981',      // Emerald
                'Homologado': '#059669',    // Dark Emerald
                'Classificado': '#3B82F6',  // Blue
                'Em Análise': '#F59E0B',    // Amber
                'Com Pendência': '#F97316', // Orange
                'Desclassificado': '#EF4444', // Red
                'Indefinido': '#94A3B8'     // Slate
            };

            const processedStatus = Object.entries(statusCount).map(([name, value]) => ({
                name,
                value,
                color: COLORS[name] || '#64748B' // Fallback color
            }));

            setStatusData(processedStatus);

        } catch (error) {
            console.error('Erro ao carregar dados dos gráficos:', error);
            // toast.error('Erro ao atualizar gráficos.'); // Silencioso para não spammar
        } finally {
            setLoadingCharts(false);
        }
    };

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
            {loading && <ImmersiveLoader />}
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

            {/* --- DASHBOARD GRÁFICO (REAL-TIME) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Gráfico de Barras */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-4">Inscritos por Vaga (Top 5)</h3>
                    <div className="flex-1 w-full min-h-[250px]">
                        {loadingCharts ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Sem dados para exibir
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="inscritos" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#64748B', fontSize: 12 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Gráfico de Pizza */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-4">Visão Geral dos Candidatos</h3>
                    <div className="flex-1 w-full flex justify-center min-h-[250px]">
                        {loadingCharts ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : statusData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Sem dados para exibir
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
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
                        <div className="flex gap-2">
                            <button
                                disabled={loading}
                                onClick={() => exportCSV('candidatos', 'candidatos_full')}
                                className="flex-1 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <Download size={16} /> CSV
                            </button>
                        </div>
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

            {/* Grid de Relatórios Gerenciais */}
            <div>
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <PieIcon size={20} className="text-orange-500" /> Relatórios de Auditoria & Segurança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
                <p>Relatório gerado pelo sistema CPS 2.0 em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
        </div>
    );
}
