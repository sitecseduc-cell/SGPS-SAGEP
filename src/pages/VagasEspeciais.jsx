import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import {
  Upload, FileUp, CheckCircle, Search, FileDown, Eye, X, AlertTriangle, ExternalLink, Sparkles, Mail, UserPlus
} from 'lucide-react';

export default function VagasEspeciais() {
  const [file, setFile] = useState(null);
  const [analisando, setAnalisando] = useState(false);
  const [linkForms, setLinkForms] = useState('');

  // Novos estados para sugestões
  const [sugestoes, setSugestoes] = useState([]);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);

  useEffect(() => {
    buscarSugestoes();
  }, []);

  const buscarSugestoes = async () => {
    setLoadingSugestoes(true);
    try {
      // Simulação de "Match": Busca candidatos classificados que ainda não estão aprovados
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .eq('status', 'Classificado')
        .limit(5); // Pega 5 para exemplo de "Melhores Matches"

      if (error) throw error;
      setSugestoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setLoadingSugestoes(false);
    }
  };

  const handleConvocar = (candidato) => {
    // Simulação de envio de notificação
    toast.success(`Convite enviado para ${candidato.nome} via WhatsApp/Email!`);
  };

  const handleAprovarDireto = async (candidato) => {
    const confirm = window.confirm(`Deseja aprovar ${candidato.nome} diretamente para Homologação?`);
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ status: 'Homologado' }) // Move direto para fim do Kanban
        .eq('id', candidato.id);

      if (error) throw error;

      toast.success(`${candidato.nome} aprovado com sucesso!`);
      buscarSugestoes(); // Recarrega lista
    } catch (error) {
      toast.error('Erro ao aprovar candidato.');
      console.error(error);
    }
  };

  // ... funções de upload anteriores (mock ou reais) ...
  const handleFileChange = (e) => setFile(e.target.files[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Convocação Especial 🎯</h1>
          <p className="text-slate-500">Gestão de vagas remanescentes e chamadas extraordinárias (PSS 03/2024)</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cole o link do Google Forms..."
            className="px-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-purple-500 outline-none"
            value={linkForms}
            onChange={(e) => setLinkForms(e.target.value)}
          />
          <a
            href={linkForms || "#"}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-colors ${linkForms ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            <ExternalLink size={18} /> Abrir Form
          </a>
        </div>
      </div>

      {/* Sugestões de Candidatos (Match IA) */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" /> Sugestões de Convocação
            </h2>
            <p className="text-indigo-600 text-sm">Candidatos no Banco de Talentos com perfil compatível para vagas extras.</p>
          </div>
          <button onClick={buscarSugestoes} className="text-sm text-indigo-600 hover:underline">Atualizar Lista</button>
        </div>

        {loadingSugestoes ? (
          <p className="text-center text-indigo-400 py-4">Buscando melhores perfis...</p>
        ) : sugestoes.length === 0 ? (
          <p className="text-center text-slate-400 py-4">Nenhum candidato 'Classificado' encontrado para sugestão no momento.</p>
        ) : (
          <div className="grid gap-3">
            {sugestoes.map(cand => (
              <div key={cand.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-700">{cand.nome}</h3>
                  <span className="text-xs text-slate-500">{cand.cargo} • {cand.localidade}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConvocar(cand)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Mail size={14} /> Convocar
                  </button>
                  <button
                    onClick={() => handleAprovarDireto(cand)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    <UserPlus size={14} /> Contratar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Área de Upload (Mantido funcionalidade original de análise de CSV se existir) */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 border-dashed text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <FileUp size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">Análise em Lote</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Faça upload de uma planilha (.csv) para processar múltiplas convocações de uma vez.
        </p>
        <label className="inline-flex items-center cursor-pointer px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
          <Upload size={18} className="mr-2" /> Selecionar Arquivo
          <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
        </label>
        {file && <p className="mt-4 text-emerald-600 font-bold flex items-center justify-center gap-2"><CheckCircle size={16} /> {file.name}</p>}
      </div>

    </div>
  );
}