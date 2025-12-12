import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function EmConstrucao({ titulo }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center animate-fadeIn">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Construction size={48} className="text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Módulo em Desenvolvimento</h2>
      <p className="text-slate-500 max-w-md mb-8">
        A funcionalidade <strong>"{titulo || 'Recurso'}"</strong> está sendo implementada. Em breve você poderá gerenciar estes dados aqui.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-2" />
        Voltar
      </button>
    </div>
  );
}