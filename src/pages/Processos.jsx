import React, { useState } from 'react';
import { Plus, Edit, FileText, Calendar, Layers, Trash2 } from 'lucide-react';
import { PROCESSOS_MOCK } from '../data/mockData';
import NewProcessModal from '../components/NewProcessModal'; // <--- Importamos o modal aqui

export default function Processos() {
  // Estado local para gerenciar a lista e a visibilidade do modal
  const [processos, setProcessos] = useState(PROCESSOS_MOCK);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função chamada quando o formulário é salvo (Simula o INSERT)
  const handleCreateProcess = (novoProcesso) => {
    // Formata a data para ficar visualmente bonita (DD/MM/AAAA)
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    const processoFormatado = {
      id: processos.length + 100, // Gera um ID fictício
      nome: novoProcesso.nome,
      periodo: `${formatDate(novoProcesso.inicio)} - ${formatDate(novoProcesso.fim)}`,
      fase_atual: 'Planejamento', // Começa sempre no início
      progresso: 0,
      permitir_alteracao: true
    };

    // Atualiza a lista na tela (Optimistic UI)
    setProcessos([processoFormatado, ...processos]); 
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      setProcessos(processos.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento dos Processos</h2>
          <p className="text-slate-500 text-sm mt-1">Administre editais e fases de seleção.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // <--- Abre o Modal
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
              {processos.map((proc) => (
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
                      <Calendar size={16} className="mr-2 text-slate-400"/>
                      {proc.periodo}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-blue-600">{proc.fase_atual}</td>
                  <td className="px-6 py-5 align-middle">
                    <div className="w-full max-w-[100px] mx-auto bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${proc.progresso}%`}}></div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" title="Editar Fases">
                        <Layers size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title="Editar">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderização do Modal */}
      <NewProcessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateProcess} 
      />
    </div>
  );
}