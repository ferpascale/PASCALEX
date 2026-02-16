
import React from 'react';
// Fixed: Changed CaseAnalysis to JudgeAnalysis to match available exports in types.ts
import { JudgeAnalysis } from '../types';

interface AnalysisDashboardProps {
  // Fixed: Using any here because this component expects properties (facts, controversies, etc.) 
  // that are not part of the current JudgeAnalysis interface definition.
  analysis: any;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Comparativa de Hechos Articulados</h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">Detección Automática</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Descripción del Hecho</th>
                  <th className="px-6 py-3 font-semibold">Origen</th>
                  <th className="px-6 py-3 font-semibold text-center">Controvertido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Added optional chaining and any type for fact to prevent runtime/compile errors */}
                {analysis.facts?.map((fact: any) => (
                  <tr key={fact.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700 leading-relaxed italic">
                      "{fact.description}"
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        fact.source === 'Demanda' ? 'bg-blue-100 text-blue-700' : 
                        fact.source === 'Contestación' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {fact.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {fact.isControverted ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resumen de Prueba Ofrecida
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
            {analysis.evidenceSummary}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold mb-4 flex items-center text-indigo-100">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Sugerencia Estratégica
          </h3>
          <p className="text-sm leading-relaxed text-indigo-50 italic">
            {analysis.legalStrategySuggestion}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Puntos de Pericia Sugeridos</h3>
          <ul className="space-y-3">
            {/* Added optional chaining and string/number types for map */}
            {analysis.controversies?.slice(0, 3).map((c: string, i: number) => (
              <li key={i} className="flex items-start text-sm text-slate-600">
                <span className="bg-slate-100 text-slate-500 rounded h-5 w-5 flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 shrink-0">{i+1}</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
