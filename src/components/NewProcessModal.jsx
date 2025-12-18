// src/components/NewProcessModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, Type, FileText, AlertCircle, Save } from 'lucide-react';

const processSchema = z.object({
  nome: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  inicio: z.string().min(1, 'Data de início é obrigatória'),
  fim: z.string().min(1, 'Data de fim é obrigatória'),
  descricao: z.string().optional(),
}).refine((data) => {
  if (data.inicio && data.fim) {
    const start = new Date(data.inicio);
    const end = new Date(data.fim);
    return end >= start;
  }
  return true;
}, {
  message: 'A data final não pode ser anterior à data de início',
  path: ['fim'], // Attached to 'fim' field
});

export default function NewProcessModal({ isOpen, onClose, onSave, processoParaEditar = null }) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(processSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      inicio: '',
      fim: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (processoParaEditar) {
        setValue('nome', processoParaEditar.nome || '');
        setValue('descricao', processoParaEditar.descricao || '');
        setValue('inicio', processoParaEditar.inicio || '');
        setValue('fim', processoParaEditar.fim || '');
      } else {
        reset({ nome: '', descricao: '', inicio: '', fim: '' });
      }
    }
  }, [isOpen, processoParaEditar, setValue, reset]);

  const onSubmit = (data) => {
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden border border-slate-100 transform transition-all scale-100">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {processoParaEditar ? 'Editar Processo' : 'Novo Processo Seletivo'}
          </h3>
          <button onClick={onClose} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-pulse">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <ul className="list-disc pl-5">
                {Object.entries(errors).map(([field, err]) => (
                  <li key={field}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Type size={14} /> Título do Edital
              </label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: PSS 08/2025 - Professores"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Calendar size={14} /> Início
                </label>
                <input
                  type="date"
                  {...register('inicio')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Calendar size={14} /> Fim
                </label>
                <input
                  type="date"
                  {...register('fim')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <FileText size={14} /> Descrição (Opcional)
              </label>
              <textarea
                {...register('descricao')}
                rows="3"
                placeholder="Detalhes sobre o certame..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> {processoParaEditar ? 'Atualizar' : 'Salvar Processo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}