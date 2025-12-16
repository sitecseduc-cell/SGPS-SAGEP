import React, { useState, useEffect } from 'react';
import {
  Search, ChevronRight, Mail, Phone, Save, Edit,
  User, MapPin, FileText, Clock, FileCheck, Eye,
  Shield, CheckCircle, X, AlertTriangle, Loader, Plus // <--- Import Plus
} from 'lucide-react';
import CandidateTable from '../components/CandidateTable';
import NewCandidateModal from '../components/NewCandidateModal'; // <--- Import Modal Novo
import { TableSkeleton, Spinner } from '../components/ui/Loading';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Inscritos() {
  // Estado local para armazenar os candidatos (para permitir adição)
  const [allCandidates, setAllCandidates] = useState([]);

  const [inputValue, setInputValue] = useState('');
  const searchTerm = useDebounce(inputValue, 500);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efeito de Busca e Paginação
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Erro ao buscar candidatos:', error);
        setLoading(false);
        return;
      }
      if (data) setAllCandidates(data);
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  // Filtra com base nos candidatos carregados
  useEffect(() => {
    const filtered = allCandidates.filter(c =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.processo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTotalCount(filtered.length);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setFilteredData(filtered.slice(start, end));
  }, [searchTerm, page, allCandidates]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Função para adicionar novo candidato (CRUD: Create)
  const handleAddCandidate = async (newCandidate) => {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .insert([
          {
            ...newCandidate,
            processo: 'Novo Processo Manual',
            localidade: 'A Definir',
            status: 'Em Análise',
            perfil: 'Manual',
            // data_inscricao removido pois usamos created_at do banco
            documentos: [],
            historico: [{ data: new Date().toLocaleDateString('pt-BR'), evento: 'Cadastro Manual', usuario: 'Admin' }]
          }
        ])
        .select();
      if (error) {
        console.error('Erro ao cadastrar candidato:', error);
        toast.error('Erro ao cadastrar: ' + error.message);
        throw error;
      }
      if (data && data.length > 0) {
        setAllCandidates([data[0], ...allCandidates]);
        toast.success('Candidato cadastrado com sucesso!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ocorreu um erro inesperado.');
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setEditData(candidate);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);

    // Simulação de delay
    const promise = new Promise((resolve) => setTimeout(resolve, 1000));

    toast.promise(promise, {
      loading: 'Salvando alterações...',
      success: () => {
        // Atualiza na lista principal também
        setAllCandidates(prev => prev.map(c => c.id === editData.id ? editData : c));
        setSelectedCandidate(editData);
        setIsSaving(false);
        setIsEditing(false);
        return `Dados de ${editData.nome} salvos!`;
      },
      error: 'Erro ao salvar.'
    });
  };

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`Mudar status para: ${newStatus}?`)) {
      const updated = { ...selectedCandidate, status: newStatus };
      setSelectedCandidate(updated);
      // Atualiza na lista principal
      setAllCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success(`Status alterado para ${newStatus}`);
    }
  };

  // --- RENDERIZAÇÃO --- //

  if (selectedCandidate) {
    return (
      <div className="animate-fadeIn space-y-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedCandidate(null)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
              <ChevronRight size={20} className="rotate-180 text-slate-600" />
            </button>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-md">
              {selectedCandidate.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCandidate.nome}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">CPF: {selectedCandidate.cpf}</span>
                <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedCandidate.status}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center shadow-lg shadow-emerald-500/20">
                  {isSaving ? <Spinner size={18} className="mr-2" /> : <Save size={18} className="mr-2" />} Salvar
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center shadow-lg shadow-blue-500/20">
                <Edit size={18} className="mr-2" /> Editar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><User size={20} className="mr-2 text-blue-600" /> Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
                  {isEditing ? <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full p-2 border border-blue-300 rounded bg-blue-50" /> : <div className="text-slate-700 font-medium">{selectedCandidate.email}</div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Telefone</label>
                  {isEditing ? <input type="text" value={editData.telefone} onChange={(e) => setEditData({ ...editData, telefone: e.target.value })} className="w-full p-2 border border-blue-300 rounded bg-blue-50" /> : <div className="text-slate-700 font-medium">{selectedCandidate.telefone}</div>}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Ações de Gestão</h3>
              <div className="flex gap-3">
                <button onClick={() => handleStatusChange('Classificado')} className="flex-1 py-3 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 flex justify-center items-center"><CheckCircle size={18} className="mr-2" /> Aprovar</button>
                <button onClick={() => handleStatusChange('Desclassificado')} className="flex-1 py-3 border border-red-200 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 flex justify-center items-center"><X size={18} className="mr-2" /> Reprovar</button>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Documentos</h3>
              <ul className="space-y-2">
                {selectedCandidate.documentos?.length > 0 ? selectedCandidate.documentos.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 cursor-pointer">
                    <span className="flex items-center"><FileCheck size={16} className="mr-2 text-slate-400" /> {doc}</span>
                    <Eye size={16} className="text-slate-300" />
                  </li>
                )) : <p className="text-sm text-slate-400 italic">Nenhum documento anexado.</p>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visão da Lista
  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)]">

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Inscritos</h2>
            <p className="text-slate-500 text-sm mt-1">
              Gerenciando <strong className="text-slate-800">{totalCount}</strong> candidatos
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                {loading && inputValue !== searchTerm ? <Loader size={20} className="animate-spin text-blue-500" /> : <Search size={20} />}
              </div>
              <input
                type="text"
                placeholder="Buscar por Nome, CPF ou Processo..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            {/* BOTÃO ADICIONAR (NOVO) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus size={20} className="mr-2 hidden sm:block" /> <span className="whitespace-nowrap">Novo Candidato</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <TableSkeleton rows={pageSize} />
          ) : (
            <CandidateTable
              candidates={filteredData}
              onSelect={handleSelectCandidate}
              total={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* RENDERIZA O MODAL AQUI */}
      <NewCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCandidate}
      />
    </div>
  );
}