import React, { useState, useEffect } from 'react';
import { Plus, Edit, FileText, Calendar, Layers, Trash2 } from 'lucide-react';
import { fetchProcessos, createProcesso, updateProcesso, deleteProcesso } from '../services/processos';
import NewProcessModal from '../components/NewProcessModal';
import { TableSkeleton } from '../components/ui/Loading';
import { toast } from 'sonner';

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null); // Estado para saber quem estamos editando

  useEffect(() => {
    loadProcessos();
  }, []);

  const loadProcessos = async () => {
    setLoading(true);
    try {
      const data = await fetchProcessos();
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      toast.error('Erro ao carregar processos.');
    } finally {
      setLoading(false);
    }
  };

  // Abre modal para CRIAR
  const handleOpenCreate = () => {
    setEditingProcess(null);
    setIsModalOpen(true);
  };

  // Abre modal para EDITAR
  const handleOpenEdit = (proc) => {
    setEditingProcess(proc);
    setIsModalOpen(true);
  };

  // Função Centralizada de Salvar (Cria ou Atualiza)
  const handleSaveProcess = async (formData) => {
    try {
      if (editingProcess) {
        // --- MODO EDIÇÃO (UPDATE) ---
        const updatedProcesso = await updateProcesso(editingProcess.id, {
          nome: formData.nome,
          inicio: formData.inicio,
          fim: formData.fim,
          descricao: formData.descricao,
        });

        if (updatedProcesso) {
          // Atualiza a lista localmente
          setProcessos(processos.map(p => p.id === editingProcess.id ? updatedProcesso : p));
          setIsModalOpen(false);
          toast.success('Processo atualizado com sucesso!');
        }
      } else {
        // --- MODO CRIAÇÃO (INSERT) ---
        const newProcesso = await createProcesso({
          nome: formData.nome,
          inicio: formData.inicio,
          fim: formData.fim,
          descricao: formData.descricao,
        });

        if (newProcesso) {
          setProcessos([newProcesso, ...processos]);
          setIsModalOpen(false);
          toast.success('Processo criado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar processo.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      try {
        await deleteProcesso(id);
        setProcessos(processos.filter(p => p.id !== id));
        toast.success('Processo excluído.');
      } catch (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir.');
      }
    }
  };

  // Função auxiliar para formatar data (opcional, para ficar bonito na tabela)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento dos Processos</h2>
          <p className="text-slate-500 text-sm mt-1">Administre editais e fases de seleção.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} /><span>Cadastrar Processo</span>
        </button>
      </div>
      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-1/3">Nome do Processo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Período</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fase Atual</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Progresso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="p-4"><TableSkeleton rows={5} /></div>
                  </td>
                </tr>
              ) : processos.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-400">Nenhum processo cadastrado.</td></tr>
              ) : (
                processos.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <FileText size={18} />
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">{proc.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-slate-400" />
                        {formatDate(proc.inicio)} - {formatDate(proc.fim)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-blue-600">{proc.fase_atual || 'Planejamento'}</td>
                    <td className="px-6 py-5 align-middle">
                      <div className="w-full max-w-[100px] mx-auto bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${proc.progresso || 0}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" title="Editar Fases">
                          <Layers size={18} />
                        </button>

                        {/* Botão de Editar Ativado */}
                        <button
                          onClick={() => handleOpenEdit(proc)}
                          className="p-2 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(proc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      <NewProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProcess}
        processoParaEditar={editingProcess}
      />
    </div>
  );
}