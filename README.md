# CPS (Sistema de Gestão de Processos Públicos)

Sistema moderno para gestão de processos seletivos, candidatos e vagas, desenvolvido com React, Vite e Supabase.

## 🚀 Começando

Siga estas instruções para configurar o projeto no seu ambiente local.

### Pré-requisitos

*   Node.js (versão 18 ou superior recomendada)
*   Conta no Supabase

### 📥 Instalação

1.  Clone o repositório (se aplicável).
2.  Instale as dependências:

```bash
npm install
```

### 🔑 Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado no exemplo abaixo) e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_publica
```

> **Nota**: As chaves devem começar com `VITE_` para serem expostas ao frontend.

### 🗄️ Configuração do Banco de Dados (Supabase)

Para garantir o funcionamento correto de funções, índices de performance e segurança (RLS), você deve executar os scripts de migração no **SQL Editor** do seu painel Supabase.

Execute os arquivos na seguinte ordem (localizados na raiz do projeto):

1.  **`optimized_migration.sql`**: Cria as RPCs (`get_dashboard_stats`, `get_my_profile`) e índices de performance.
2.  **`security_policies.sql`**: Habilita o RLS (Row Level Security) e define as políticas de acesso para `profiles`, `candidatos` e `processos`.

### ⚡ Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O sistema estará acessível em `http://localhost:3000` (ou porta indicada).

### 🧪 Testes e Linting

*   **Linting**: Para verificar o estilo de código:
    ```bash
    npm run lint
    ```
*   **Testes**: Para executar a suíte de testes (Vitest):
    ```bash
    npm test
    ```

### 📦 Build para Produção

Para gerar a versão otimizada para deploy:

```bash
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist`.

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts.
*   **Backend / BaaS**: Supabase (Auth, Database, Realtime).
*   **Mapas**: Leaflet.
*   **PDF**: jsPDF.
