import React, { useState, useEffect } from 'react';
import { Plus, Edit, FileText, Calendar, Layers, Trash2, Sparkles, Upload, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import NewProcessModal from '../components/NewProcessModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { GeminiService } from '../services/GeminiService';
import { uploadFile } from '../services/storageService';
import { logAction } from '../services/auditService';

// Configurar worker do PDF.js (necessário para vite)
// Usando versão fixa ou compatível se a variável falhar
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null); // Estado para saber quem estamos editando
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [editalTexto, setEditalTexto] = useState('');
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchProcessos();
  }, []);

  // --- FUNÇÕES DE NPL / IA ---
  const handleanalyzeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, envie um arquivo PDF.');
      return;
    }

    try {
      setAnalyzing(true);
      toast.info('Lendo Edital e extraindo informações...');

      // 1. Extrair texto do PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ');
      }

      setEditalTexto(fullText); // Salva para enviar ao banco

      // 2. Enviar para Gemini
      toast.info('Analisando com IA (Gemini)...');
      const aiData = await GeminiService.analyzeEdital(fullText);

      // 3. Upload Real para Supabase
      setUploading(true);
      const uploadResult = await uploadFile(file);
      setUploadedUrl(uploadResult.url);
      setUploading(false);

      // 4. Abrir Modal com dados preenchidos
      setEditingProcess({
        nome: aiData.nome || '',
        descricao: aiData.descricao || '',
        inicio: aiData.inicio || '',
        fim: aiData.fim || '',
        isAiGenerated: true // Flag opcional para indicar origem
      });
      setIsModalOpen(true);
      toast.success('Edital analisado! Verifique os dados.');

    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error('Falha ao analisar o edital. ' + error.message);
    } finally {
      setAnalyzing(false);
      setUploading(false);
      // Limpa input para permitir selecionar o mesmo arquivo novamente se quiser
      event.target.value = '';
    }
  };

  const fetchProcessos = async () => {
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar processos:', error);
    else if (data) setProcessos(data);
  };

  // Abre modal para CRIAR
  const handleOpenCreate = () => {
    setEditingProcess(null);
    setUploadedUrl(''); // Limpa URL anterior
    setEditalTexto('');
    setIsModalOpen(true);
  };

  // Abre modal para EDITAR
  const handleOpenEdit = (proc) => {
    setEditingProcess(proc);
    setUploadedUrl(proc.edital_url || '');
    setEditalTexto(proc.edital_texto || '');
    setIsModalOpen(true);
  };

  // Função Centralizada de Salvar (Cria ou Atualiza)
  const handleSaveProcess = async (formData) => {
    if (editingProcess) {
      // --- MODO EDIÇÃO (UPDATE) ---
      const { data, error } = await supabase
        .from('processos')
        .update({
          nome: formData.nome,
          inicio: formData.inicio,
          fim: formData.fim,
          descricao: formData.descricao,
          descricao: formData.descricao,
          edital_url: uploadedUrl || editingProcess.edital_url, // Mantém anterior se não mudou
          edital_texto: editalTexto || editingProcess.edital_texto
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
        handleLogAction('UPDATE', 'processos', `Atualizou processo: ${formData.nome}`, editingProcess, data[0]);
        toast.success('Processo atualizado com sucesso!');
      }

    } else {
      // --- MODO CRIAÇÃO (INSERT) ---
      // Ajuste de Validação: Garante que as datas não vão como string vazia se o usuário não preencher
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        fase_atual: 'Planejamento', // Valor padrão
        fase_atual: 'Planejamento', // Valor padrão
        progresso: 0,
        edital_url: uploadedUrl || null,
        edital_texto: editalTexto || null
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
        handleLogAction('INSERT', 'processos', `Criou processo: ${formData.nome}`, null, data[0]);
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
        const deletedProc = processos.find(p => p.id === id);
        setProcessos(processos.filter(p => p.id !== id));
        handleLogAction('DELETE', 'processos', `Excluiu processo ID: ${id}`, deletedProc, null);
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

  const handleLogAction = (op, table, details, oldD, newD) => {
    logAction(op, table, details, oldD, newD);
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
            {analyzing || uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Sparkles size={20} />}
            <span>{analyzing ? 'Analisando...' : uploading ? 'Enviando...' : 'Analisar Edital (IA)'}</span>
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

      <NewProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProcess}
        processoParaEditar={editingProcess}
      />
    </div>
  );
}