import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa o cliente Gemini apenas se a chave existir
let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

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
                fases_previstas: ["Inscrição", "Homologação", "Recursos", "Resultado Final"]
            };
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
        Analise o seguinte texto de um Edital de Processo Seletivo (PSS) e extraia as seguintes informações em formato JSON estrito:
        - "nome": Um nome curto e sugestivo para o processo.
        - "descricao": Um resumo breve do objetivo do edital.
        - "inicio": Data de início das inscrições (formato YYYY-MM-DD). Se não achar, use a data de hoje.
        - "fim": Data de fim das inscrições (formato YYYY-MM-DD). Se não achar, use 30 dias após o início.
        
        Texto do Edital:
        ${editalText.substring(0, 30000)} // Limita tamanho para caber no contexto
        
        Retorne APENAS o JSON válido, sem markdown.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Limpeza básica se o modelo retornar md
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(text);

        } catch (error) {
            console.error("Erro ao analisar edital com Gemini:", error);
            throw new Error("Falha na análise inteligente do Edital.");
        }
    }
};
