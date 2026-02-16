
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="relative flex items-center group">
            {/* Bandera Argentina Minimalista Vertical */}
            <div className="flex h-10 w-3 mr-4 rounded-full overflow-hidden shadow-sm">
              <div className="bg-[#74ACDF] flex-1"></div>
              <div className="bg-white flex-1"></div>
              <div className="bg-[#74ACDF] flex-1"></div>
            </div>
            
            {/* Sol de Mayo Minimalista y Moderno */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-10 w-10 text-amber-400 fill-current drop-shadow-sm transition-transform group-hover:rotate-90 duration-1000">
                <circle cx="50" cy="50" r="18" className="text-amber-500" />
                {[...Array(16)].map((_, i) => (
                  <line
                    key={i}
                    x1="50" y1="15"
                    x2="50" y2="28"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform={`rotate(${i * 22.5} 50 50)`}
                    className="text-amber-500/60"
                  />
                ))}
              </svg>
            </div>
            
            <div className="ml-4">
              <h1 className="legal-title text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                PASCAL<span className="text-[#74ACDF]">EX</span>
              </h1>
              <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.4em] mt-1.5 flex items-center">
                Inteligencia Jurídica <span className="mx-2 text-slate-200">|</span> 
                <span className="text-[#4A86C1]">V4.0</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Secretaría Digital</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Motor Gemini 3 Pro</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white to-sky-50 border border-sky-100 flex items-center justify-center text-[#74ACDF] font-black text-sm shadow-inner overflow-hidden relative group">
            <div className="absolute inset-0 bg-sky-400/5 group-hover:bg-sky-400/10 transition-colors"></div>
            <span className="relative z-10">AR</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
