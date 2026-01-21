import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, FileText, Calendar, Layers, Trash2, Sparkles, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import NewProcessModal from '../components/NewProcessModal';
import TableSkeleton from '../components/TableSkeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { GeminiService } from '../services/GeminiService';
import ImmersiveLoader from '../components/ImmersiveLoader';

// Configurar worker do PDF.js (usando arquivo na pasta public)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function Processos() {
  const fileInputRef = useRef(null);
  const [processos, setProcessos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchProcessos();
  }, []);

  const handleanalyzeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para extrair texto do PDF
  const extractPdfText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Lê no máximo 5 primeiras páginas para não estourar contexto
      const maxPages = Math.min(pdf.numPages, 5);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (error) {
      console.error("Erro ao ler PDF:", error);
      throw new Error("Não foi possível ler o arquivo PDF.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      toast.info("Lendo arquivo PDF...");
      const text = await extractPdfText(file);

      toast.info("Analisando com IA (Gemini)...");
      const dados = await GeminiService.analyzeEdital(text);

      // Formata os dados extras na descrição
      const cargosStr = dados.cargos?.length ? `\n\n📌 **Cargos Identificados:**\n- ${dados.cargos.join('\n- ')}` : '';
      const etapasStr = dados.etapas?.length ? `\n\n📅 **Fases Previstas:**\n- ${dados.etapas.join('\n- ')}` : '';
      const descriptionFull = (dados.descricao || '') + cargosStr + etapasStr;

      // Preenche o formulário com os dados da IA
      setEditingProcess({
        isAiDraft: true, // Flag para indicar que é rascunho
        nome: dados.nome,
        descricao: descriptionFull,
        inicio: dados.inicio,
        fim: dados.fim
      });
      setIsModalOpen(true);

      toast.success("Análise concluída! Verifique os dados.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao analisar arquivo: " + error.message);
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update fetchProcessos
  const fetchProcessos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar processos:', error);
      toast.error('Erro ao carregar processos');
    } else if (data) {
      setProcessos(data);
    }
    setLoading(false);
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
    // Se tem ID, é update real. Se for rascunho de IA (sem ID), é criação.
    if (editingProcess?.id) {
      // --- MODO EDIÇÃO (UPDATE) ---
      const { data, error } = await supabase
        .from('processos')
        .update({
          nome: formData.nome,
          inicio: formData.inicio,
          fim: formData.fim,
          descricao: formData.descricao,
        })
        .eq('id', editingProcess.id)
        .select();

      if (error) {
        console.error('Erro ao atualizar:', error);
        toast.error('Erro ao atualizar processo.');
      } else if (data && data.length > 0) {
        // Atualiza a lista localmente
        setProcessos(processos.map(p => p.id === editingProcess.id ? data[0] : p));
        setIsModalOpen(false);
        toast.success('Processo atualizado com sucesso!');
      }

    } else {
      // --- MODO CRIAÇÃO (INSERT) ---
      // Ajuste de Validação: Garante que as datas não vão como string vazia se o usuário não preencher
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        fase_atual: 'Planejamento', // Valor padrão
        progresso: 0
      };

      // Adiciona ao payload apenas se existir valor, evitando erro de formato inválido no banco
      if (formData.inicio) payload.inicio = formData.inicio;
      if (formData.fim) payload.fim = formData.fim;

      const { data, error } = await supabase
        .from('processos')
        .insert([payload])
        .select();

      if (error) {
        console.error('Erro ao criar:', error);
        toast.error('Erro ao criar processo.');
      } else if (data && data.length > 0) {
        setProcessos([data[0], ...processos]);
        setIsModalOpen(false);
        toast.success('Processo criado com sucesso!');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      const { error } = await supabase.from('processos').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir.');
      } else {
        setProcessos(processos.filter(p => p.id !== id));
        toast.success('Processo excluído.');
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
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileUpload}
          />
          <button
            onClick={handleanalyzeClick}
            disabled={analyzing}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
          >
            {analyzing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Sparkles size={20} />}
            <span>{analyzing ? 'Analisando...' : 'Analisar Edital (IA)'}</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} /><span>Cadastrar Processo</span>
          </button>
        </div>
      </div>
      {/* Tabela */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
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
                {processos.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-400">Nenhum processo cadastrado.</td></tr>
                )}
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
                        <button
                          onClick={() => navigate('/workflow', { state: { processId: proc.id, processName: proc.nome } })}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                          title="Editar Fases (Kanban)"
                        >
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NewProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProcess}
        processoParaEditar={editingProcess}
      />
    </div>
  );
}