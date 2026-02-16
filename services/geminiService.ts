
import { GoogleGenAI, Type } from "@google/genai";
import { CaseFile, JudgeAnalysis, Question } from "../types";

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

// Prompt para Análisis de Piezas Individuales (Demanda/Contestación)
const EXHAUSTIVE_PIECE_INSTRUCTION = `Rol: Asesor Jurídico Experto - Fuero Laboral Argentino (LCT 20.744 / Ley 18.345).

OBJETIVO: Análisis quirúrgico de la demanda o contestación.
1. DETALLE DE LIQUIDACIÓN: Desglosar rubros salariales, indemnizatorios y multas (Art. 8, 9, 10, 15 L. 24.013; Art. 1, 2 L. 25.323; Art. 80 LCT). Identificar Base de Cálculo (MRNMHyB).
2. REQUISITOS FORMALES: Control estricto del Art. 65 LO (Demanda) o Art. 68 LO (Contestación).
3. HECHOS Y DERECHO: Identificar plataforma fáctica, inconstitucionalidades planteadas y prescripciones.

REGLA: No generes despachos. Si falta un dato, escribe [DATO NO ENCONTRADO]. Usa Markdown profesional.`;

// Prompt solicitado para Apertura a Prueba
const PRUEBA_SYSTEM_INSTRUCTION = `🎯 Objetivo: Asistente Judicial para Apertura a Prueba (Justicia Nacional del Trabajo, Argentina).
Este motor asiste en la gestión eficiente de medios probatorios conforme a la Ley 18.345 (Arts. 65 a 95) y el CPCCN.

TAREAS CRÍTICAS:
1. 📌 IDENTIFICAR PRUEBAS: Listar pruebas ofrecidas por Actor (Demanda), Demandado (Contestación) y Actor (Traslado Art. 71).
2. ⚖️ EVALUAR PERTINENCIA: Analizar si la prueba es conducente para los hechos controvertidos. Sugerir desestimación de pruebas improcedentes o dilatorias.
3. 📊 VALORACIÓN TÉCNICA: Explicar idoneidad de testigos (Art. 90) y peritos. Evaluar eficacia de la prueba instrumental y confesional.
4. 🛠️ SUGERENCIA DE PRODUCCIÓN: Indicar qué pruebas son más relevantes para la resolución del caso según la sana crítica.

📝 ESTILO: Lenguaje claro, técnico judicial, estructurado con emojis. No redactes el despacho final, redacta el INFORME TÉCNICO para el Juez sobre cómo debería abrirse la prueba.`;

export const analyzeAsJudge = async (file: CaseFile): Promise<JudgeAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  
  // Selección de instrucción según el tipo de tarea
  const isPruebaTask = file.type === 'prueba_ofrecida' || file.type === 'expediente_completo';
  const instruction = isPruebaTask ? PRUEBA_SYSTEM_INSTRUCTION : EXHAUSTIVE_PIECE_INSTRUCTION;

  if (file.additionalFiles && file.additionalFiles.length > 0) {
    parts.push({ text: `ANÁLISIS DE EXPEDIENTE - TIPO: ${file.type.toUpperCase()}` });
    file.additionalFiles.forEach(f => {
      parts.push({ text: `PIEZA: ${f.label}` });
      parts.push({ inlineData: { data: f.content.split(',')[1] || f.content, mimeType: "application/pdf" } });
    });
  } else {
    parts.push({ text: `ANÁLISIS DE PIEZA INDIVIDUAL: ${file.type.toUpperCase()}` });
    parts.push({ inlineData: { data: file.content.split(',')[1] || file.content, mimeType: "application/pdf" } });
  }

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: instruction,
        thinkingConfig: { thinkingBudget: 28000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Informe técnico detallado en Markdown" },
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

export const generatePliego = async (analysis: any, type: 'Posición' | 'Testigo'): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generar PLIEGO DE ${type.toUpperCase()} (Art. 87 LO) basado en hechos controvertidos: ${JSON.stringify(analysis)}. Preguntas asertivas: 'Para que jure como es cierto que...'.`;
  
  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "Especialista en interrogatorios laborales asertivos.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING }, text: { type: Type.STRING } },
            required: ["id", "text"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};
