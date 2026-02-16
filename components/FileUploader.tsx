
import React, { useState } from 'react';

interface FileUploaderProps {
  onFile: (file: { name: string; content: string }) => void;
  isAnalyzing: boolean;
  compact?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFile, isAnalyzing, compact = false }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      onFile({
        name: file.name,
        content: event.target?.result as string || ""
      });
    };
    reader.readAsDataURL(file);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-sky-50 rounded-[40px] border-4 border-sky-100 border-double animate-pulse">
        <div className="relative mb-4">
           <svg className="animate-spin h-12 w-12 text-[#74ACDF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-[#4A86C1] font-black text-sm uppercase tracking-tighter text-center">Procesando Documentación...</p>
      </div>
    );
  }

  return (
    <div className={`relative border-2 border-dashed border-sky-100 rounded-[32px] ${compact ? 'p-10' : 'p-24'} flex flex-col items-center justify-center hover:bg-sky-50/50 hover:border-[#74ACDF] transition-all cursor-pointer group animate-in zoom-in duration-500 overflow-hidden shadow-inner`}>
      <div className={`${compact ? 'p-4 mb-3' : 'bg-[#74ACDF] p-7 rounded-full mb-8'} group-hover:scale-110 transition-transform shadow-sm`}>
        <svg className={`${compact ? 'h-6 w-6 text-[#74ACDF]' : 'h-12 w-12 text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className={`text-slate-800 font-black ${compact ? 'text-xs' : 'text-2xl'} uppercase tracking-tighter text-center`}>
        {fileName || (compact ? 'Subir Fichero' : 'Cargar Expediente (PDF)')}
      </p>
      {!compact && <p className="text-slate-400 text-[10px] mt-3 uppercase tracking-[0.3em] font-bold">Resiliencia OCR Inteligente</p>}
      <input 
        type="file" 
        accept=".pdf"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
      />
    </div>
  );
};

export default FileUploader;
