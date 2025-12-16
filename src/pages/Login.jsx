import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, Loader2, AlertCircle, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export default function Login() {
  // Estados de controle de visualização
  // view: 'login' | 'register' | 'forgot'
  const [view, setView] = useState('login');
  
  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Limpa mensagens ao trocar de tela
  const changeView = (newView) => {
    setView(newView);
    setError(null);
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');

    try {
      if (view === 'register') {
        // --- CADASTRO ---
        await signUp(email, password, name);
        setSuccessMsg('Conta criada! Verifique seu e-mail ou faça login.');
        setTimeout(() => changeView('login'), 3000); // Volta pro login após 3s
      } 
      else if (view === 'forgot') {
        // --- RECUPERAÇÃO DE SENHA ---
        await resetPassword(email);
        setSuccessMsg('Link de recuperação enviado! Verifique sua caixa de entrada.');
        // Não mudamos a view automaticamente para dar tempo de ler a mensagem
      } 
      else {
        // --- LOGIN ---
        await signIn(email, password);
        navigate('/'); 
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  // Títulos e descrições dinâmicos
  const getHeaderInfo = () => {
    switch(view) {
      case 'register': return { title: 'Novo Usuário', subtitle: 'Crie sua conta de acesso' };
      case 'forgot': return { title: 'Recuperar Senha', subtitle: 'Enviaremos um link para seu e-mail' };
      default: return { title: 'Acesse sua conta', subtitle: 'Sistema de Gestão de Processos Seletivos' };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg mx-auto mb-4">P</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SGPS <span className="text-blue-400">SAGEP</span></h1>
          <p className="text-slate-400 text-sm mt-2">{header.subtitle}</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{header.title}</h2>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm animate-pulse">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
            
            {/* Campo Nome (Apenas Cadastro) */}
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    required={view === 'register'}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Seu Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Campo Email (Todos) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Senha (Login e Cadastro apenas) */}
            {view !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    required={view !== 'forgot'}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Link Esqueci a Senha (Apenas Login) */}
            {view === 'login' && (
              <div className="flex justify-end text-sm">
                <button
                  type="button"
                  onClick={() => changeView('forgot')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* Botão de Ação Principal */}
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

          {/* Navegação entre modos (Rodapé do form) */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            {view === 'login' && (
              <>
                <p className="text-sm text-slate-500 mb-3">Não tem acesso ainda?</p>
                <button
                  type="button"
                  onClick={() => changeView('register')}
                  className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center justify-center mx-auto gap-1"
                >
                  Criar uma conta agora <ArrowRight size={16} />
                </button>
              </>
            )}

            {view === 'register' && (
              <>
                <p className="text-sm text-slate-500 mb-3">Já possui uma conta?</p>
                <button
                  type="button"
                  onClick={() => changeView('login')}
                  className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center justify-center mx-auto gap-1"
                >
                  <ArrowLeft size={16} /> Voltar para Login
                </button>
              </>
            )}

            {view === 'forgot' && (
              <button
                type="button"
                onClick={() => changeView('login')}
                className="text-slate-500 font-bold hover:text-slate-700 transition-colors flex items-center justify-center mx-auto gap-1"
              >
                <ArrowLeft size={16} /> Cancelar e Voltar
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}