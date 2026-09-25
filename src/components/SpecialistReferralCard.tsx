import React, { useState } from 'react';
import { Stethoscope, Heart, Wind, ShieldAlert, Check, Copy, Printer, RotateCcw, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { PatientAssessment } from '../types/triage';

interface SpecialistReferralCardProps {
  assessment: PatientAssessment;
  rawJson: string;
  onReset: () => void;
}

export const SpecialistReferralCard: React.FC<SpecialistReferralCardProps> = ({
  assessment,
  rawJson,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Specialist icons and badges
  const specialistDetails = {
    Pulmonologist: {
      title: 'Pulmonology / Respiratory Medicine',
      icon: Wind,
      colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
      badgeClass: 'bg-teal-700 text-white',
      suggestedWorkup: [
        'High-Resolution Computed Tomography (HRCT) of Chest',
        'Pulmonary Function Tests (PFTs / Spirometry)',
        'Arterial Blood Gas (ABG) / Resting & Exertional O2 Saturation',
        'Sputum Cytology & Inflammatory Panel',
      ],
    },
    Cardiologist: {
      title: 'Cardiology / Cardiovascular Disease',
      icon: Heart,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeClass: 'bg-rose-700 text-white',
      suggestedWorkup: [
        'Transthoracic Echocardiogram (TTE) for right-to-left shunt & valvular lesions',
        '12-Lead Electrocardiogram (ECG)',
        'Serum NT-proBNP / Cardiac Biomarkers',
        'Blood Cultures (rule out Subacute Infective Endocarditis)',
      ],
    },
    'General Physician': {
      title: 'Internal Medicine / General Physician',
      icon: Stethoscope,
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeClass: 'bg-blue-700 text-white',
      suggestedWorkup: [
        'Comprehensive Metabolic Panel (CMP) & Hepatic Function Panel',
        'Complete Blood Count (CBC) with differential',
        'Baseline Baseline Posteroanterior (PA) Chest Radiograph',
        'Serum Inflammatory Markers (ESR / CRP / Thyroid Panel)',
      ],
    },
  }[assessment.recommended_specialist] || {
    title: 'General Physician',
    icon: Stethoscope,
    colorClass: 'text-slate-700 bg-slate-50 border-slate-200',
    badgeClass: 'bg-slate-700 text-white',
    suggestedWorkup: ['Routine Comprehensive Physical Evaluation'],
  };

  const SpecialistIcon = specialistDetails.icon;

  const urgencyStyles = {
    High: 'bg-rose-50 text-rose-800 border-rose-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }[assessment.triage_urgency_level];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden print:shadow-none print:border-none print:p-0">
      {/* Referral Header */}
      <div className="bg-slate-900 text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>OFFICIAL HEALTH REPORT</span>
            <span>·</span>
            <span>STEP 3 STRUCTURED REFERRAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${urgencyStyles}`}>
              Urgency: {assessment.triage_urgency_level}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur shrink-0">
            <SpecialistIcon className="w-8 h-8 text-teal-300" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Recommended Specialist Route</div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-0.5">
              {assessment.recommended_specialist}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Subspecialty: {specialistDetails.title}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Referral Rationale Callout */}
        <div className="p-4 rounded-lg bg-slate-50 border-l-4 border-teal-600">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Referral Rationale</div>
          <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
            "{assessment.referral_rationale}"
          </p>
        </div>

        {/* Clinical Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-medium text-slate-500">Lovibond Angle Detected</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {assessment.lovibond_angle_detected}°
              </span>
              <span className="text-xs text-slate-500">
                ({assessment.lovibond_angle_detected >= 180 ? '≥180° Clubbed' : '<180° Normal'})
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-medium text-slate-500">Visual Clubbing Status</div>
            <div className="flex items-center gap-2 mt-1">
              {assessment.visual_clubbing_confirmed ? (
                <>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-amber-900">Confirmed (Bulbous Deformity)</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-900">Normal (No Deformity)</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs font-medium text-slate-500">Triage Urgency Window</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">
              {assessment.triage_urgency_level === 'High' && 'Evaluation recommended within 24–48 hours'}
              {assessment.triage_urgency_level === 'Medium' && 'Evaluation recommended within 1–2 weeks'}
              {assessment.triage_urgency_level === 'Low' && 'Routine clinical scheduling indicated'}
            </div>
          </div>
        </div>

        {/* Reported Symptoms */}
        <div>
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Identified Symptom Profile
          </div>
          <div className="flex flex-wrap gap-2">
            {assessment.reported_symptoms.length > 0 ? (
              assessment.reported_symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium border border-slate-200"
                >
                  {symptom}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No acute systemic symptoms reported.</span>
            )}
          </div>
        </div>

        {/* Suggested Diagnostic Workup For The Specialist Consultation */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-teal-700" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Anticipated Specialist Diagnostic Workup
            </h4>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {specialistDetails.suggestedWorkup.map((test, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">·</span>
                <span>{test}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strict Medical Disclaimer Notice */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Clinical Screening Boundary: </span>
            This automated report is generated by the Xamine Triage Agent strictly for initial screening, visual clubbing verification, and specialist referral routing. It is not a definitive diagnosis. If you experience severe chest pain, sudden breathlessness, or blue lips/fingers, seek emergency medical care immediately.
          </div>
        </div>

        {/* Toggle Raw JSON Output View */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <span>{showRawJson ? 'Hide Structured JSON Schema' : 'View Raw Clinical JSON Output'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          {showRawJson && (
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner max-h-64">
              <pre>{rawJson}</pre>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 print:hidden">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Patient Screening</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Referral</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied JSON!' : 'Copy Assessment JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
