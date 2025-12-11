import React, { useState } from 'react';
import './index.css'; 
import { 
  LayoutDashboard, Users, FileSpreadsheet, 
  GitCommit, AlertTriangle, CheckCircle, Clock, 
  Search, Filter, MoreHorizontal, User, FileText,
  Map, Bell, LogOut, Upload, Zap,
  ChevronRight, Mail, Phone, Plus, Trash2, Edit,
  Settings, BookOpen, Shield, Layers, Calendar,
  TrendingUp, Activity, MapPin
} from 'lucide-react';

// --- MOCK DATA (Simulação do Banco de Dados) ---

// Dados para o Dashboard
const DASHBOARD_DATA = {
  kpis: {
    processos_ativos: 14,
    candidatos_total: 28450,
    vagas_preenchidas: "85%",
    alertas_criticos: 3
  },
  heatmap_dres: [
    { nome: 'DRE Belém', candidatos: 12500, status: 'crítico' },
    { nome: 'DRE Ananindeua', candidatos: 8200, status: 'alto' },
    { nome: 'DRE Castanhal', candidatos: 4500, status: 'medio' },
    { nome: 'DRE Marabá', candidatos: 3100, status: 'medio' },
    { nome: 'DRE Santarém', candidatos: 2800, status: 'baixo' },
    { nome: 'DRE Altamira', candidatos: 1200, status: 'baixo' },
    { nome: 'DRE Abaetetuba', candidatos: 4100, status: 'medio' },
    { nome: 'DRE Capanema', candidatos: 900, status: 'baixo' },
  ],
  analises_criticas: [
    { id: 1, processo: 'PSS 07/2025', problema: 'Atraso na Análise Documental', setor: 'Comissão Avaliadora', tempo: '2 dias' },
    { id: 2, processo: 'PSS Estagiários', problema: 'Alto índice de recursos', setor: 'Jurídico', tempo: '5 horas' },
    { id: 3, processo: 'PSS Vigias', problema: 'Falta de candidatos (Zona Rural)', setor: 'DRE Marabá', tempo: '1 dia' },
  ]
};

// Dados dos Processos (Mantidos da versão anterior)
const PROCESSOS_MOCK = [
  { id: 1, nome: 'PSS 07/2025 - PROFESSOR NIVEL SUPERIOR', periodo: '17/11/2025 - 14/12/2025', fase_atual: 'Análise Documental', progresso: 45, permitir_alteracao: false },
  { id: 2, nome: 'PSS Estagiários 06/2025', periodo: '08/09/2025 - 10/09/2025', fase_atual: 'Homologado', progresso: 100, permitir_alteracao: false },
  { id: 3, nome: 'PSS Estagiários-Bolsistas - ARCON 01/2025', periodo: '18/09/2025 - 23/09/2025', fase_atual: 'Recursos', progresso: 80, permitir_alteracao: false },
  { id: 4, nome: 'PSS ESTAGIÁRIOS - 05/2025', periodo: '11/08/2025 - 17/08/2025', fase_atual: 'Encerrado', progresso: 100, permitir_alteracao: false },
  { id: 5, nome: 'PSS SIMPLIFICADO 04/2025 - SECTET', periodo: '28/05/2025 - 08/06/2025', fase_atual: 'Entrevistas', progresso: 60, permitir_alteracao: false }
];

// --- COMPONENTES VISUAIS ---

// Card de Estatística (KPI)
const StatCard = ({ title, value, icon: Icon, color, subtext, alert }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border ${alert ? 'border-red-200 bg-red-50' : 'border-slate-100'} hover:shadow-md transition-all`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className={`text-3xl font-extrabold ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon size={24} className={alert ? 'text-red-600' : 'text-slate-700'} />
      </div>
    </div>
    {subtext && (
      <div className="mt-3 flex items-center text-xs font-medium text-slate-500">
        {alert ? <AlertTriangle size={12} className="mr-1 text-red-500"/> : <TrendingUp size={12} className="mr-1 text-emerald-500"/>}
        {subtext}
      </div>
    )}
  </div>
);

