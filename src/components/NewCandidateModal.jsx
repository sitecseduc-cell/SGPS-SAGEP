import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // Ensure supabase is imported if needed, or props are used
import { createCandidato } from '../services/candidatos'; // Use service if available

// Schema de validação Zod
// Schema de validação Zod
const candidatoSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório').min(5, 'O nome deve ter pelo menos 5 caracteres'),
    cpf: z.string().min(1, 'CPF é obrigatório').refine((cpf) => {
        // Validação simples de formato e dígitos
        // Em produção, usar algoritmo real de CPF
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf);
    }, 'CPF inválido'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    telefone: z.string().min(1, 'Telefone é obrigatório'),
    vaga: z.string().min(1, 'Selecione uma vaga')
});

export default function NewCandidateModal({ isOpen, onClose, onSave }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(candidatoSchema)
    });

    const onSubmit = async (data) => {
        // Se onSave for passado, usa ele (mock ou pai controlando)
        // Se não, poderíamos chamar o serviço aqui. 
        // O Inscritos.jsx passa um onSave que faz a inserção.
        // Vamos manter o contrato: passar os dados para o onSave.

        // Tratamento básico de CPF para remover pontuação se necessário
        // data.cpf = data.cpf.replace(/\D/g, ''); 

        await onSave(data);
        reset(); // Limpa o form
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Novo Candidato</h3>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            {...register('nome')}
                            placeholder="Ex: João da Silva"
                            className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all ${errors.nome ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                        />
                        {errors.nome && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.nome.message}</p>}
                    </div>

                    {/* CPF e Telefone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">CPF</label>
                            <input
                                type="text"
                                {...register('cpf')}
                                placeholder="000.000.000-00"
                                className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all ${errors.cpf ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                            />
                            {errors.cpf && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.cpf.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Telefone</label>
                            <input
                                type="text"
                                {...register('telefone')}
                                placeholder="(91) 90000-0000"
                                className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all ${errors.telefone ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                            />
                            {errors.telefone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.telefone.message}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="exemplo@email.com"
                            className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all ${errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email.message}</p>}
                    </div>

                    {/* Vaga/Cargo */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Vaga Pretendida</label>
                        <select
                            {...register('vaga')}
                            className={`w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all appearance-none ${errors.vaga ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                        >
                            <option value="">Selecione...</option>
                            <option value="Professor de Matemática">Professor de Matemática</option>
                            <option value="Professor de Português">Professor de Português</option>
                            <option value="Merendeira">Merendeira</option>
                            <option value="Vigia">Vigia</option>
                            {/* Add more options as needed */}
                        </select>
                        {errors.vaga && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.vaga.message}</p>}
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
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <Save size={18} /> {isSubmitting ? 'Salvando...' : 'Salvar Candidato'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
