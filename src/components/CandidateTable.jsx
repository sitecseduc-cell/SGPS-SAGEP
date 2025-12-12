import React from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CandidateTable({ candidates, onSelect, total, page, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  const startRange = (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">Nenhum candidato encontrado.</p>
        <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros de busca.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidato / CPF</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Processo Seletivo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo / Localidade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {candidates.map((cand) => (
              <tr key={cand.id} className="hover:bg-blue-50/40 transition-colors group cursor-pointer" onClick={() => onSelect(cand)}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs mr-3 border border-slate-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                      {cand.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700">{cand.nome}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{cand.cpf}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{cand.processo}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="block font-medium text-slate-800">{cand.cargo}</span>
                  <span className="text-xs text-slate-400 flex items-center mt-0.5">{cand.localidade}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    cand.status === 'Classificado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    cand.status === 'Desclassificado' ? 'bg-red-100 text-red-700 border-red-200' : 
                    cand.status === 'Em Análise' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {cand.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm opacity-80 group-hover:opacity-100">
                    <Eye size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RODAPÉ DA PAGINAÇÃO */}
      <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between rounded-b-2xl">
        <span className="text-sm text-slate-500">
          Mostrando <span className="font-bold text-slate-800">{startRange}</span> a <span className="font-bold text-slate-800">{endRange}</span> de <span className="font-bold text-slate-800">{total}</span> resultados
        </span>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="text-sm font-medium text-slate-700 px-2">
            Página {page} de {totalPages}
          </span>

          <button 
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}