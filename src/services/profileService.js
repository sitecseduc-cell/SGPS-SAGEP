import { supabase } from '../lib/supabaseClient';

export const profileService = {
  
  // --- REGRAS DO SISTEMA ---
  
  async getRules() {
    const { data, error } = await supabase
      .from('access_rules')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addRule(rule) {
    // Garante ID único formatado
    const id = rule.id || rule.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    
    const { data, error } = await supabase
      .from('access_rules')
      .insert([{
        id,
        name: rule.name,
        description: rule.description,
        category: rule.category
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRule(ruleId) {
    const { error } = await supabase
      .from('access_rules')
      .delete()
      .eq('id', ruleId);

    if (error) throw error;
    return true;
  },

  // --- MATRIZ DE PERMISSÕES ---

  async getPermissions() {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*');

    if (error) throw error;

    // Transforma em objeto: { 'admin': ['rule1', 'rule2'], 'gestor': [...] }
    const matrix = {};
    data.forEach(p => {
        if (!matrix[p.role]) matrix[p.role] = [];
        matrix[p.role].push(p.rule_id);
    });
    
    return matrix;
  },

  async togglePermission(role, ruleId, shouldAdd) {
    if (shouldAdd) {
      const { error } = await supabase
        .from('role_permissions')
        .insert([{ role, rule_id: ruleId }]);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .match({ role, rule_id: ruleId });
      if (error) throw error;
    }
    return true;
  },

  // --- USUÁRIOS E PERFIS ---

  async getUsers() {
    // Busca perfis da tabela pública 'profiles'
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, updated_at');
      
    if (error) throw error;
    
    return data.map(u => ({
        id: u.id,
        name: u.full_name || 'Usuário sem nome',
        email: u.email || 'Email oculto',
        role: u.role || 'servidor',
        status: 'ativo', // Supabase não expõe status de sessão facilmente via API pública, assumimos ativo
        lastAccess: new Date(u.updated_at).toLocaleDateString()
    }));
  },

  async updateUserRole(userId, newRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
    return true;
  }
};
