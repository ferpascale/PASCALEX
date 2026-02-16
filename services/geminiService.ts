import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const analyzeAsJudge = async (file: any) => {
  // 1. Intenta leer de Vercel. Si no, busca en el almacenamiento del navegador
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('PASCALEX_KEY');

  // 2. Si sigue sin haber clave, se la pedimos al usuario por única vez
  if (!apiKey || apiKey === "undefined") {
    apiKey = prompt("Por favor, ingresa tu API Key de Gemini para continuar:");
    if (apiKey) {
      localStorage.setItem('PASCALEX_KEY', apiKey);
    }
  }

  if (!apiKey) {
    alert("Sin API Key no se puede analizar el documento.");
    throw new Error("No hay API Key configurada.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Usamos el modelo Flash que es el más rápido para estas pruebas
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  // Limpiamos el base64
  const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;

  try {
    const result = await model.generateContent([
      "Analizá esta demanda laboral argentina. Devolvé un JSON con: summary (string con liquidación y hechos clave), complianceStatus (boolean), observations (array de strings) y riskAnalysis (string).",
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error en la IA:", error);
    // Si falla, borramos la llave por si era inválida para que la pida de nuevo
    localStorage.removeItem('PASCALEX_KEY');
    throw error;
  }
};
