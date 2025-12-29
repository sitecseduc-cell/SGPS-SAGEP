// src/services/candidatos.js
// Service functions for interacting with the 'candidatos' table in Supabase.
// This abstracts Supabase calls away from UI components.

import { supabase } from '../lib/supabaseClient';

/** Fetch all candidates */
export const fetchCandidatos = async () => {
  const { data, error } = await supabase.from('candidatos').select('*');
  if (error) throw error;
  return data;
};

/** Fetch candidates for Kanban (cards) */
export const fetchKanbanCards = async () => {
  const { data, error } = await supabase.from('kanban_cards').select('*');
  if (error) throw error;
  return data;
};

/** Create a new candidate */
export const createCandidato = async (candidato) => {
  const { data, error } = await supabase
    .from('candidatos')
    .insert([candidato])
    .select();

  if (error) throw error;
  return data[0];
};

/** Update candidate status (used by Kanban) */
export const updateCandidatoStatus = async (id, newStatus) => {
  const { error } = await supabase.from('candidatos').update({ status: newStatus }).eq('id', id);
  if (error) throw error;
  return true;
};

/** Update Kanban card status */
export const updateKanbanCardStatus = async (id, newStatus) => {
  const { error } = await supabase.from('kanban_cards').update({ status: newStatus }).eq('id', id);
  if (error) throw error;
  return true;
};

/** Fetch a single candidate by ID */
export const getCandidatoById = async (id) => {
  const { data, error } = await supabase.from('candidatos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};
