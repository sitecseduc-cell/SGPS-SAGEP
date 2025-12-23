import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { supabase } from '../lib/supabaseClient';
import { Plus, X, Save } from 'lucide-react'; // Ícones novos

const INITIAL_COLUMNS = {
  aguardando_envio: [],
  em_analise: [],
  pendencia: [],
  homologado: []
};

export default function Kanban() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDate, setNewCardDate] = useState('');

  useEffect(() => {
    fetchKanbanCards();
  }, []);

  const fetchKanbanCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('kanban_cards').select('*');
      if (error) throw error;

      const newColumns = { aguardando_envio: [], em_analise: [], pendencia: [], homologado: [] };
      data.forEach(card => {
        // Mapeamento de legado se necessário, ou usar direto se o banco já tiver os status novos
        // Se status não existir nas colunas novas, joga para a primeira (Aguardando Envio)
        if (newColumns[card.status]) {
          newColumns[card.status].push(card);
        } else {
          // Mapeamento implícito de legado
          if (card.status === 'planejamento') newColumns.aguardando_envio.push(card);
          else if (card.status === 'publicado') newColumns.em_analise.push(card);
          else if (card.status === 'analise') newColumns.em_analise.push(card);
          else if (card.status === 'homologacao') newColumns.homologado.push(card);
          else newColumns.aguardando_envio.push(card);
        }
      });
      setColumns(newColumns);
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle) return;

    try {
      const newCard = {
        title: newCardTitle,
        date: newCardDate || new Date().toLocaleDateString('pt-BR'),
        status: 'aguardando_envio'
      };

      const { data, error } = await supabase.from('kanban_cards').insert([newCard]).select();

      if (error) throw error;

      if (data) {
        setColumns(prev => ({
          ...prev,
          aguardando_envio: [...prev.aguardando_envio, data[0]]
        }));
        setShowModal(false);
        setNewCardTitle('');
        setNewCardDate('');
      }
    } catch (error) {
      alert('Erro ao criar card: ' + error.message);
    }
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

    const oldColumns = JSON.parse(JSON.stringify(columns));

    setColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]];
      const destItems = [...prev[overColumnId]];
      const cardIndex = sourceItems.findIndex(i => i.id === activeCardId);
      const [movedCard] = sourceItems.splice(cardIndex, 1);
      const updatedCard = { ...movedCard, status: overColumnId };
      destItems.push(updatedCard);
      return { ...prev, [sourceColumn]: sourceItems, [overColumnId]: destItems };
    });

    setActiveId(null);

    try {
      const { error } = await supabase.from('kanban_cards').update({ status: overColumnId }).eq('id', activeCardId);
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao mover card no banco:', error);
      setColumns(oldColumns);
    }
  };

  const activeItem = activeId ? Object.values(columns).flat().find(i => i.id === activeId) : null;

  return (
    <div className="h-[calc(100vh-140px)] animate-fadeIn flex flex-col relative">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Convocação & Análise</h2>
          <p className="text-slate-500 text-sm">Validar e Homologar candidatos convocados.</p>
        </div>

        {/* BOTÃO ADICIONAR CARD */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
        >
          <Plus size={18} /> <span>Novo Candidato</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex overflow-x-auto pb-4 custom-scrollbar">
            <KanbanColumn id="aguardando_envio" title="Aguardando Envio" items={columns.aguardando_envio} colorHeader="bg-slate-200" />
            <KanbanColumn id="em_analise" title="Em Análise" items={columns.em_analise} colorHeader="bg-blue-200" />
            <KanbanColumn id="pendencia" title="Pendência" items={columns.pendencia} colorHeader="bg-orange-200" />
            <KanbanColumn id="homologado" title="Homologado" items={columns.homologado} colorHeader="bg-emerald-200" />
          </div>
          <DragOverlay>
            {activeItem ? <div className="opacity-90 rotate-3 scale-105 pointer-events-none"><KanbanCard id={activeItem.id} title={activeItem.title} date={activeItem.date} color="border-blue-500" /></div> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* MODAL SIMPLIFICADO PARA CRIAR CARD */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Novo Item do Kanban</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCard} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                <input
                  autoFocus
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newCardTitle}
                  onChange={e => setNewCardTitle(e.target.value)}
                  placeholder="Ex: PSS Psicologia"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Data (Texto)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newCardDate}
                  onChange={e => setNewCardDate(e.target.value)}
                  placeholder="Ex: 25/12/2025"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                <Save size={18} /> Criar Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}