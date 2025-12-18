import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { fetchCandidatos, updateCandidatoStatus } from '../services/candidatos';

// Estrutura vazia inicial
const INITIAL_COLUMNS = {
  planejamento: [],
  publicado: [],
  analise: [],
  homologacao: []
};

// Mapping status labels from DB to Column IDs
const STATUS_MAP = {
  'Planejamento': 'planejamento',
  'Publicado': 'publicado',
  'Em Análise': 'analise',
  'Homologado': 'homologacao',
  'Classificado': 'homologacao', // Example mapping
  'Desclassificado': 'planejamento' // Example mapping
};

// Reverse mapping for saving
const REVERSE_STATUS_MAP = {
  'planejamento': 'Planejamento',
  'publicado': 'Publicado',
  'analise': 'Em Análise',
  'homologacao': 'Homologado'
};

export default function Kanban() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [activeId, setActiveId] = useState(null); // ID do card sendo arrastado
  const [loading, setLoading] = useState(true);

  // 1. BUSCAR DADOS DO SUPABASE AO CARREGAR
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidatos();

      // Organiza os dados nas colunas corretas
      const newColumns = {
        planejamento: [],
        publicado: [],
        analise: [],
        homologacao: []
      };

      data.forEach(candidate => {
        // Map candidate status to column ID
        // Normalizing to lowercase for safety
        const statusLower = candidate.status?.toLowerCase() || '';
        let columnId = 'planejamento';

        if (statusLower.includes('análise') || statusLower.includes('analise')) columnId = 'analise';
        else if (statusLower.includes('planejamento')) columnId = 'planejamento';
        else if (statusLower.includes('publicado')) columnId = 'publicado';
        else if (statusLower.includes('homologado') || statusLower.includes('classificado')) columnId = 'homologacao';
        else columnId = 'planejamento';

        // Create card object
        const card = {
          id: candidate.id,
          title: candidate.nome,
          date: new Date(candidate.created_at).toLocaleDateString('pt-BR'),
          status: columnId,
          originalStatus: candidate.status // Keep original for reference
        };

        if (newColumns[columnId]) {
          newColumns[columnId].push(card);
        } else {
          newColumns.planejamento.push(card);
        }
      });

      setColumns(newColumns);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Descobre em qual coluna um card está
  const findColumn = (cardId) => {
    return Object.keys(columns).find((key) =>
      columns[key].some((item) => item.id === cardId)
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // 2. LÓGICA DE PERSISTÊNCIA AO SOLTAR O CARD
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeCardId = active.id;
    const overColumnId = over?.id;

    // Cancelar se soltou fora ou no mesmo lugar
    if (!overColumnId) {
      setActiveId(null);
      return;
    }

    const sourceColumn = findColumn(activeCardId);
    if (sourceColumn === overColumnId) {
      setActiveId(null);
      return;
    }

    // --- OPTIMISTIC UPDATE (Atualiza visualmente antes do banco) ---
    const oldColumns = JSON.parse(JSON.stringify(columns)); // Backup para rollback

    setColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]];
      const destItems = [...prev[overColumnId]];

      const cardIndex = sourceItems.findIndex(i => i.id === activeCardId);
      const [movedCard] = sourceItems.splice(cardIndex, 1);

      // Atualiza o objeto do card movido com o novo status
      const updatedCard = { ...movedCard, status: overColumnId };
      destItems.push(updatedCard);

      return {
        ...prev,
        [sourceColumn]: sourceItems,
        [overColumnId]: destItems,
      };
    });

    setActiveId(null);

    // --- ATUALIZAÇÃO NO SUPABASE ---
    try {
      const newDbStatus = REVERSE_STATUS_MAP[overColumnId] || 'Planejamento';
      await updateCandidatoStatus(activeCardId, newDbStatus);
      console.log(`Candidato ${activeCardId} status atualizado para ${newDbStatus}`);
    } catch (error) {
      console.error('Erro ao mover card no banco:', error);
      alert('Erro ao salvar alteração. Revertendo...');
      setColumns(oldColumns); // Rollback visual se der erro
    }
  };

  const activeItem = activeId ? Object.values(columns).flat().find(i => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-140px)] animate-fadeIn flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fluxo de Trabalho</h2>
          <p className="text-slate-500 text-sm">Gerencie o progresso dos candidatos no processo seletivo.</p>
        </div>
        <button
          onClick={loadData}
          className="text-xs text-blue-500 underline hover:text-blue-700"
        >
          Atualizar Lista
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
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

          <DragOverlay>
            {activeItem ? (
              <div className="opacity-90 rotate-3 scale-105 pointer-events-none">
                <KanbanCard id={activeItem.id} title={activeItem.title} date={activeItem.date} color="border-blue-500" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}