import React, { useState } from 'react';
import { X, Briefcase, MapPin, Building, Calendar, AlertCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export default function NewVacancyModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        matvin: '',
        servidor: '',
        cargo_funcao: '',
        atividade: '',
        vacancia: '',
        status: '',
        ultima_lotacao: '',
        dre: '',
        secretaria_pertencente: '',
        municipio: '',
        observacao: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Preencher formulário ao abrir para edição
    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else if (isOpen && !initialData) {
            // Limpar formulário se for novo cadastro
            setFormData({
                matvin: '',
                servidor: '',
                cargo_funcao: '',
                atividade: '',
                vacancia: '',
                status: '',
                ultima_lotacao: '',
                dre: '',
                secretaria_pertencente: '',
                municipio: '',
                observacao: ''
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validação básica
        if (!formData.servidor || !formData.cargo_funcao) {
            setError('Campos "Servidor" e "Cargo" são obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            let result;

            if (initialData && initialData.id) {
                // UPDATE
                const { data, error: sbError } = await supabase
                    .from('controle_vagas')
                    .update(formData)
                    .eq('id', initialData.id)
                    .select();

                if (sbError) throw sbError;
                result = data[0];
                toast.success('Vaga/Servidor atualizado com sucesso!');
            } else {
                // INSERT
                const { data, error: sbError } = await supabase
                    .from('controle_vagas')
                    .insert([formData])
                    .select();

                if (sbError) throw sbError;
                result = data[0];
                toast.success('Vaga/Servidor salvo com sucesso!');
            }

            onSave(result);
            onClose();
            // Limpeza ocorre via useEffect ao reabrir
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar vaga: ' + err.message);
            setError('Erro ao salvar vaga: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl m-auto overflow-hidden border border-slate-100">

                {/* Cabeçalho */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600" /> {initialData ? 'Editar Vaga / Servidor' : 'Nova Vaga / Servidor'}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Formulário Scrollável */}
                <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Seção 1: Dados Pessoais/Funcionais */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dados do Servidor</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Matrícula (Vin)</label>
                                    <input
                                        type="text" name="matvin"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.matvin} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Nome do Servidor *</label>
                                    <input
                                        type="text" name="servidor" required
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.servidor} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Cargo e Lotação */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cargo e Lotação</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Cargo/Função *</label>
                                    <input
                                        type="text" name="cargo_funcao" required
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.cargo_funcao} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Atividade</label>
                                    <input
                                        type="text" name="atividade"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.atividade} onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Secretaria</label>
                                    <input
                                        type="text" name="secretaria_pertencente"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.secretaria_pertencente} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Última Lotação</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text" name="ultima_lotacao"
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.ultima_lotacao} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Município</label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text" name="municipio"
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.municipio} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Status */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Situação</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <select
                                        name="status"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.status} onChange={handleChange}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="ATIVO">ATIVO</option>
                                        <option value="AFASTADO">AFASTADO</option>
                                        <option value="DESLIGADO">DESLIGADO</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Vacância?</label>
                                    <select
                                        name="vacancia"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.vacancia} onChange={handleChange}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="SIM">SIM</option>
                                        <option value="NÃO">NÃO</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">DRE</label>
                                    <input
                                        type="text" name="dre"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.dre} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Observações */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Observações</label>
                            <textarea
                                name="observacao" rows="3"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={formData.observacao} onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? 'Salvando...' : <><Save size={18} /> Salvar Vaga</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
