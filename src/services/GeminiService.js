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
     * Analisa o texto de um Edital e extrai informações estruturadas.
     * @param {string} editalText - O texto extraído do PDF do edital.
     * @returns {Promise<Object>} - Objeto com os dados extraídos (nome, datas, descrição, etc).
     */
    async analyzeEdital(editalText) {
        if (!genAI) {
            console.warn("Gemini API Key não configurada. Retornando dados mockados.");
            // Mock para testar sem chave
            return {
                nome: "Processo Seletivo (Extraído)",
                inicio: new Date().toISOString().split('T')[0],
                fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                descricao: "Descrição extraída automaticamente do edital (Mock).",
                fases_previstas: ["Inscrição", "Homologação", "Recursos", "Resultado Final"],
                cargos: ["Cargo A", "Cargo B"],
                etapas: ["Etapa 1", "Etapa 2"]
            };
        }

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            const prompt = `
        Analise o texto deste Edital de Processo Seletivo (PSS) e extraia dados estruturados.
        
        Retorne APENAS um JSON com os campos:
        - "nome": Nome sugestivo do PSS (Ex: PSS Educação 2025).
        - "descricao": Resumo de 2 linhas sobre o objetivo.
        - "inicio": Data de início das inscrições (YYYY-MM-DD). Use hoje se não achar.
        - "fim": Data fim das inscrições (YYYY-MM-DD). Use inicio + 30 dias se não achar.
        - "cargos": Array de strings com os nomes dos principais cargos ofertados (Ex: ["Professor", "Merendeira"]).
        - "etapas": Array de strings com as fases do certame (Ex: ["Inscrições", "Prova de Títulos", "Resultado"]).

        Texto do Edital (início):
        ${editalText.substring(0, 25000)}
        
        IMPORTANTE: Responda SOMENTE o JSON válido.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Limpeza básica se o modelo retornar md
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(text);

        } catch (error) {
            console.error("Erro ao analisar edital com Gemini:", error);
            // Mock inteligente em caso de falha real da API (ou falta de cota)
            return {
                nome: "Processo Seletivo (Detectado)",
                descricao: "Falha na análise detalhada. Preencha manualmente.",
                inicio: new Date().toISOString().split('T')[0],
                fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                cargos: ["Cargo Genérico 1", "Cargo Genérico 2"],
                etapas: ["Inscrição", "Análise", "Resultado"]
            };
        }
    },

    /**
     * Chat interativo com contexto do sistema.
     * @param {string} message - Mensagem do usuário.
     * @param {string} systemContext - Contexto injetado (Vagas, FAQs, etc).
     * @returns {Promise<string>} - Resposta do bot.
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
    }
};
