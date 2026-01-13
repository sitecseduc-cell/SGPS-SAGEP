import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSistema from '../assets/brassao.svg';
import { Lock, Mail, User, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import ImmersiveLoader from '../components/ImmersiveLoader';

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
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const currentSchema = view === 'login' ? loginSchema : (view === 'register' ? registerSchema : forgotSchema);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onSubmit'
  });

  const changeView = (newView) => {
    setView(newView);
    setGlobalError(null);
    setSuccessMsg('');
    reset();
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
      case 'register': return { title: 'Criar Conta', subtitle: 'Junte-se à nossa plataforma' };
      case 'forgot': return { title: 'Recuperação', subtitle: 'Redefina sua senha de acesso' };
      default: return { title: 'Bem-vindo de volta', subtitle: 'Acesse o portal do servidor' };
    }
  };

  const header = getHeaderInfo();

  if (loading) {
    return <ImmersiveLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass-card p-8 md:p-10 relative z-10 border border-white/60 dark:border-white/10 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-white/50 dark:bg-white/10 shadow-lg shadow-indigo-500/10 mb-6 group hover:scale-105 transition-all duration-300">
            <img src={logoSistema} alt="Logo CPS" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
            {header.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {header.subtitle}
          </p>
        </div>

        {globalError && (
          <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-600 dark:text-red-400 text-sm animate-fadeIn">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            {globalError}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center animate-fadeIn">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fadeIn">

          {/* Nome (Register Only) */}
          {view === 'register' && (
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  {...register('name')}
                  type="text"
                  className={`input-glass w-full pl-12 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="Digite seu nome"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.name.message}</p>}
            </div>
          )}

          {/* Email (All) */}
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                {...register('email')}
                type="email"
                className={`input-glass w-full pl-12 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder="nome@exemplo.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.email.message}</p>}
          </div>

          {/* Password (Login & Register) */}
          {view !== 'forgot' && (
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  {...register('password')}
                  type="password"
                  className={`input-glass w-full pl-12 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.password.message}</p>}
            </div>
          )}

          {/* Confirm Password (Register Only) */}
          {view === 'register' && (
            <div className="group animate-fadeIn">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className={`input-glass w-full pl-12 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.confirmPassword.message}</p>}
            </div>
          )}

          {/* Forgot Password Link */}
          {view === 'login' && (
            <div className="flex justify-end">
              <button type="button" onClick={() => changeView('forgot')} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline transition-all">
                Esqueceu a senha?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-glass w-full py-3.5 flex items-center justify-center text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2">
                {view === 'login' ? 'Acessar' : view === 'register' ? 'Criar Conta' : 'Enviar Link'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/10 text-center">
          {view === 'login' && (
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Ainda não tem conta?{' '}
              <button onClick={() => changeView('register')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Cadastre-se
              </button>
            </p>
          )}
          {view !== 'login' && (
            <button onClick={() => changeView('login')} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold flex items-center justify-center mx-auto gap-2 text-sm transition-colors">
              <ArrowLeft size={16} /> Voltar para Acesso
            </button>
          )}
        </div>

      </div>

      {/* Footer System Info */}
      <div className="absolute bottom-4 text-center w-full text-[10px] text-slate-400/60 font-medium">
        &copy; 2026 Sistema de Gestão de Processos Seletivos &bull; Gov. Pará
      </div>
    </div>
  );
}