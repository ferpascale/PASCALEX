import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeAsJudge = async (file: any): Promise<any> => {
  // 1. Buscamos la clave (Vercel o Manual)
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('PASCALEX_KEY');

  if (!apiKey || apiKey === "undefined") {
    apiKey = window.prompt("PASCALEX: Ingresá tu API Key de Gemini:");
    if (apiKey) localStorage.setItem('PASCALEX_KEY', apiKey);
  }

  if (!apiKey) throw new Error("API Key requerida");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;

  try {
    const result = await model.generateContent([
      "Analizá esta demanda laboral argentina. Respondé en JSON con: summary, complianceStatus, observations, riskAnalysis.",
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error en el análisis:", error);
    throw error;
  }
};

// Función simple para el pliego
export const generatePliego = async (analysis: any, type: string): Promise<any[]> => {
  return [{ id: "1", text: "Pregunta de prueba para el pliego de " + type }];
};
