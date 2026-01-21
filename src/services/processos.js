import { supabase } from '../lib/supabaseClient';

export const fetchProcessos = async ({ signal } = {}) => {
    let query = supabase
        .from('processos')
        .select('*') // Select all to ensure we get ai_metadata and others
        .order('created_at', { ascending: false });

    if (signal) {
        query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const createProcesso = async (processoData) => {
    // Ensure defaults
    const payload = {
        ...processoData,
        fase_atual: processoData.fase_atual || 'Planejamento',
        progresso: processoData.progresso || 0,
        // ai_metadata is optional and passed in processoData if exists
    };

    const { data, error } = await supabase
        .from('processos')
        .insert([payload])
        .select();

    if (error) throw error;
    return data[0];
};

export const updateProcesso = async (id, processoData) => {
    const { data, error } = await supabase
        .from('processos')
        .update(processoData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

export const deleteProcesso = async (id) => {
    const { error } = await supabase.from('processos').delete().eq('id', id);
    if (error) throw error;
    return true;
};
