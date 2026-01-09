import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSistema from '../assets/brassao.svg';
import { Lock, Mail, User, Loader2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

// --- VALIDATION AND FORMS ---
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schemas Zod
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export default function Login() {
  // view: 'login' | 'register' | 'forgot'
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Determine active schema based on view
  const currentSchema = view === 'login' ? loginSchema : (view === 'register' ? registerSchema : forgotSchema);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onSubmit' // Validar ao submeter
  });

  const changeView = (newView) => {
    setView(newView);
    setGlobalError(null);
    setSuccessMsg('');
    reset(); // Limpa formulário
    clearErrors();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setGlobalError(null);
    setSuccessMsg('');

    try {
      if (view === 'register') {
        await signUp(data.email, data.password, data.name);
        setSuccessMsg('Conta criada! Verifique seu e-mail ou faça login.');
        setTimeout(() => changeView('login'), 3000);
      }
      else if (view === 'forgot') {
        await resetPassword(data.email);
        setSuccessMsg('Link de recuperação enviado! Verifique sua caixa de entrada.');
      }
      else {
        await signIn(data.email, data.password);
        navigate('/');
      }
    } catch (err) {
      // Traduz erros comuns do Supabase
      let msg = err.message;
      if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
      if (msg.includes('Email not confirmed')) msg = 'Verifique seu e-mail antes de entrar.';
      setGlobalError(msg || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getHeaderInfo = () => {
    switch (view) {
      case 'register': return { title: 'Novo Usuário', subtitle: 'Crie sua conta de acesso' };
      case 'forgot': return { title: 'Recuperar Senha', subtitle: 'Enviaremos um link para seu e-mail' };
      default: return { title: 'Acesse sua conta', subtitle: 'Sistema de Gestão de Processos Seletivos' };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all">

        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <img src={logoSistema} alt="Logo SAGEP" className="h-16 w-16 object-cover mx-auto mb-4 rounded-lg" />
          <h1 className="text-2xl font-bold text-white tracking-tight">SGPS <span className="text-blue-400">SAGEP</span></h1>
          <p className="text-slate-400 text-sm mt-2">{header.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{header.title}</h2>
          </div>

          {globalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm animate-pulse">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {globalError}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fadeIn">

            {/* Nome (Register Only) */}
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    {...register('name')}
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                    placeholder="Seu Nome"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
              </div>
            )}

            {/* Email (All) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password (Login & Register) */}
            {view !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    {...register('password')}
                    type="password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
              </div>
            )}

            {/* Confirm Password (Register Only) */}
            {view === 'register' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            )}

            {/* Forgot Password Link */}
            {view === 'login' && (
              <div className="flex justify-end text-sm">
                <button type="button" onClick={() => changeView('forgot')} className="text-blue-600 hover:underline font-medium">
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                view === 'login' ? 'Entrar no Sistema' :
                  view === 'register' ? 'Cadastrar' : 'Enviar Link'
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            {view === 'login' && (
              <>
                <p className="text-sm text-slate-500 mb-3">Não tem acesso ainda?</p>
                <button onClick={() => changeView('register')} className="text-blue-600 font-bold hover:text-blue-800 flex items-center justify-center mx-auto gap-1">
                  Criar uma conta agora <ArrowRight size={16} />
                </button>
              </>
            )}
            {view !== 'login' && (
              <button onClick={() => changeView('login')} className="text-blue-600 font-bold hover:text-blue-800 flex items-center justify-center mx-auto gap-1">
                <ArrowLeft size={16} /> Voltar para Login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}