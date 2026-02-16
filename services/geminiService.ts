import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CaseFile, JudgeAnalysis } from "../types";

export const analyzeAsJudge = async (file: CaseFile): Promise<JudgeAnalysis> => {
  // 1. Forzamos la obtención de la clave desde el entorno de Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // 2. Validación de seguridad para que no intente ejecutar si la clave no llegó
  if (!apiKey || apiKey === "") {
    console.error("Error crítico: VITE_GEMINI_API_KEY no encontrada en el entorno.");
    throw new Error("La API Key no está configurada. Por favor, realiza un Redeploy en Vercel sin caché.");
  }

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

  // 3. Limpieza del contenido Base64 para el PDF
  const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;

  const prompt = `Actuá como un experto en derecho laboral argentino para el proyecto PASCALEX. 
  Analizá este documento de forma exhaustiva: ${file.type}.
  Identificá: 
  - Monto total de liquidación.
  - Multas (Ley 24.013, 25.323, Art. 80 LCT).
  - Fraudes de registración (Art. 29 LCT).
  - Planteos de inconstitucionalidad.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error en la llamada a Gemini:", error);
    throw error;
  }
};
