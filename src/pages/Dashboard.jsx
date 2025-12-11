import React, { useState, useEffect } from 'react';
import { 
  Users, GitCommit, AlertTriangle, CheckCircle, 
  Map, BarChart3 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { CardSkeleton, Skeleton } from '../components/ui/Loading'; // Importando novos componentes
import { DASHBOARD_DATA } from '../data/mockData';

// Componentes internos (Funnel e HeatMap) adaptados para receber 'loading'
const FunnelChart = ({ loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><BarChart3 size={18} className="mr-2 text-slate-500"/> Funil de Seleção Global</h3>
    <div className="space-y-4">
      {loading 
        ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-full" />)
        : [
            { label: 'Inscritos', val: '100%', count: 28450, color: 'bg-blue-600' },
            { label: 'Habilitados', val: '80%', count: 22760, color: 'bg-blue-500' },
            { label: 'Títulos Validados', val: '45%', count: 12800, color: 'bg-indigo-500' },
            { label: 'Classificados', val: '20%', count: 5690, color: 'bg-purple-500' },
            { label: 'Convocados', val: '5%', count: 1422, color: 'bg-emerald-500' }
          ].map((step, idx) => (
            <div key={idx} className="relative group cursor-default">
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-600">
                <span>{step.label}</span>
                <span>{step.count.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className={`h-full ${step.color} rounded-full transition-all duration-1000 group-hover:opacity-80`} style={{ width: step.val }}></div>
              </div>
            </div>
          ))
      }
    </div>
  </div>
);

const HeatMap = ({ loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><Map size={18} className="mr-2 text-slate-500"/> Mapa de Calor (Demandas Críticas)</h3>
    <div className="grid grid-cols-2 gap-4">
      {loading 
        ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        : (
          /* Mock manual para simplificar, mas idealmente viria de props */
          <>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-red-600 mb-1">Belém</span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Demanda Crítica</span>
              <span className="text-[10px] text-red-300 mt-1">12.500 Inscritos</span>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-orange-600 mb-1">Ananindeua</span>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Demanda Alta</span>
              <span className="text-[10px] text-orange-300 mt-1">8.200 Inscritos</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-blue-600 mb-1">Marabá</span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Média Demanda</span>
              <span className="text-[10px] text-blue-300 mt-1">3.100 Inscritos</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-slate-600 mb-1">Santarém</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Estável</span>
              <span className="text-[10px] text-slate-300 mt-1">2.800 Inscritos</span>
            </div>
          </>
        )
      }
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  // Simulando carregamento de dados (2 segundos)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Processos Ativos" value={DASHBOARD_DATA.kpis.processos_ativos} icon={GitCommit} color="bg-blue-100 text-blue-600" />
            <StatCard title="Candidatos Totais" value={DASHBOARD_DATA.kpis.candidatos_total.toLocaleString()} icon={Users} color="bg-purple-100 text-purple-600" subtext="+12% essa semana" />
            <StatCard title="Vagas Preenchidas" value={DASHBOARD_DATA.kpis.vagas_preenchidas} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
            <StatCard title="Atrasos Críticos" value={DASHBOARD_DATA.kpis.delayedProcesses} icon={AlertTriangle} color="bg-red-100 text-red-600" alert={true} subtext="Requer atenção imediata" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96">
        <div className="lg:col-span-1 h-full">
          <FunnelChart loading={loading} />
        </div>
        <div className="lg:col-span-2 h-full">
          <HeatMap loading={loading} />
        </div>
      </div>
    </div>
  );
}