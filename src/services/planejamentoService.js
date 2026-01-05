import { supabase } from '../lib/supabaseClient';

export const planejamentoService = {
    /**
     * Busca todas as vagas do sistema
     * @returns {Promise<Array>} Lista de vagas
     */
    async getVagas() {
        const { data, error } = await supabase
            .from('vagas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar vagas:', error);
            throw error;
        }
        return data || [];
    },

    /**
     * Cria uma nova vaga
     * @param {Object} vaga
     */
    async createVaga(vaga) {
        const { data, error } = await supabase
            .from('vagas')
            .insert([vaga])
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Atualiza uma vaga existente
     * @param {string} id
     * @param {Object} updates
     */
    async updateVaga(id, updates) {
        const { data, error } = await supabase
            .from('vagas')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Remove uma vaga
     * @param {string} id
     */
    async deleteVaga(id) {
        const { error } = await supabase
            .from('vagas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
