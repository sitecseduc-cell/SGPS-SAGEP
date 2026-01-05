import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { supabase } from '../lib/supabaseClient';
import { useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';

const INITIAL_COLUMNS = {
  aguardando_envio: [],
  em_analise: [],
  pendencia: [],
  homologado: []
};

// Mapeamento: Status do Banco -> Coluna do Kanban
const STATUS_MAP = {
  'Classificado': 'aguardando_envio', // Assumindo que classificados entram aqui para convocação
  'Em Análise': 'em_analise',
  'Com Pendência': 'pendencia',
  'Aprovado': 'homologado',
  'Homologado': 'homologado' // Garantir compatibilidade
};

// Mapeamento Inverso: Coluna do Kanban -> Status do Banco
const REVERSE_STATUS_MAP = {
  'aguardando_envio': 'Classificado',
  'em_analise': 'Em Análise',
  'pendencia': 'Com Pendência',
  'homologado': 'Homologado'
};

export default function Kanban() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Filtro opcional vindo da navegação de Processos
  const processId = location.state?.processId;
  const processName = location.state?.processName || 'Todos os Processos';

  useEffect(() => {
    fetchCandidates();
  }, [processId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('candidatos')
        .select('*')
        .order('created_at', { ascending: false });

      // Se veio de um processo específico, filtra (assumindo que existe relação ou coluna texto)
      if (processName && processName !== 'Todos os Processos') {
        query = query.ilike('processo', `%${processName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      organizeColumns(data);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeColumns = (candidates) => {
    const newColumns = { aguardando_envio: [], em_analise: [], pendencia: [], homologado: [] };

    candidates.forEach(c => {
      // Normalizar status para chave do objeto
      let colKey = Object.keys(STATUS_MAP).find(k => k.toLowerCase() === c.status?.toLowerCase());
      let targetCol = STATUS_MAP[colKey] || 'aguardando_envio'; // Fallback

      // Se a coluna existir no nosso kanban, adiciona
      if (newColumns[targetCol]) {
        newColumns[targetCol].push({
          id: c.id,
          title: c.nome,
          date: c.cargo || c.processo, // Mostrando Cargo ou Processo no subtitulo
          original: c // Guardar objeto original se precisar
        });
      }
    });

    setColumns(newColumns);
  };

  const findColumn = (cardId) => Object.keys(columns).find((key) => columns[key].some((item) => item.id === cardId));

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeCardId = active.id;
    const overColumnId = over?.id;

    if (!overColumnId) { setActiveId(null); return; }

    const sourceColumn = findColumn(activeCardId);
    if (sourceColumn === overColumnId) { setActiveId(null); return; }

    // Atualização Otimista
    const oldColumns = JSON.parse(JSON.stringify(columns));
    setColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]];
      const destItems = [...prev[overColumnId]];
      const cardIndex = sourceItems.findIndex(i => i.id === activeCardId);
      const [movedCard] = sourceItems.splice(cardIndex, 1);

      // Atualizar objeto visualmente
      destItems.push(movedCard);
      return { ...prev, [sourceColumn]: sourceItems, [overColumnId]: destItems };
    });

    setActiveId(null);

    // Persistência no Supabase
    try {
      const newStatus = REVERSE_STATUS_MAP[overColumnId];
      if (!newStatus) throw new Error('Status mapeado não encontrado para coluna: ' + overColumnId);

      const { error } = await supabase
        .from('candidatos')
        .update({ status: newStatus })
        .eq('id', activeCardId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status do candidato:', error);
      // Reverter erro silmplesmente recarregando ou voltando estado (aqui vamos de reload pra garantir consistencia)
      fetchCandidates();
      alert('Falha ao atualizar status. A página será recarregada.');
    }
  };

  const activeItem = activeId ? Object.values(columns).flat().find(i => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-140px)] animate-fadeIn flex flex-col relative">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fluxo de Convocação</h2>
          <p className="text-slate-500 text-sm">
            Gerenciando fluxo: <strong className="text-blue-600">{processName}</strong>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex overflow-x-auto pb-4 custom-scrollbar">
            <KanbanColumn id="aguardando_envio" title="Classificados / Aguardando" items={columns.aguardando_envio} colorHeader="bg-slate-200" />
            <KanbanColumn id="em_analise" title="Em Análise Documental" items={columns.em_analise} colorHeader="bg-blue-200" />
            <KanbanColumn id="pendencia" title="Pendência / Recurso" items={columns.pendencia} colorHeader="bg-orange-200" />
            <KanbanColumn id="homologado" title="Homologado / Contratado" items={columns.homologado} colorHeader="bg-emerald-200" />
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