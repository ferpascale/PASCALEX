
export type DocType = 
  | 'demanda' 
  | 'contestacion_demanda' 
  | 'contestacion_traslado' 
  | 'prueba_ofrecida'
  | 'testimonial'
  | 'expediente_completo';

export interface JudgeAnalysis {
  summary: string;
  complianceStatus: boolean;
  complianceReport: string;
  observations: string[];
  riskAnalysis: string;
  normativeCitations: string[];
  versionDifferences?: string;
}

export interface CaseFile {
  name: string;
  content: string;
  type: DocType;
  secondaryContent?: string;
  additionalFiles?: { label: string; content: string }[];
}

export interface Question {
  id: string;
  text: string;
}
