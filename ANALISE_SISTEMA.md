# Relatório de Análise do Sistema

## 1. Diagnóstico Geral
O sistema apresenta uma interface moderna ("Glassmorphism") e funcionalidades avançadas de IA, mas sofre de **inconsistências arquiteturais** que podem dificultar a manutenção futura. O código mistura padrões antigos com novos, e há duplicidade de componentes.

## 2. Inconsistências Identificadas

### 🔴 Arquitetura e Dados
*   **Acesso ao Banco Misto:** Algumas partes usam `services/` (ex: `AuthContext`), mas páginas principais (`Processos.jsx`, `PesquisaCandidatos.jsx`) fazem chamadas diretas ao Supabase. Isso quebra o princípio de separação de responsabilidades.
*   **Modelagem de Vagas Confusa:** Existem dois modais para a mesma finalidade:
    *   `ModalNovaVaga.jsx` (Campos: município, dre, escola, cargo, qtd)
    *   `NewVacancyModal.jsx` (Campos: matvin, servidor, vacancia, status...)
    *   *Risco:* Dados sendo salvos em formatos diferentes ou tabelas diferentes podem gerar relatórios errados.

### 🟡 UX e Interface
*   **Navegação:** O layout às vezes sofre com sobreposição (z-index), como visto no Modal de Análise.
*   **Feedback de IA:** A IA é poderosa, mas o usuário não tem um histórico claro do que foi analisado além do momento imediato (Corrigido parcialmente com a última atualização de metadados).

## 3. Plano de Melhorias e Adições

### ✨ Melhorias Imediatas (Refatoração)
1.  **Unificar Modais de Vagas:** Decidir qual modelo de dados é o oficial e manter apenas UM componente de criação/edição.
2.  **Camada de Serviço (Service Layer):** Mover todas as queries do Supabase (`.from('tabela').select()`) que estão soltas nas `pages` para arquivos dedicados em `services/`.
    *   *Benefício:* Se mudar uma regra de negócio, altera-se em um só lugar.

### 🚀 Novas Funcionalidades Sugeridas

#### A. Módulo de Convocação Inteligente (AI)
Usar a IA para cruzar os dados de **Vagas Abertas** vs **Lista de Classificação**.
*   **Funcionalidade:** O sistema sugere automaticamente a lista de convocação para uma cidade/cargo específico.
*   **Diferencial:** Analisa critérios de desempate complexos que humanos podem errar.

#### B. Portal do Candidato (Público)
Atualmente o sistema parece focado na gestão interna.
*   **Adição:** Criar uma rota `/public/acompanhamento` onde o candidato digita o CPF e vê seu status sem precisar de login de servidor.

#### C. Auditoria de IA
Registrar no banco sempre que a IA tomar uma decisão ou fizer uma análise crítica (ex: "IA sugeriu rejeitar documento X"). Isso garante transparência.

#### D. Dashboard Executivo
Melhorar a página inicial (`Dashboard.jsx`) para mostrar métricas reais de:
*   Tempo médio de contratação.
*   Gargalos no fluxo (onde os processos travam).

---

## Próximos Passos Recomendados
1.  **Refatorar `Processos.jsx`** para usar `services/processos.js` (Centralizar lógica).
2.  **Implementar a "Convocação Inteligente"** como o próximo grande diferencial de IA.
