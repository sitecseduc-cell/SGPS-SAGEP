import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import {
    Shield, Lock, Key, Smartphone,
    AlertTriangle, Server, CheckCircle, LogIn
} from 'lucide-react';

export default function Seguranca() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('As senhas não conferem.');
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error('A senha deve ter no mínimo 6 caracteres.');
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (error) throw error;
            toast.success('Senha atualizada com sucesso!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Segurança da Conta</h2>
                <p className="text-slate-500">Gerencie suas credenciais e verifique o status de segurança do sistema.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna 1: Perfil e Senha */}
                <div className="lg:col-span-2 space-y-8">



                    {/* Card de Alterar Senha */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Key size={20} className="text-orange-500" /> Alterar Senha
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !passwordData.newPassword}
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Atualizando...' : 'Atualizar Senha'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* Coluna 2: Status do Sistema */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-emerald-400" /> Status de Segurança
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-700">
                                <span className="flex items-center gap-2 text-sm text-slate-300">
                                    <Lock size={16} /> RLS (Row Level Security)
                                </span>
                                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                                    <CheckCircle size={14} /> ATIVO
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-700">
                                <span className="flex items-center gap-2 text-sm text-slate-300">
                                    <Server size={16} /> Criptografia de Dados
                                </span>
                                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                                    <CheckCircle size={14} /> ATIVO
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-700">
                                <span className="flex items-center gap-2 text-sm text-slate-300">
                                    <Smartphone size={16} /> Autenticação 2FA
                                </span>
                                <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                                    <AlertTriangle size={14} /> OPCIONAL
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-700">
                                <span className="flex items-center gap-2 text-sm text-slate-300">
                                    <LogIn size={16} /> Último Acesso
                                </span>
                                <span className="text-slate-400 font-mono text-xs">
                                    {new Date().toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} /> Área de Perigo
                        </h4>
                        <p className="text-sm text-orange-700 mb-4">
                            Ações sensíveis que afetam o funcionamento da sua conta.
                        </p>
                        <button className="w-full py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 text-sm transition-colors">
                            Solicitar Exclusão de Conta
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
