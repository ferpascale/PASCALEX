
import React, { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import JudgeDashboard from './components/JudgeDashboard';
import { CaseFile, JudgeAnalysis, DocType } from './types';
import { analyzeAsJudge } from './services/geminiService';

const App: React.FC = () => {
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [analysis, setAnalysis] = useState<JudgeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [quickPasteText, setQuickPasteText] = useState('');
  const [quickPasteType, setQuickPasteType] = useState<DocType>('demanda');

  const [uploadedFiles, setUploadedFiles] = useState<{
    demanda?: string, 
    contestacion?: string,
    traslado?: string,
    prueba?: string
  }>({});

  const handleFileUploadAction = async (primary: string, secondary?: string, typeOverride?: DocType, extraFiles?: {label: string, content: string}[]) => {
    setIsAnalyzing(true);
    const type = typeOverride || selectedDocType || quickPasteType;
    try {
      const result = await analyzeAsJudge({
        name: "Análisis PASCALEX",
        content: primary,
        type: type,
        additionalFiles: extraFiles
      });
      setAnalysis(result);
    } catch (error: any) {
      console.error(error);
      alert("Error en el análisis. Intente nuevamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setSelectedDocType(null);
    setUploadedFiles({});
    setQuickPasteText('');
  };

  const getDocLabel = (t: DocType) => {
    switch(t) {
      case 'demanda': return 'Inicio Demanda';
      case 'contestacion_demanda': return 'Contestación Demanda';
      case 'contestacion_traslado': return 'Contestación Traslado';
      case 'prueba_ofrecida': return 'Prueba (D+C+T)';
      case 'testimonial': return 'Testimonial (Pliegos)';
      case 'expediente_completo': return 'Expediente Integral';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 z-10">
        {!selectedDocType && !analysis && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center py-16 mb-8">
              <h2 className="text-7xl font-black text-slate-900 mb-2 tracking-tighter leading-none">
                Gestión <span className="text-[#74ACDF]">Procesal</span> Inteligente
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
              {[
                { id: 'demanda', label: 'Inicio Demanda', icon: '📜', desc: 'Art. 65 LO' },
                { id: 'contestacion_demanda', label: 'Contestación', icon: '⚖️', desc: 'Art. 68 LO' },
                { id: 'contestacion_traslado', label: 'Traslado', icon: '📬', desc: 'Art. 71 LO' },
                { id: 'prueba_ofrecida', label: 'Prueba (D+C+T)', icon: '🔍', desc: 'Conducencia', highlight: true },
                { id: 'testimonial', label: 'Testimonial', icon: '👥', desc: 'Pliegos' },
                { id: 'expediente_completo', label: 'Integral', icon: '📂', desc: 'Todo el Expediente' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedDocType(type.id as DocType)}
                  className={`bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-sky-200 transition-all text-center group flex flex-col items-center relative overflow-hidden ${type.highlight ? 'ring-2 ring-[#74ACDF]/30 bg-gradient-to-b from-white to-sky-50/30' : ''}`}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-sky-50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500 opacity-20"></div>
                  <span className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500 block">{type.icon}</span>
                  <h3 className="font-black text-[12px] text-slate-800 group-hover:text-[#4A86C1] mb-2 leading-tight uppercase tracking-tight">{type.label}</h3>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em]">{type.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-white/40 backdrop-blur-sm p-12 rounded-[56px] border border-white shadow-2xl">
               <div className="flex items-center space-x-3 mb-10">
                 <div className="h-3 w-3 bg-sky-400 rounded-full animate-pulse"></div>
                 <h3 className="text-xs font-black text-slate-400 tracking-[0.4em] uppercase">Análisis Directo de Texto</h3>
               </div>
               <div className="space-y-8">
                  <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-4 overflow-x-auto scrollbar-hide max-w-fit">
                    {(['demanda', 'contestacion_demanda', 'contestacion_traslado'] as DocType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuickPasteType(t)}
                        className={`px-6 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap ${quickPasteType === t ? 'bg-white text-[#4A86C1] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {getDocLabel(t)}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={quickPasteText}
                    onChange={(e) => setQuickPasteText(e.target.value)}
                    placeholder={`Inserte el texto para análisis de ${getDocLabel(quickPasteType)}...`}
                    className="w-full h-72 p-10 rounded-[40px] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-[#74ACDF]/20 transition-all text-slate-700 font-serif text-xl leading-relaxed shadow-inner bg-white/60 resize-none placeholder:text-slate-300"
                  ></textarea>
                  <button
                    onClick={() => handleFileUploadAction(quickPasteText)}
                    disabled={!quickPasteText.trim() || isAnalyzing}
                    className="w-full bg-slate-900 text-white py-7 rounded-[28px] font-black uppercase tracking-[0.5em] hover:bg-[#4A86C1] hover:scale-[1.01] transition-all disabled:opacity-30 shadow-2xl flex items-center justify-center space-x-4"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analizando...</span>
                      </>
                    ) : "Ejecutar Análisis"}
                  </button>
               </div>
            </div>
          </div>
        )}

        {selectedDocType && !analysis && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
            <button onClick={reset} className="mb-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-[#4A86C1] flex items-center group transition-colors">
              <span className="mr-4 group-hover:-translate-x-3 transition-transform text-lg">←</span> Volver al inicio
            </button>
            
            <div className="bg-white p-16 rounded-[64px] shadow-2xl border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 via-white to-sky-400 opacity-50"></div>
              <h2 className="text-5xl font-black text-slate-900 mb-14 tracking-tighter text-center italic uppercase">
                {selectedDocType === 'prueba_ofrecida' ? 'Apertura de Prueba' : `Cargar ${getDocLabel(selectedDocType)}`}
              </h2>
              
              {(selectedDocType === 'expediente_completo' || selectedDocType === 'prueba_ofrecida') ? (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Fase 1: Demanda</p>
                       <FileUploader onFile={(f) => setUploadedFiles(p => ({...p, demanda: f.content}))} isAnalyzing={false} compact />
                       {uploadedFiles.demanda && <p className="text-center text-[10px] text-sky-500 font-black uppercase animate-pulse">Cargado</p>}
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Fase 2: Contestación</p>
                       <FileUploader onFile={(f) => setUploadedFiles(p => ({...p, contestacion: f.content}))} isAnalyzing={false} compact />
                       {uploadedFiles.contestacion && <p className="text-center text-[10px] text-sky-500 font-black uppercase animate-pulse">Cargado</p>}
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Fase 3: Traslado</p>
                       <FileUploader onFile={(f) => setUploadedFiles(p => ({...p, traslado: f.content}))} isAnalyzing={false} compact />
                       {uploadedFiles.traslado && <p className="text-center text-[10px] text-sky-500 font-black uppercase animate-pulse">Cargado</p>}
                    </div>
                  </div>
                  <button
                    disabled={!uploadedFiles.demanda || !uploadedFiles.contestacion || isAnalyzing}
                    onClick={() => {
                      const extras = [
                        { label: 'Demanda', content: uploadedFiles.demanda! },
                        { label: 'Contestación', content: uploadedFiles.contestacion! }
                      ];
                      if (uploadedFiles.traslado) extras.push({ label: 'Traslado', content: uploadedFiles.traslado });
                      handleFileUploadAction(uploadedFiles.demanda!, undefined, selectedDocType, extras);
                    }}
                    className="w-full bg-slate-900 text-white py-7 rounded-[28px] font-black uppercase tracking-[0.4em] hover:bg-[#4A86C1] transition-all shadow-xl disabled:opacity-20"
                  >
                    {isAnalyzing ? "Analizando Litis..." : "Analizar Mapa Probatorio"}
                  </button>
                </div>
              ) : selectedDocType === 'testimonial' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Pieza de Demanda</p>
                     <FileUploader onFile={(f) => setUploadedFiles(p => ({...p, demanda: f.content}))} isAnalyzing={false} compact />
                   </div>
                   <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Pieza de Contestación</p>
                     <FileUploader onFile={(f) => setUploadedFiles(p => ({...p, contestacion: f.content}))} isAnalyzing={false} compact />
                   </div>
                   <button
                    disabled={!uploadedFiles.demanda || !uploadedFiles.contestacion || isAnalyzing}
                    onClick={() => {
                      const extras = [
                        { label: 'Demanda', content: uploadedFiles.demanda! },
                        { label: 'Contestación', content: uploadedFiles.contestacion! }
                      ];
                      handleFileUploadAction(uploadedFiles.demanda!, undefined, 'testimonial', extras);
                    }}
                    className="col-span-1 md:col-span-2 bg-slate-900 text-white py-7 rounded-[28px] font-black uppercase tracking-[0.4em] hover:bg-[#4A86C1] transition-all shadow-xl"
                  >
                    {isAnalyzing ? "Generando..." : "Generar Pliegos"}
                  </button>
                </div>
              ) : (
                <FileUploader onFile={(file) => handleFileUploadAction(file.content)} isAnalyzing={isAnalyzing} />
              )}
            </div>
          </div>
        )}

        {analysis && (
          <div className="animate-in zoom-in-95 duration-700">
            <div className="flex justify-between items-center mb-10 bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-slate-100 shadow-xl">
              <button onClick={reset} className="text-[9px] font-black text-white bg-slate-900 px-10 py-5 rounded-full hover:bg-[#4A86C1] shadow-2xl transition-all uppercase tracking-[0.4em]">
                Nuevo Análisis
              </button>
              <div className="flex space-x-4 items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className={`px-10 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] ${analysis.complianceStatus ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {analysis.complianceStatus ? 'PROCESABLE' : 'SUBSANAR'}
                </div>
              </div>
            </div>
            <JudgeDashboard analysis={analysis} />
          </div>
        )}
      </main>

      <footer className="bg-slate-950 text-white py-20 mt-32 border-t-8 border-[#74ACDF]">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center opacity-60">
          <div className="mb-8 md:mb-0">
             <h2 className="text-3xl font-black uppercase tracking-[0.5em] italic">PASCALEX</h2>
             <p className="text-[10px] mt-4 uppercase tracking-[0.4em] font-bold">Inteligencia Jurídica Aplicada</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-[#74ACDF] mb-2">República Argentina</p>
             <p className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Ley 18.345 · Justicia Nacional del Trabajo</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
