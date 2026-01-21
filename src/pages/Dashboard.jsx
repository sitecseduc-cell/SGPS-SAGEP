import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import {
  Users,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  BookOpen,
  Map,
  TrendingUp,
  Activity
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FunnelChart from '../components/FunnelChart';
import CardSkeleton from '../components/CardSkeleton';
import HeroSkeleton from '../components/HeroSkeleton';
import ChartSkeleton from '../components/ChartSkeleton';
import OnboardingTour from '../components/OnboardingTour';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    candidatos: 0,
    processos: 0,
    vagasPreenchidas: 0,
    atrasos: 0
  });
  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_dashboard_stats');

        if (error) throw error;

        setStats({
          candidatos: data.total_candidatos || 0,
          processos: data.total_processos || 0,
          vagasPreenchidas: data.vagas_preenchidas || 0,
          atrasos: 0
        });

        setFunnelData([
          { label: 'Inscritos Totais', count: data.total_candidatos, color: '#6366f1' }, // Indigo 500
          { label: 'Em Análise', count: data.em_analise, color: '#8b5cf6' }, // Violet 500
          { label: 'Classificados', count: data.classificados, color: '#d946ef' }, // Fuchsia 500
          { label: 'Convocados', count: data.convocados, color: '#10b981' } // Emerald 500
        ]);

      } catch (e) {
        console.warn('Backend unavailable or RPC missing. Using mock data for Dashboard.');
        // Mock Data for "Visão Geral"
        setStats({
          candidatos: 1250,
          processos: 8,
          vagasPreenchidas: 342,
          atrasos: 3
        });

        setFunnelData([
          { label: 'Inscritos Totais', count: 1250, color: '#6366f1' },
          { label: 'Em Análise', count: 850, color: '#8b5cf6' },
          { label: 'Classificados', count: 500, color: '#d946ef' },
          { label: 'Convocados', count: 342, color: '#10b981' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Removed full screen loader to allow skeleton UI
  // if (loading) return <ImmersiveLoader />;

  return (
    <div className="space-y-8 animate-fadeIn pb-10">

      {/* Hero Welcome Section */}
      {/* Hero Welcome Section */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

          {/* Abstract decoration */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistema Operacional
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                Bem-vindo à <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">CPS</span>
              </h1>
              <p className="text-indigo-100/80 text-lg max-w-xl leading-relaxed font-light">
                Painel de gestão inteligente para processos seletivos.
                Acompanhe métricas, gerencie editais e controle convocações em um único lugar.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl text-white">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase font-bold">Status do Servidor</p>
                  <p className="text-white font-bold">Online & Estável</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div id="kpi-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Processos Ativos"
              value={stats.processos}
              icon={GitCommit}
              color="text-indigo-600"
            />
            <StatCard
              title="Candidatos na Base"
              value={stats.candidatos.toLocaleString()}
              icon={Users}
              color="text-violet-600"
              subtext="Total acumulado"
            />
            <StatCard
              title="Vagas Preenchidas"
              value={stats.vagasPreenchidas}
              icon={CheckCircle}
              color="text-emerald-600"
              subtext="Neste ano"
            />
            <StatCard
              title="Alertas"
              value={stats.atrasos}
              icon={AlertTriangle}
              color="text-red-600"
              alert={stats.atrasos > 0}
              subtext="Ações pendentes"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Chart Section */}
        {/* Funnel Chart Section */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="lg:col-span-2 glass-card p-8 border border-white/40 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-500" />
                  Funil de Seleção
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral do fluxo de candidatos</p>
              </div>
              <button className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                Ver Detalhes
              </button>
            </div>

            <div className="h-[300px] w-full flex items-center justify-center">
              <FunnelChart loading={loading} data={funnelData} />
            </div>
          </div>
        )}

        {/* Quick Actions Panel */}
        <div id="quick-actions" className="lg:col-span-1">
          <div className="glass-card p-8 h-full border border-white/40 dark:border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Acesso Rápido</h3>

            <div className="space-y-4 flex-1">
              <QuickActionLink
                to="/processos"
                icon={Plus}
                label="Novo Processo"
                color="bg-indigo-500"
                desc="Criar novo edital"
              />
              <QuickActionLink
                to="/planejamento"
                icon={BookOpen}
                label="Configurar Vagas"
                color="bg-violet-500"
                desc="Mapa de vagas"
              />
              <QuickActionLink
                to="/lotacao"
                icon={Map}
                label="Mapa de Lotação"
                color="bg-emerald-500"
                desc="Distribuir servidores"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs text-slate-400 text-center">
                Última atualização: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <OnboardingTour />
    </div>
  );
}

// Helper Component for Quick Actions
const QuickActionLink = ({ to, icon: Icon, label, color, desc }) => (
  <Link
    to={to}
    className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-white/5 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className="flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <span className="font-bold text-slate-700 dark:text-slate-200 block">{label}</span>
        <span className="text-xs text-slate-400 font-medium">{desc}</span>
      </div>
    </div>
    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
      <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
    </div>
  </Link>
);