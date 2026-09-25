export type Specialist = 'Cardiologist' | 'Pulmonologist' | 'General Physician';
export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export interface PatientAssessment {
  lovibond_angle_detected: number;
  visual_clubbing_confirmed: boolean;
  reported_symptoms: string[];
  recommended_specialist: Specialist;
  triage_urgency_level: UrgencyLevel;
  referral_rationale: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isSystemInput?: boolean;
  parsedAssessment?: PatientAssessment | null;
  angle?: number;
}

export type TriageStep = 'step1_ingestion' | 'step2_q1' | 'step2_q2' | 'step2_q3' | 'step3_complete' | 'normal_terminated';

export interface CaseStudyPreset {
  id: string;
  title: string;
  patientProfile: string;
  angle: number;
  expectedRoute: Specialist | 'Routine Maintenance';
  description: string;
  sampleQ1Answer: string;
  sampleQ2Answer: string;
  sampleQ3Answer: string;
  imageDataUri: string;
}
