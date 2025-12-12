import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal } from 'lucide-react';

export default function KanbanCard({ id, title, date, color }) {
  // Hook que torna o elemento "arrastável"
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });

  const style = {
    // Move o card visualmente conforme o mouse mexe
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1, // Fica transparente quando está sendo arrastado
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${color} mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all touch-none`}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-slate-700 text-sm leading-snug">{title}</p>
        <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={16} /></button>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <span className="text-xs flex items-center font-medium text-slate-400">
          <Calendar size={12} className="mr-1.5" /> {date}
        </span>
      </div>
    </div>
  );
}