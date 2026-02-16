
import React, { useState } from 'react';
import { JudgeAnalysis, Question } from '../types';
import { generatePliego } from '../services/geminiService';

const JudgeDashboard: React.FC<{ analysis: JudgeAnalysis }> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'testigo'>('summary');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const tabStyle = (tab: string) => `px-12 py-5 text-[11px] font-black transition-all border-b-4 uppercase tracking-[0.2em] whitespace-nowrap ${
    activeTab === tab 
      ? 'border-[#74ACDF] text-[#4A86C1] bg-sky-50/50' 
      : 'border-transparent text-slate-400 hover:text-sky-400'
  }`;

  const fetchPliego = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePliego(analysis, 'Testigo');
      setQuestions(res);
      setActiveTab('testigo');
    } catch (e) {
      alert("Error al procesar el pliego.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">Sin datos disponibles.</p>;
    
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-slate-900 font-black text-xl mt-12 mb-6 uppercase tracking-tighter border-l-8 border-[#74ACDF] pl-5 italic bg-slate-50/50 py-3">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={i} className="text-[#4A86C1] font-black text-3xl mt-14 mb-10 uppercase tracking-widest text-center border-b-4 border-sky-100 pb-6">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('- ')) {
        return <div key={i} className="flex gap-4 items-start mb-4 ml-8 text-slate-800 font-serif text-lg">
          <span className="text-[#74ACDF] font-black mt-1">▶</span>
          <span>{line.replace('- ', '')}</span>
        </div>;
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return <p key={i} className="text-slate-700 font-serif text-lg leading-relaxed mb-4">
          {parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-900 font-black bg-yellow-50">{part}</strong> : part)}
        </p>;
      }
      if (line.trim() === '') return <div key={i} className="h-8"></div>;
      return <p key={i} className="text-slate-700 font-serif text-lg leading-relaxed mb-4">{line}</p>;
    });
  };

  return (
    <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-sky-100 overflow-hidden">
      <div className="flex border-b border-sky-100 bg-white sticky top-0 z-40 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('summary')} className={tabStyle('summary')}>Informe Técnico</button>
        <button onClick={fetchPliego} className={tabStyle('testigo')}>{isGenerating ? 'Analizando...' : 'Pliego de Posiciones'}</button>
      </div>

      <div className="p-8 md:p-16 bg-[#FAFBFF]">
        {activeTab === 'summary' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto">
            <div className="bg-white border-2 border-sky-50 p-12 md:p-20 rounded-[64px] shadow-sm relative overflow-hidden min-h-[1000px]">
                {/* Escudo Nacional de Fondo Modernizado */}
                <div className="absolute top-24 right-24 opacity-[0.03] pointer-events-none transform rotate-[15deg] select-none hidden 2xl:block">
                   <svg viewBox="0 0 100 100" className="h-[500px] w-[500px] text-slate-900">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.5" />
                      <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.2" />
                   </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 border-b-8 border-slate-900 pb-10 gap-8">
                     <div>
                        <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Expediente Digital</p>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">DICTAMEN <span className="text-[#74ACDF]">TÉCNICO</span></h2>
                     </div>
                     <div className="text-right">
                        <div className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest ${analysis.complianceStatus ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                           {analysis.complianceStatus ? 'VALIDADO' : 'OBSERVADO'}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest italic">PASCALEX V4.0</p>
                     </div>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    {renderMarkdown(analysis.summary)}
                  </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'testigo' && (
          <div className="animate-in zoom-in-95 duration-700 max-w-5xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center mb-14 gap-8">
              <h3 className="text-5xl font-black text-[#4A86C1] italic tracking-tighter uppercase">
                PLIEGO <span className="text-slate-200">/ ART. 87</span>
              </h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(questions.map((q, i) => `${i+1}. ${q.text}`).join('\n'));
                  alert("Copiado al portapapeles");
                }}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-[#74ACDF] transition-all flex items-center text-xs"
              >
                Copiar para Escrito
              </button>
            </div>
            <div className="bg-white border-4 border-sky-50 p-20 md:p-32 rounded-[100px] shadow-sm font-serif relative">
              <div className="absolute top-12 right-12 text-[11px] text-slate-300 font-black uppercase tracking-widest italic">AUTOMATIZACIÓN PASCALEX</div>
              <div className="text-center mb-20">
                <p className="font-black text-slate-900 italic text-3xl uppercase text-center border-b-4 border-slate-900 pb-10 mb-14 mx-auto max-w-lg">
                  PLIEGO DE POSICIONES
                </p>
                <p className="text-slate-600 italic text-xl leading-relaxed text-left border-l-4 border-sky-100 pl-8">
                  Preguntas a tenor de las cuales deberá absolver posiciones la parte absolvente, conforme apercibimiento de ley (Art. 87 y 93 L.O.).
                </p>
              </div>
              <ol className="list-decimal space-y-16 pl-16 text-2xl text-slate-900 leading-relaxed italic">
                {questions.length > 0 ? questions.map((q, idx) => (
                  <li key={idx} className="pl-8 pb-10 border-b-2 border-slate-50 last:border-0 hover:bg-sky-50/50 transition-all rounded-r-3xl">
                    {q.text}
                  </li>
                ) ) : (
                  <div className="text-center py-40 text-slate-200 flex flex-col items-center gap-10">
                    <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <p className="text-xl font-black uppercase tracking-widest opacity-50">Análisis de hechos controvertidos requerido</p>
                  </div>
                )}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeDashboard;
