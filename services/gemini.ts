
import { GoogleGenAI } from "@google/genai";

export const generateConsentTerm = async (userData: any) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return "Configuração de IA pendente. Por favor, insira a VITE_GEMINI_API_KEY no arquivo .env.local.";
  }

  const ai = new GoogleGenAI(apiKey);
  const prompt = `Gere um Termo de Consentimento e Responsabilidade altamente profissional e detalhado para o programa "Chamado UOU MOVEMENT". 
  Este é um treinamento intensivo de simulação e preparo missionário para contextos de risco, envolvendo desafios físicos extremos, privação de sono, estresse emocional e exercícios de prontidão espiritual.
  
  DADOS DO RECRUTA:
  Nome: ${userData.fullName}
  Nome Social: ${userData.nickname || 'Não informado'}
  Nascimento: ${userData.birthDate}
  CPF: ${userData.cpf}
  Tipo Sanguíneo: ${userData.bloodType}
  Condições de Saúde: ${userData.healthConditions || 'Nenhuma declarada'}
  Alergias: ${userData.allergies || 'Nenhuma declarada'}
  
  O termo deve seguir as normas da LGPD brasileira e incluir cláusulas específicas sobre:
  1. Natureza da Atividade: Treinamento tático e espiritual de alta intensidade.
  2. Declaração de Aptidão Física: O participante assume os riscos de lesões e cansaço extremo.
  3. Tratamento de Dados (LGPD): Finalidade de segurança médica e logística.
  4. Autorização de Uso de Imagem e Voz: Para fins de registro ministerial do UOU MOVEMENT.
  5. Confidencialidade: Proteção de locais e protocolos de segurança ensinados.
  6. Emergências Médicas: Autorização para intervenção e transporte em caso de necessidade.
  
  Formate como Markdown, com tom sério, tático e jurídico.`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') return "Insights indisponíveis (Chave de IA não configurada).";

  const ai = new GoogleGenAI(apiKey);
  const prompt = `Atue como um analista de dados estratégico. Analise os seguintes dados do SaaS Chamado UOU MOVEMENT:
  ${JSON.stringify(stats)}
  Forneça 3 insights rápidos e uma recomendação executiva curta para melhorar a conversão de inscrições e o engajamento espiritual. 
  Mantenha o tom respeitoso e focado em resultados ministeriais.`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Sem insights no momento.";
  } catch (error) {
    return "Não foi possível carregar os insights estratégicos.";
  }
};
