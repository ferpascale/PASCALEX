import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeAsJudge = async (file: any) => {
  // 1. OBTENCIÓN DE LLAVE (Prioridad absoluta)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('PASCALEX_KEY');

  if (!apiKey || apiKey === "undefined") {
    const manualKey = window.prompt("PASCALEX: No se detectó API Key. Pegala acá:");
    if (manualKey) {
      localStorage.setItem('PASCALEX_KEY', manualKey);
      window.location.reload(); // Recargamos para aplicar
    }
    throw new Error("API Key requerida");
  }

  // 2. INSTANCIACIÓN DENTRO DEL BLOQUE (Evita el error de 'new Rg')
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 3. PROCESAMIENTO
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;

    const result = await model.generateContent([
      "Analizá esta demanda laboral argentina. Respondé UNICAMENTE con un objeto JSON que tenga las claves: summary (texto), complianceStatus (boolean), observations (lista) y riskAnalysis (texto).",
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Limpiamos el texto por si Gemini devuelve markdown (```json ...)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
    
  } catch (err: any) {
    if (err.message.includes("API key not valid")) {
      localStorage.removeItem('PASCALEX_KEY');
      alert("La API Key no es válida. Se borrará para que ingreses una nueva.");
    }
    throw err;
  }
};
