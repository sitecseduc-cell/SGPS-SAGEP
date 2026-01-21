-- Adiciona coluna JSONB para armazenar a análise completa da IA
ALTER TABLE processos 
ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}'::jsonb;

-- Garante que admins possam ver/editar essa coluna (caso RLS seja restritivo)
-- Na verdade a policy 'Admin Manage All' já cobre, mas é bom garantir o refresh do esquema no frontend
COMMENT ON COLUMN processos.ai_metadata IS 'Armazena o JSON bruto da análise da IA (Gemini)';
