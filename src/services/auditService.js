import { supabase } from '../lib/supabaseClient';

/**
 * Logs an action to the audit_logs table.
 * @param {string} operation - The action type (e.g., 'CREATE', 'UPDATE', 'DELETE').
 * @param {string} tableName - The table or entity affected (e.g., 'processos', 'candidatos').
 * @param {string} details - Human-readable description of the action.
 * @param {object} oldData - (Optional) Data before change.
 * @param {object} newData - (Optional) Data after change.
 */
export const logAction = async (operation, tableName, details, oldData = null, newData = null) => {
    try {
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;

        const payload = {
            operation,
            table_name: tableName,
            record_id: newData?.id || oldData?.id || null,
            old_data: oldData,
            new_data: newData,
            performed_by: userId,
            details: details
        };

        // Attempt to insert into audit_logs
        // Note: Ideally this should be handled by Database Triggers for reliability,
        // but frontend logging adds context like "details" that DB might not know.
        const { error } = await supabase
            .from('audit_logs')
            .insert([payload]);

        if (error) {
            console.error('Erro ao gravar log de auditoria:', error);
        }
    } catch (err) {
        console.error('Falha interna ao tentar logar auditoria:', err);
    }
};
