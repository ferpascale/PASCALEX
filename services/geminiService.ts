import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CaseFile, JudgeAnalysis } from "../types";

// PEGÁ TU CLAVE DIRECTAMENTE ACÁ PARA PROBAR
const API_KEY_MANUAL = "TU_CLAVE_AQUÍ_QUE_TERMINA_EN_M-5g"; 

export const analyzeAsJudge = async (file: CaseFile): Promise<JudgeAnalysis> => {
  // Intentamos leer de Vercel, y si no, usamos la manual
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || API_KEY_MANUAL;

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          complianceStatus: { type: SchemaType.BOOLEAN },
          observations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          riskAnalysis: { type: SchemaType.STRING },
        },
        required: ["summary", "complianceStatus"],
      },
    },
  });

  const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;

  const result = await model.generateContent([
    "Analizá este documento judicial laboral argentino.",
    { inlineData: { data: base64Data, mimeType: "application/pdf" } }
  ]);

  return JSON.parse(result.response.text());
};
