import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export const profileService = {

  // --- PERFIS (ROLES) ---

  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return []; // Fail gracefully
    }
    return data;
  },

  async createRole(role) {
    const id = role.id || role.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    const { data, error } = await supabase
      .from('roles')
      .insert([{
        id,
        name: role.name,
        description: role.description,
        color: role.color
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRole(id, updates) {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRole(id) {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },


  // --- REGRAS DO SISTEMA ---

  async getRules() {
    const { data, error } = await supabase
      .from('access_rules')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.warn('Error fetching rules:', error);
      return [];
    }
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

    if (error) {
      console.warn('Error fetching permissions:', error);
      return {};
    }

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

  // --- ESTATÍSTICAS E ATIVIDADE ---

  async getRoleUserCounts() {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) throw error;

      const { data: roles } = await supabase
        .from('roles')
        .select('id, name');

      if (!profiles || !roles) return [];

      const counts = {};
      profiles.forEach(p => {
        const r = p.role || 'servidor';
        counts[r] = (counts[r] || 0) + 1;
      });

      return roles.map(r => ({
        id: r.id,
        name: r.name,
        count: counts[r.id] || 0
      }));
    } catch (error) {
      console.error('Error fetching role counts:', error);
      return [];
    }
  },

  async getUserActivity(page = 1, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, (page - 1) * limit + limit - 1);

      if (error) throw error;
      if (!data) return [];

      // Mapper para o formato da UI
      return data.map(log => ({
        type: log.operation === 'INSERT' ? 'user' : (log.operation === 'DELETE' ? 'security' : 'role'),
        title: `Ação: ${log.operation}`,
        description: `Alteração em ${log.table_name}`,
        timestamp: log.created_at
      }));

    } catch (error) {
      console.error("Erro buscas logs:", error);
      // Mock data for UI demonstration if backend not ready
      return [
        { type: 'role', title: 'Permissão Atualizada', description: 'Alteração nas regras de Admin', timestamp: new Date().toISOString() },
        { type: 'user', title: 'Novo Usuário', description: 'Novo membro cadastrado no sistema', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { type: 'security', title: 'Política de Senha', description: 'Requisitos de segurança atualizados', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      ];
    }
  },

  // --- USUÁRIOS E PERFIS ---

  async getUsers(page = 1, limit = 50, search = '') {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, updated_at', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('full_name')
      .range(from, to);

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    const users = data.map(u => ({
      id: u.id,
      name: u.full_name || 'Usuário sem nome',
      email: u.email || 'Email oculto',
      role: u.role || 'servidor',
      status: 'ativo', // Placeholder - in a real app, this would come from auth or a status column
      lastAccess: u.updated_at ? new Date(u.updated_at).toLocaleDateString() : 'Nunca'
    }));

    return { users, total: count };
  },

  async updateUserRole(userId, newRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  async createUser(userData) {
    // ⚠️ CRITICAL: Use a separate client instance to avoid logging out the current admin
    const tempSupabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          role: userData.role // Trigger will catch this!
        },
      },
    });

    if (authError) throw authError;

    // Optional: Log action (Audit)
    try {
      await supabase.rpc('log_audit_event', {
        p_operation: 'INSERT',
        p_table_name: 'profiles',
        p_record_id: authData.user?.id || null,
        p_old_data: null,
        p_new_data: { email: userData.email, role: userData.role }
      });
    } catch (e) { console.warn("Audit log failed", e); }

    return authData;
  }
};
