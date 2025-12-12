import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';

// Dados iniciais (Mock)
const INITIAL_DATA = {
  planejamento: [
    { id: 'card-1', title: 'PSS Matemática 2025', date: '20/12/2025' },
    { id: 'card-2', title: 'PSS Vigias Zona Rural', date: '15/01/2026' },
  ],
  publicado: [
    { id: 'card-3', title: 'PSS Merendeiras', date: '10/12/2025' },
  ],
  analise: [
    { id: 'card-4', title: 'Prof. Língua Portuguesa', date: '05/12/2025' },
  ],
  homologacao: [
    { id: 'card-5', title: 'Psicólogos Escolares', date: '30/11/2025' },
  ]
};

export default function Kanban() {
  const [columns, setColumns] = useState(INITIAL_DATA);
  const [activeId, setActiveId] = useState(null); // ID do card que está sendo arrastado

  // Descobre em qual coluna um card está
  const findColumn = (cardId) => {
    return Object.keys(columns).find((key) => 
      columns[key].some((item) => item.id === cardId)
    );
  };

  // Quando começa a arrastar
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Quando solta o card (Lógica Principal)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    const activeCardId = active.id;
    const overColumnId = over?.id;

    // Se soltou fora de qualquer coluna, cancela
    if (!overColumnId) {
      setActiveId(null);
      return;
    }

    const sourceColumn = findColumn(activeCardId);
    
    // Se soltou na mesma coluna, não faz nada
    if (sourceColumn === overColumnId) {
      setActiveId(null);
      return;
    }

    // --- OPTIMISTIC UI UPDATE ---
    // Atualiza a tela IMEDIATAMENTE, antes de chamar o servidor
    const oldColumns = JSON.parse(JSON.stringify(columns)); // Backup para rollback

    setColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]];
      const destItems = [...prev[overColumnId]];
      
      // Remove da origem
      const cardIndex = sourceItems.findIndex(i => i.id === activeCardId);
      const [movedCard] = sourceItems.splice(cardIndex, 1);
      
      // Adiciona no destino
      destItems.push(movedCard);

      return {
        ...prev,
        [sourceColumn]: sourceItems,
        [overColumnId]: destItems,
      };
    });

    // Simulação de chamada ao Servidor (Aqui entraria o Supabase)
    console.log(`Salvando: Card ${activeCardId} movido de ${sourceColumn} para ${overColumnId}...`);
    
    // Exemplo de Rollback (caso a API falhe)
    // if (erro) setColumns(oldColumns);

    setActiveId(null);
  };

  // Encontra o objeto do card ativo para desenhar o "fantasma" que segue o mouse
  const activeItem = activeId ? Object.values(columns).flat().find(i => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-140px)] animate-fadeIn flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fluxo de Trabalho</h2>
          <p className="text-slate-500 text-sm">Gerencie o progresso dos processos seletivos.</p>
        </div>
      </div>

      <DndContext 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-x-auto pb-4 custom-scrollbar">
          <KanbanColumn id="planejamento" title="Planejamento" items={columns.planejamento} colorHeader="bg-slate-200" />
          <KanbanColumn id="publicado" title="Edital Publicado" items={columns.publicado} colorHeader="bg-blue-200" />
          <KanbanColumn id="analise" title="Em Análise" items={columns.analise} colorHeader="bg-indigo-200" />
          <KanbanColumn id="homologacao" title="Homologado" items={columns.homologacao} colorHeader="bg-emerald-200" />
        </div>

        {/* Overlay: O card que segue o mouse */}
        <DragOverlay>
          {activeItem ? (
            <div className="opacity-90 rotate-3 scale-105 pointer-events-none">
               <KanbanCard id={activeItem.id} title={activeItem.title} date={activeItem.date} color="border-blue-500" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}