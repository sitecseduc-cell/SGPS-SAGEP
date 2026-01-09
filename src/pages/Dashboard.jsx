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
  Map
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FunnelChart from '../components/FunnelChart';
import CardSkeleton from '../components/CardSkeleton';
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
    // --- DB DIAGNOSTIC CHECK ---
    const checkDbHealth = async () => {
      try {
        console.log("Checking DB health...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Not logged in

        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error) {
          console.error("DB Check Failed:", error);
          toast.error(`Erro de Banco de Dados: ${error.message || error.code || 'Desconhecido'}. (Tabela profiles faltando ou RLS bloqueando)`);
        } else if (data) {
          console.log("DB Check Success:", data);
          if (data.role === 'admin') {
            toast.success(`Sistema Conectado. Perfil: ADMIN`);
          } else {
            toast.info(`Sistema Conectado. Perfil: ${data.role || 'Sem cargo'}`);
          }
        } else {
          toast.warning("Usuário sem perfil na tabela 'profiles'. Rode o SQL de correção.");
        }
      } catch (err) {
        console.error("Health check crash:", err);
      }
    };
    checkDbHealth();

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Tenta RPC, se falhar usa base manual
        const { data: kpisData, error: kpiError } = await supabase.rpc('get_dashboard_kpis');

        let finalCandidatos = 0;
        let finalProcessos = 0;

        if (!kpiError) {
          finalCandidatos = kpisData.candidatos || 0;
          finalProcessos = kpisData.processos || 0;
          setStats({
            candidatos: kpisData.candidatos,
            processos: kpisData.processos,
            vagasPreenchidas: kpisData.vagas,
            atrasos: 0
          });
        } else {
          // Fallback simples
          const { count: c } = await supabase.from('candidatos').select('*', { count: 'exact', head: true });
          const { count: p } = await supabase.from('processos').select('*', { count: 'exact', head: true });
          finalCandidatos = c || 0;
          finalProcessos = p || 0;
          setStats({ candidatos: c || 0, processos: p || 0, vagasPreenchidas: 0, atrasos: 0 });
        }

        // Funnel Mockado melhorado com dados reais básicos se tiver
        setFunnelData([
          { label: 'Inscritos Totais', count: finalCandidatos, color: 'bg-blue-600' },
          { label: 'Em Análise', count: Math.floor(finalCandidatos * 0.6), color: 'bg-blue-500' }, // Estimativa se não tiver dado real
          { label: 'Classificados', count: Math.floor(finalCandidatos * 0.3), color: 'bg-purple-500' },
          { label: 'Convocados', count: Math.floor(finalCandidatos * 0.1), color: 'bg-emerald-500' }
        ]);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-10">

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo à SAGEP</h1>
          <p className="text-blue-100 max-w-2xl text-lg">
            Seu painel de controle central para gestão de processos seletivos públicos.
            Acompanhe indicadores em tempo real e inicie novas ações.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
      </div>

      {/* KPIs Grid */}
      <div id="kpi-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Processos Ativos" value={stats.processos} icon={GitCommit} color="bg-blue-100 text-blue-600" />
            <StatCard title="Candidatos na Base" value={stats.candidatos.toLocaleString()} icon={Users} color="bg-purple-100 text-purple-600" subtext="Total acumulado" />
            <StatCard title="Vagas Preenchidas" value={stats.vagasPreenchidas} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" subtext="No ano corrente" />
            <StatCard title="Alertas do Sistema" value={stats.atrasos} icon={AlertTriangle} color="bg-red-100 text-red-600" alert={stats.atrasos > 0} subtext="Requer atenção" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2 h-[400px]">
          <FunnelChart loading={loading} data={funnelData} />
        </div>

        {/* Quick Actions / Shortcuts */}
        <div id="quick-actions" className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Acesso Rápido</h3>

            <div className="space-y-3">
              <Link to="/processos" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Plus size={18} /></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Novo Processo Seletivo</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </Link>

              <Link to="/planejamento" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><BookOpen size={18} /></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Configurar Vagas</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </Link>

              <Link to="/lotacao" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Map size={18} /></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Mapa de Lotação</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <OnboardingTour />
    </div>
  );
}