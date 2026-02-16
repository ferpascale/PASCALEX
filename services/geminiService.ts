import { GoogleGenAI, Type } from "@google/genai";
import { CaseFile, JudgeAnalysis, Question } from "../types";

// Usamos la variable de entorno correcta para Vite/Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isRateLimit = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429;
      if (isRateLimit && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  return await fn();
}

const EXHAUSTIVE_PIECE_INSTRUCTION = `Rol: Asesor Jurídico Experto - Fuero Laboral Argentino (LCT 20.744 / Ley 18.345). Analizá el PDF adjunto de forma exhaustiva.`;

const PRUEBA_SYSTEM_INSTRUCTION = `🎯 Objetivo: Asistente Judicial para Apertura a Prueba. Analizá el PDF adjunto para identificar medios probatorios.`;

export const analyzeAsJudge = async (file: CaseFile): Promise<JudgeAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const parts: any[] = [];
  
  const isPruebaTask = file.type === 'prueba_ofrecida' || file.type === 'expediente_completo';
  const instruction = isPruebaTask ? PRUEBA_SYSTEM_INSTRUCTION : EXHAUSTIVE_PIECE_INSTRUCTION;

  // Corregimos la carga de archivos
  if (file.additionalFiles && file.additionalFiles.length > 0) {
    file.additionalFiles.forEach(f => {
      const base64Data = f.content.includes(',') ? f.content.split(',')[1] : f.content;
      parts.push({ inlineData: { data: base64Data, mimeType: "application/pdf" } });
    });
  } else {
    const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;
    parts.push({ inlineData: { data: base64Data, mimeType: "application/pdf" } });
  }

  // Agregamos el texto del prompt al final
  parts.push({ text: `Realizá el análisis de este documento: ${file.type.toUpperCase()}` });

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro", // CAMBIADO: Nombre de modelo válido
      contents: { parts },
      config: {
        systemInstruction: instruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            complianceStatus: { type: Type.BOOLEAN },
            complianceReport: { type: Type.STRING },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAnalysis: { type: Type.STRING },
            normativeCitations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "complianceStatus"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  });
};
