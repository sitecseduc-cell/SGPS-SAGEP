import { supabase } from '../lib/supabaseClient';

export const fetchProcessos = async () => {
    const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createProcesso = async (processoData) => {
    const { data, error } = await supabase
        .from('processos')
        .insert([{
            ...processoData,
            fase_atual: 'Planejamento',
            progresso: 0
        }])
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
