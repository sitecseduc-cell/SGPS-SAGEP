import React, { useState } from 'react';
import { X, Save, MapPin, School, Briefcase, Hash, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ModalNovaVaga({ onClose, onSuccess, initData = null }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        municipio: initData?.municipio || '',
        dre: initData?.dre || '',
        escola: initData?.escola || '',
        cargo: initData?.cargo || '',
        qtd: initData?.qtd || 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'qtd' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (initData?.id) {
                // Update
                const { error: err } = await supabase.from('vagas')
                    .update({
                        municipio: formData.municipio,
                        dre: formData.dre,
                        escola: formData.escola,
                        cargo: formData.cargo,
                        qtd: formData.qtd
                    })
                    .eq('id', initData.id);
                error = err;
            } else {
                // Insert
                const { error: err } = await supabase.from('vagas').insert([
                    {
                        municipio: formData.municipio,
                        dre: formData.dre,
                        escola: formData.escola,
                        cargo: formData.cargo,
                        qtd: formData.qtd
                    }
                ]);
                error = err;
            }

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar vaga:', error);
            alert('Erro ao salvar vaga: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">{initData ? 'Editar Vaga' : 'Nova Vaga'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Município</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="municipio"
                                    required
                                    placeholder="Ex: Rio Branco"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.municipio}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">DRE (Diretoria Regional)</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="dre"
                                    placeholder="Ex: Núcleo Baixada"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.dre}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Escola / Unidade</label>
                            <div className="relative">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="escola"
                                    required
                                    placeholder="Ex: Esc. Lourenço Filho"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.escola}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="cargo"
                                    placeholder="Ex: Professor"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.cargo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Vagas</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    name="qtd"
                                    min="1"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.qtd}
                                    onChange={handleChange}
                                />
                            </div>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Vaga</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