// Mapa de Calor das DREs (Regional)
const RegionalHeatmap = ({ dres }) => {
  const getColor = (status) => {
    switch(status) {
      case 'crítico': return 'bg-red-500 text-white';
      case 'alto': return 'bg-orange-400 text-white';
      case 'medio': return 'bg-blue-400 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <Map size={20} className="mr-2 text-blue-600"/>
          Mapa de Calor (DREs)
        </h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Concentração de Inscritos</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {dres.map((dre, idx) => (
          <div key={idx} className={`p-4 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group transition-all hover:scale-105 cursor-default ${getColor(dre.status)}`}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20">
              <MapPin size={40} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide opacity-90">{dre.nome}</span>
            <span className="text-2xl font-bold">{dre.candidatos.toLocaleString()}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center space-x-4 text-xs text-slate-500">
        <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Crítico (&gt;10k)</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>Alto (&gt;5k)</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>Médio</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 rounded-full mr-2"></div>Baixo</div>
      </div>
    </div>
  );
};

// Lista de Atenção Crítica
const CriticalAlerts = ({ alerts }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
    <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
      <Activity size={20} className="mr-2 text-red-600"/>
      Atenção Necessária
    </h3>
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">{alert.processo}</h4>
            <p className="text-xs text-red-600 font-medium mt-1">{alert.problema}</p>
            <div className="flex items-center mt-2 text-[10px] text-slate-500 uppercase tracking-wide">
              <span className="mr-3 flex items-center"><Shield size={10} className="mr-1"/> {alert.setor}</span>
              <span className="flex items-center"><Clock size={10} className="mr-1"/> {alert.tempo} atrás</span>
            </div>
          </div>
          <button className="text-xs bg-white text-slate-600 border border-slate-200 px-3 py-1 rounded hover:bg-slate-50 transition-colors">
            Verificar
          </button>
        </div>
      ))}
    </div>
  </div>
);

// --- PÁGINAS ---

const DashboardView = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* KPIs Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Processos Ativos" 
          value={DASHBOARD_DATA.kpis.processos_ativos} 
          icon={Layers} 
          color="bg-blue-100 text-blue-600"
          subtext="3 em fase de convocação"
        />
        <StatCard 
          title="Total de Candidatos" 
          value={DASHBOARD_DATA.kpis.candidatos_total.toLocaleString()} 
          icon={Users} 
          color="bg-indigo-100 text-indigo-600"
          subtext="+12% em relação a 2024"
        />
        <StatCard 
          title="Vagas Preenchidas" 
          value={DASHBOARD_DATA.kpis.vagas_preenchidas} 
          icon={CheckCircle} 
          color="bg-emerald-100 text-emerald-600"
          subtext="Meta anual atingida"
        />
        <StatCard 
          title="Pontos de Atenção" 
          value={DASHBOARD_DATA.kpis.alertas_criticos} 
          icon={AlertTriangle} 
          color="bg-red-100 text-red-600" 
          alert={true}
          subtext="Ação imediata requerida"
        />
      </div>

      {/* Meio: Mapa e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RegionalHeatmap dres={DASHBOARD_DATA.heatmap_dres} />
        </div>
        <div className="lg:col-span-1">
          <CriticalAlerts alerts={DASHBOARD_DATA.analises_criticas} />
        </div>
      </div>

      {/* Base: Acesso Rápido a Processos Recentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Processos Recentes em Andamento</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline flex items-center">
            Ver todos <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROCESSOS_MOCK.slice(0,3).map(proc => (
            <div key={proc.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">
                  {proc.fase_atual}
                </span>
                <MoreHorizontal size={16} className="text-slate-400 group-hover:text-blue-500"/>
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-2 line-clamp-2">{proc.nome}</h4>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${proc.progresso}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">{proc.progresso}% Concluído</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProcessManagementView = () => {
  // ... Código da tabela de processos (Idêntico ao anterior)
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento dos Processos Seletivos</h2>
          <p className="text-slate-500 text-sm mt-1">Administre editais, prazos e fases de seleção.</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105">
          <Plus size={20} />
          <span>Cadastrar Processo Seletivo</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Nome do Processo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fase / Progresso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Permitir Alteração</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PROCESSOS_MOCK.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">{proc.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 font-medium whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-slate-400"/>
                      {proc.periodo}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600">{proc.fase_atual}</span>
                        <span className="text-slate-400">{proc.progresso}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${proc.progresso}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proc.permitir_alteracao ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                      {proc.permitir_alteracao ? 'SIM' : 'NÃO'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Fases">
                        <Layers size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar Processo">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Padrão: Dashboard

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 mb-1 text-sm ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 font-medium' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="truncate">{label}</span>
    </button>
  );

  const SidebarGroup = ({ title, children }) => (
    <div className="mb-6">
      <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 opacity-80">{title}</p>
      {children}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden md:flex shadow-2xl z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">P</div>
            <div className="leading-tight">
              <span className="text-lg font-bold block">SAGEP 2.0</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Gov. Pará</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <SidebarGroup title="Estratégico">
            <SidebarItem icon={LayoutDashboard} label="Bem-Vindo (Dashboard)" id="dashboard" />
            <SidebarItem icon={Layers} label="Gestão de Processos" id="processos" />
          </SidebarGroup>

          <SidebarGroup title="Operacional">
            <SidebarItem icon={Users} label="Gestão de Inscritos" id="inscritos" />
            <SidebarItem icon={Search} label="Pesquisar Candidatos" id="pesquisa" />
            <SidebarItem icon={User} label="Visualizar Candidato" id="visualizar" />
          </SidebarGroup>

          <SidebarGroup title="Análise & Avaliação">
            <SidebarItem icon={FileText} label="Análise de Documentos" id="docs" />
            <SidebarItem icon={BookOpen} label="Análise de Plano" id="plano" />
            <SidebarItem icon={CheckCircle} label="Pré Avaliação" id="pre" />
          </SidebarGroup>

          <SidebarGroup title="Administrativo">
            <SidebarItem icon={Map} label="Vincular Localidades" id="local" />
            <SidebarItem icon={AlertTriangle} label="Recursos" id="recursos" />
            <SidebarItem icon={FileSpreadsheet} label="Relatórios" id="relatorios" />
            <SidebarItem icon={Shield} label="Segurança" id="seguranca" />
          </SidebarGroup>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center justify-center space-x-2 text-red-400 hover:text-white hover:bg-red-500/20 transition-colors w-full px-4 py-2 rounded-lg text-sm font-medium">
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Visão Estratégica' : 
               activeTab === 'processos' ? 'Processos Seletivos' : 'Painel Administrativo'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <span className="mr-2 hidden sm:inline">Bem-vindo,</span>
              <strong className="text-slate-800 uppercase">LUAN GIULIANO</strong>
            </div>
            
            <button className="p-2 text-slate-400 hover:text-blue-600 relative transition-colors rounded-full hover:bg-slate-50">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {activeTab === 'dashboard' ? (
            <DashboardView />
          ) : activeTab === 'processos' ? (
            <ProcessManagementView />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fadeIn">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Settings size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-600">Módulo em Desenvolvimento</h3>
              <p className="text-sm">Acesse "Bem-Vindo" ou "Gestão de Processos".</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}