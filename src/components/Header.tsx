import React from 'react';
import { Shield, BookOpen, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { TriageStep } from '../types/triage';

interface HeaderProps {
  currentStep: TriageStep;
  onOpenGuide: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onOpenGuide,
  onReset,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Clinical Triage Notice Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white">Confidential Medical Triage Protocol:</strong> Strict screening and routing assistant. Not a definitive diagnosis.
          </span>
          <span className="hidden md:inline text-slate-400">· Emergency? Seek immediate emergency care.</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-teal-900/20">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Xamine Triage Agent</h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                AUTONOMOUS CLINICAL ASSISTANT
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Lovibond Angle Evaluation · Targeted Systemic Triage · Specialist Routing
            </p>
          </div>
        </div>

        {/* Workflow Progress Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              currentStep === 'step1_ingestion'
                ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold'
                : 'text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-teal-800 text-white text-[10px] flex items-center justify-center">1</span>
            <span>Ingestion & Verification</span>
          </div>

          <span className="text-slate-300">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              currentStep.startsWith('step2')
                ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold'
                : 'text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-teal-800 text-white text-[10px] flex items-center justify-center">2</span>
            <span>Dynamic Triage</span>
          </div>

          <span className="text-slate-300">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              currentStep === 'step3_complete' || currentStep === 'normal_terminated'
                ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold'
                : 'text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-teal-800 text-white text-[10px] flex items-center justify-center">3</span>
            <span>Structured Reporting</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenGuide}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Clinical Guide</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset Screening Session"
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
