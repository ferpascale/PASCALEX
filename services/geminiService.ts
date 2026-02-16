import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeAsJudge = async (file: any) => {
  // 1. Forzamos la obtención de la clave en el momento del click
  let apiKey = localStorage.getItem('PASCALEX_KEY') || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "undefined") {
    apiKey = window.prompt("PASCALEX: Ingresá tu API Key de Gemini (Google AI Studio)");
    if (apiKey) localStorage.setItem('PASCALEX_KEY', apiKey);
  }

  if (!apiKey) {
    throw new Error("API Key requerida");
  }

  // 2. LA CLAVE SE PASA JUSTO ANTES DE USARLA
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;

  const result = await model.generateContent([
    "Analizá esta demanda laboral. Respondé en formato JSON con los campos: summary, complianceStatus, observations, riskAnalysis.",
    { inlineData: { data: base64Data, mimeType: "application/pdf" } }
  ]);

  return JSON.parse(result.response.text());
};
