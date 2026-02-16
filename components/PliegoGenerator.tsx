
import React, { useState } from 'react';
// Fixed: Changed CaseAnalysis to JudgeAnalysis to match available exports in types.ts
import { JudgeAnalysis, Question } from '../types';
import { generatePliego } from '../services/geminiService';

interface PliegoGeneratorProps {
  // Fixed: Changed CaseAnalysis to JudgeAnalysis
  analysis: JudgeAnalysis;
}

const PliegoGenerator: React.FC<PliegoGeneratorProps> = ({ analysis }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'Posición' | 'Testigo'>('Posición');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePliego(analysis, selectedType);
      setQuestions(result);
    } catch (error) {
      console.error("Error generating pliego:", error);
      alert("Error al generar el pliego.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n');
    navigator.clipboard.writeText(text);
    alert("Pliego copiado al portapapeles.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Generador de Pliegos</h2>
            <p className="text-slate-500 mt-1">Automatización de interrogatorios basada en la pertinencia y conducencia (Art. 90 L.O.).</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
            <button 
              onClick={() => setSelectedType('Posición')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedType === 'Posición' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Absolución (Art. 87)
            </button>
            <button 
              onClick={() => setSelectedType('Testigo')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedType === 'Testigo' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Testigos (Art. 90)
            </button>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center shadow-md active:scale-95"
          >
            {isGenerating ? 'Analizando Litis...' : `Generar Interrogatorio`}
          </button>
        </div>
      </div>

      <div className="p-8 bg-slate-50 min-h-[500px]">
        {questions.length > 0 ? (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-2xl p-16 rounded-sm relative" id="pliego-document">
            {/* Stamp-like mark */}
            <div className="absolute top-8 right-8 border-2 border-slate-200 rounded px-3 py-1 text-[10px] text-slate-300 font-black uppercase rotate-12 select-none">
              PASCALEX IA SYSTEM
            </div>

            <div className="text-center mb-12 uppercase font-black tracking-tighter text-slate-900 underline decoration-4 underline-offset-8">
              PLIEGO DE {selectedType === 'Posición' ? 'POSICIONES' : 'PREGUNTAS'}
            </div>
            
            <p className="mb-10 text-slate-800 leading-relaxed font-serif text-lg">
              {selectedType === 'Posición' 
                ? 'Pliego de posiciones que deberá absolver la parte demandada a tenor del siguiente pliego bajo apercibimiento de ley:' 
                : 'Interrogatorio de preguntas que deberán responder los testigos citados en autos bajo juramento de decir verdad:'}
            </p>

            <ol className="space-y-8 list-decimal pl-8 font-serif text-slate-900 text-lg">
              {questions.map((q) => (
                <li key={q.id} className="pl-4 leading-relaxed tracking-tight">
                  {q.text}
                </li>
              ))}
              {selectedType === 'Testigo' && (
                <li className="pl-4 font-bold text-slate-800">
                  Diga el testigo la razón de sus dichos (Art. 93 L.O.).
                </li>
              )}
            </ol>

            <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-end">
              <button 
                onClick={copyToClipboard}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copiar para Escrito
              </button>
              <div className="text-right">
                <div className="w-56 border-b-2 border-slate-300 mb-2 ml-auto"></div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Firma y Sello del Letrado Patrocinante</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-slate-400">
            <div className="bg-slate-200/50 p-6 rounded-full mb-6">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11l0 6M9 14l6 0" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-500">Documento en Blanco</p>
            <p className="text-xs max-w-xs text-center mt-2 leading-relaxed">Selecciona el tipo de interrogatorio y genera el contenido basado en los hechos del Art. 71.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PliegoGenerator;
