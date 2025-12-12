import React, { useState } from 'react';
import { X, User, Mail, Phone, FileText, AlertCircle, Save, CheckCircle } from 'lucide-react';

export default function NewCandidateModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    vaga: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // --- MÁSCARAS E VALIDAÇÃO --- //

  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // Limita o tamanho
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const validateCPF = (cpf) => {
    const strCPF = cpf.replace(/[^\d]+/g, '');
    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11))) return false;

    return true;
  };

  // --- HANDLERS --- //

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cpf') value = maskCPF(value);
    if (name === 'telefone') value = maskPhone(value);

    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Campos Vazios
    if (!formData.nome || !formData.cpf || !formData.email || !formData.vaga) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // 2. Validação de CPF Real
    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido. Verifique os números digitados.');
      return;
    }

    // Se passou, salva e fecha
    onSave(formData);
    onClose();
    setFormData({ nome: '', cpf: '', email: '', telefone: '', vaga: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden border border-slate-100">
        
        {/* Cabeçalho */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User size={20} className="text-blue-600"/> Adicionar Candidato
          </h3>
          <button onClick={onClose} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-pulse">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <input 
                type="text" name="nome" placeholder="Nome do candidato" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.nome} onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
                <input 
                  type="text" name="cpf" placeholder="000.000.000-00" maxLength={14}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-slate-700"
                  value={formData.cpf} onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                <input 
                  type="text" name="telefone" placeholder="(91) 90000-0000" maxLength={15}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.telefone} onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                  type="email" name="email" placeholder="candidato@email.com" 
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Vaga Pretendida</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <select 
                  name="vaga" 
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-slate-600"
                  value={formData.vaga} onChange={handleChange}
                >
                  <option value="">Selecione uma vaga...</option>
                  <option value="Professor de Matemática">Professor de Matemática</option>
                  <option value="Professor de Língua Portuguesa">Professor de Língua Portuguesa</option>
                  <option value="Merendeira">Merendeira</option>
                  <option value="Vigia">Vigia</option>
                  <option value="Técnico Administrativo">Técnico Administrativo</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Adicionar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}