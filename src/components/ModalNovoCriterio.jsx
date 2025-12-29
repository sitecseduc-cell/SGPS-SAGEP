import React, { useState } from 'react';
import { X, Save, Edit3, Award, Hash, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ModalNovoCriterio({ onClose, onSuccess, initData = null }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: initData?.titulo || '',
        area: initData?.area || '',
        pontos: initData?.pontos || 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'pontos' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (initData?.id) {
                // Update
                const { error: err } = await supabase.from('criterios_pontuacao')
                    .update({
                        titulo: formData.titulo,
                        area: formData.area,
                        pontos: formData.pontos
                    })
                    .eq('id', initData.id);
                error = err;
            } else {
                // Insert
                const { error: err } = await supabase.from('criterios_pontuacao').insert([
                    {
                        titulo: formData.titulo,
                        area: formData.area,
                        pontos: formData.pontos
                    }
                ]);
                error = err;
            }

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar critério:', error);
            alert('Erro ao salvar critério: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">{initData ? 'Editar Critério' : 'Novo Critério'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título / Critério</label>
                        <div className="relative">
                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="titulo"
                                required
                                placeholder="Ex: Doutorado em Área Relacionada"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={formData.titulo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Área de Avaliação</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="area"
                                placeholder="Ex: Títulos Acadêmicos"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={formData.area}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pontuação Unitária</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="number"
                                name="pontos"
                                step="0.1"
                                min="0"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={formData.pontos}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Critério</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
