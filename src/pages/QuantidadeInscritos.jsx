import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Briefcase, MapPin, PieChart } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function QuantidadeInscritos() {
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        total: 0,
        byStatus: {},
        byCargo: {}
    });

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            // Buscando todos os dados (Para bases muito grandes, o ideal seria RPC, mas para < 10k linhas isso roda bem no front)
            // se o users tiver 1M de linhas, use supabase.rpc!
            const { data, error } = await supabase
                .from('candidatos')
                .select('status, cargo, municipio');

            if (error) throw error;

            const total = data.length;
            const byStatus = {};
            const byCargo = {};

            data.forEach(row => {
                // Status
                const s = row.status || 'Indefinido';
                byStatus[s] = (byStatus[s] || 0) + 1;

                // Cargo
                const c = row.cargo || 'Não Inf.';
                byCargo[c] = (byCargo[c] || 0) + 1;
            });

            setCounts({ total, byStatus, byCargo });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <h2 className="text-3xl font-bold text-slate-800">Estatísticas de Inscrição</h2>

            {/* Total */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
                <div className="flex items-center gap-4 mb-2 opacity-80">
                    <Users size={24} />
                    <span className="uppercase tracking-widest text-sm font-bold">Total de Inscritos</span>
                </div>
                <div className="text-6xl font-black">{counts.total.toLocaleString()}</div>
                <div className="mt-4 text-white/60 text-sm">Candidatos registrados na plataforma até o momento</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Por Status */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-blue-500" /> Distribuição por Status
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(counts.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                            const percent = ((count / counts.total) * 100).toFixed(1);
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1 text-slate-600 font-medium">
                                        <span>{status}</span>
                                        <span>{count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Por Cargo (Top 10) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Briefcase size={20} className="text-purple-500" /> Top Cargos Solicitados
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(counts.byCargo)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 8)
                            .map(([cargo, count], idx) => (
                                <div key={cargo} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={cargo}>{cargo}</span>
                                    <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-slate-200">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
