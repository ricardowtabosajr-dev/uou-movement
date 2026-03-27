
import { GoogleGenAI } from "@google/genai";

export const generateConsentTerm = async (userData: any) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey === 'SUA_GEMINI_KEY_AQUI') {
    return "Configuração de IA pendente. Por favor, insira a VITE_GEMINI_API_KEY no arquivo .env.local.";
  }

  const genAI = new GoogleGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Erro ao gerar o termo.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro de conexão com o serviço jurídico de IA.";
  }
};

export const getAdminInsights = async (stats: any) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey === 'SUA_GEMINI_KEY_AQUI') {
    return "Insights indisponíveis (Chave de IA não configurada).";
  }

  const genAI = new GoogleGenAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Atue como um analista de dados estratégico. Analise os seguintes dados do SaaS Chamado UOU MOVEMENT:
  ${JSON.stringify(stats)}
  Forneça 3 insights rápidos e uma recomendação executiva curta para melhorar a conversão de inscrições e o engajamento espiritual. 
  Mantenha o tom respeitoso e focado em resultados ministeriais.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Sem insights no momento.";
  } catch (error) {
    return "Não foi possível carregar os insights estratégicos.";
  }
};
