import { GoogleGenerativeAI } from "@google/generative-ai";

const rawKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || "";
const API_KEY = rawKey.replace(/['"]/g, '').trim();

// Inicializa o cliente Gemini apenas se a chave existir
let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

// MODELO ESCOLHIDO (Baseado na lista disponível do usuário)
const MODEL_NAME = "gemini-flash-latest";

export const GeminiService = {

    /**
     * Análise Profunda do Edital (RAG Zero-Shot)
     * Extrai dados estruturados complexos e insights.
     */
    async analyzeEditalDeep(editalText) {
        if (!genAI) throw new Error("API Key não configurada");

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const prompt = `
            ATUE COMO UM ESPECIALISTA EM CONCURSOS E PROCESSOS SELETIVOS PÚBLICOS.
            Analise o seguinte Edital Completo e extraia informações estratégicas.

            TEXTO DO EDITAL:
            ${editalText.substring(0, 30000)}

            RETORNE APENAS UM JSON VÁLIDO (SEM MARKDOWN, SEM EXPLICAÇÕES) COM ESTA ESTRUTURA:
            {
                "dados_basicos": {
                    "nome": "Nome do PSS",
                    "resumo": "Resumo executivo de 2 parágrafos",
                    "banca": "Nome da banca ou Comissão",
                    "receita_estimada": "Valor ou 'Não informado'",
                    "vagas_total": "Número ou 'CR'"
                },
                "datas_importantes": [
                    { "evento": "Início Inscrição", "data": "YYYY-MM-DD" },
                    { "evento": "Fim Inscrição", "data": "YYYY-MM-DD" },
                    { "evento": "Prova/Análise", "data": "YYYY-MM-DD" },
                    { "evento": "Resultado Final", "data": "YYYY-MM-DD" }
                ],
                "requisitos_principais": ["Requisito 1", "Requisito 2"],
                "cargos": [
                    { "nome": "Cargo A", "vagas": "X", "salario": "R$ 0,00" },
                    { "nome": "Cargo B", "vagas": "Y", "salario": "R$ 0,00" }
                ],
                "pontos_atencao": ["Item polêmico 1", "Risco de prazo 2"],
                "sugestoes_ia": ["Ideia para melhorar divulgação", "Dica para etapa de análise"]
            }
            `;

            const result = await model.generateContent(prompt);
            let text = (await result.response).text();

            // Limpeza Agressiva para garantir JSON
            text = text.replace(/```json/g, '').replace(/```/g, '');
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                text = text.substring(firstBrace, lastBrace + 1);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("Deep Analysis Error:", error);
            throw new Error(`Falha na análise da IA: ${error.message}`);
        }
    },

    /**
     * Chat com o Documento
     */
    async chatDocument(message, documentText, history = []) {
        if (!genAI) return "Erro: API Key não configurada.";

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            // Limit context to avoid token overflow, keep recent history
            const context = `
            CONTEXTO: Você está analisando um Edital de Processo Seletivo (PDF extraído).
            Responda APENAS com base no texto abaixo. Se não estiver no texto, diga que não encontrou.
            
            TRECHO DO DOCUMENTO (Primeiros 30k caracteres):
            ${documentText.substring(0, 30000)}
            
            HISTÓRICO DA CONVERSA:
            ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
            
            USUÁRIO: ${message}
            RESPOSTA (Seja direto e cite a seção do edital se possível):
            `;

            const result = await model.generateContent(context);
            return (await result.response).text();
        } catch (error) {
            return "Não consegui ler o documento para responder a isso.";
        }
    },

    /**
     * Mantendo compatibilidade com código antigo (Wrapper para Deep)
     */
    async analyzeEdital(editalText) {
        // Redireciona para o deep
        try {
            const data = await this.analyzeEditalDeep(editalText);

            // Formata description rica
            const cargosStr = data.cargos?.map(c => `- ${c.nome} (${c.vagas} vagas)`).join('\n') || '';
            const desc = `${data.dados_basicos.resumo}\n\nCARGOS:\n${cargosStr}\n\nPONTOS DE ATENÇÃO:\n${data.pontos_atencao.join('\n- ')}`;

            return {
                nome: data.dados_basicos.nome,
                descricao: desc,
                inicio: data.datas_importantes.find(d => d.evento.includes("Início"))?.data || new Date().toISOString().split('T')[0],
                fim: data.datas_importantes.find(d => d.evento.includes("Fim"))?.data || new Date().toISOString().split('T')[0],
                cargos: data.cargos.map(c => c.nome),
                etapas: data.datas_importantes.map(d => d.evento),
                raw_data: data // Passa o objeto completo para quem quiser usar
            };
        } catch (e) {
            console.error("Fallback to legacy analysis due to error:", e);
            // Dummy fallback se o deep falhar muito feio
            return {
                nome: "Edital Processado (Erro IA)",
                descricao: "Não foi possível realizar a análise profunda.",
                inicio: new Date().toISOString().split('T')[0],
                fim: new Date().toISOString().split('T')[0],
                cargos: [],
                etapas: []
            };
        }
    },

    /**
     * Chat interativo com contexto do sistema (Global Chatbot).
     */
    async chat(message, systemContext = '') {
        if (!genAI) {
            return "⚠️ A chave de API do Gemini não está configurada ou foi lida incorretamente. Verifique o arquivo .env";
        }

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            const prompt = `
            Você é o Assistente Virtual do CPS (Sistema de Gestão de Processos Seletivos do Pará).
            Sua missão é ajudar candidatos e servidores.
            
            CONTEXTO DO SISTEMA (Dados em Tempo Real):
            ${systemContext}
            
            INSTRUÇÕES:
            1. Responda apenas com base no contexto fornecido ou conhecimentos gerais sobre processos seletivos públicos.
            2. Seja cordial, direto e profissional.
            3. Use Markdown para formatar a resposta (negrito, listas).
            
            USUÁRIO: ${message}
            RESPOSTA:
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Erro no Chat Gemini:", error);
            return `Desculpe, tive um problema técnico ao processar sua mensagem. (${error.message || 'Erro desconhecido'})`;
        }
    },

    /**
     * Módulo de Convocação Inteligente
     * Cruza vagas abertas com lista de classificados.
     */
    async generateConvocationSuggestion(vagasDisponiveis, listaCandidatos) {
        if (!genAI) throw new Error("API Key não configurada");

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            // Simplifica os dados para economizar tokens
            const vagasSimples = vagasDisponiveis.map(v => ({
                id: v.id,
                cargo: v.cargo_funcao || v.cargo,
                cidade: v.municipio,
                dre: v.dre
            }));

            const candidatosSimples = listaCandidatos.map(c => ({
                id: c.id,
                nome: c.nome,
                cargo: c.cargo_pretendido || c.cargo, // Tenta pegar o cargo
                cidade: c.localidade || c.cidade,
                pontuacao: c.pontuacao || 'N/A', // Assume pontuação se existir
                status: c.status
            }));

            const prompt = `
            ATUE COMO UM GESTOR DE RH PÚBLICO.
            Seu objetivo é preencher as vagas abertas convocando os melhores candidatos disponíveis.

            REGRAS:
            1. O cargo do candidato DEVE ser compatível com a vaga.
            2. A cidade/localidade DEVE ser compatível (ou próxima).
            3. Priorize candidatos com status 'Classificado'.
            4. Se tiver pontuação, priorize a maior.

            LISTA DE VAGAS ABERTAS:
            ${JSON.stringify(vagasSimples)}

            LISTA DE CANDIDATOS:
            ${JSON.stringify(candidatosSimples)}

            RETORNE UM JSON COM ESTA ESTRUTURA EXATA (SEM MARKDOWN):
            {
                "sugestoes": [
                    {
                        "vaga_id": "ID da vaga",
                        "candidato_id": "ID do candidato escolhido",
                        "motivo": "Explicação curta (ex: 'Maior nota para Belém')",
                        "match_score": 0 a 100
                    }
                ],
                "sem_candidato": ["ID das vagas que sobraram"]
            }
            `;

            const result = await model.generateContent(prompt);
            let text = (await result.response).text();

            text = text.replace(/```json/g, '').replace(/```/g, '');
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                text = text.substring(firstBrace, lastBrace + 1);
            }

            return JSON.parse(text);

        } catch (error) {
            console.error("Erro na Convocação Inteligente:", error);
            throw new Error("Falha ao gerar sugestão de convocação.");
        }
    }
};
