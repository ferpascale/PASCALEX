import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CaseFile, JudgeAnalysis } from "../types";

// Usamos la variable de entorno de Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeAsJudge = async (file: CaseFile): Promise<JudgeAnalysis> => {
  // Usamos el modelo estable 1.5 Pro que es el mejor para PDFs
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
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

  const prompt = `Actuá como un experto en derecho laboral argentino. 
  Analizá este documento (Tipo: ${file.type}) de forma exhaustiva. 
  Buscá montos, fechas, multas (L. 24013, 25323) y fraudes (Art. 29 LCT).`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf",
      },
    },
  ]);

  return JSON.parse(result.response.text());
};
