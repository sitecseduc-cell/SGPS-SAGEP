import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ id, title, items, colorHeader }) {
  // Hook que torna a coluna uma "área onde se pode soltar itens"
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // Estilização dinâmica
  const getBorderColor = (colId) => {
    switch(colId) {
      case 'planejamento': return 'border-slate-400';
      case 'publicado': return 'border-blue-500';
      case 'analise': return 'border-indigo-500';
      case 'homologacao': return 'border-emerald-500';
      default: return 'border-slate-300';
    }
  };

  return (
    <div className="min-w-[300px] flex flex-col h-full mx-2">
      {/* Cabeçalho */}
      <div className={`flex items-center justify-between mb-3 px-4 py-3 ${colorHeader} rounded-xl shadow-sm`}>
        <h4 className="font-bold text-sm text-slate-700">{title}</h4>
        <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-bold text-slate-600">{items.length}</span>
      </div>

      {/* Área Dropável (Onde os cards ficam) */}
      <div 
        ref={setNodeRef} 
        className={`flex-1 rounded-xl p-3 border-2 transition-colors overflow-y-auto custom-scrollbar ${
          isOver ? 'bg-blue-50 border-blue-300 border-dashed' : 'bg-slate-100/50 border-dashed border-slate-200'
        }`}
      >
        {items.map((item) => (
          <KanbanCard 
            key={item.id} 
            id={item.id} 
            title={item.title} 
            date={item.date} 
            color={getBorderColor(id)}
          />
        ))}
        
        {items.length === 0 && !isOver && (
          <div className="h-20 flex items-center justify-center text-slate-300 text-xs italic">
            Arraste itens aqui
          </div>
        )}
      </div>
    </div>
  );
}