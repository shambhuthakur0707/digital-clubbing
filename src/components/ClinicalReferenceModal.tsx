import React from 'react';
import { X, BookOpen, CheckCircle, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

interface ClinicalReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalReferenceModal: React.FC<ClinicalReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Lovibond Angle & Clubbing Clinical Guide</h3>
              <p className="text-xs text-slate-500">Diagnostic thresholds and systemic etiology reference</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Lovibond Angle */}
          <section className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-600 rounded-full inline-block" />
              What is the Lovibond Angle?
            </h4>
            <p className="text-xs text-slate-600">
              The Lovibond angle (or hyponychial angle) is formed between the dorsal surface of the distal phalanx and the nail plate at the proximal nail fold. In healthy individuals, there is a distinct downward dip where the cuticle meets the nail, maintaining an angle typically below 160°.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-xs font-bold text-emerald-900">Normal Range (&lt;180°)</div>
                <div className="text-xs text-emerald-800 mt-1">
                  Average angle is ~160°. The hyponychial depression remains sharp and distinct.
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-xs font-bold text-amber-900">Clubbing Threshold (≥180°)</div>
                <div className="text-xs text-amber-800 mt-1">
                  Obliteration of the angle (≥180°), creating a straight or convex bulbous contour.
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Schamroth Window Test */}
          <section className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-600 rounded-full inline-block" />
              The Schamroth Window Test
            </h4>
            <p className="text-xs text-slate-600">
              When opposing index fingers are placed dorsal-to-dorsal at the distal interphalangeal joints, a small diamond-shaped window is visible between the nail beds in normal fingers. In digital clubbing, loss of the hyponychial angle causes this diamond window to be completely obliterated (positive Schamroth's sign).
            </p>
          </section>

          {/* Section 3: Underlying Pathophysiology & Causes */}
          <section className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-600 rounded-full inline-block" />
              Systemic Etiologies & Specialist Routing
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-teal-900">Pulmonary Conditions (~80% of acquired clubbing):</span>
                <p className="text-slate-600 mt-0.5">
                  Bronchogenic carcinoma, Bronchiectasis, Idiopathic Pulmonary Fibrosis (IPF), Cystic Fibrosis, Lung abscess, Empyema. (Note: Uncomplicated COPD rarely causes clubbing by itself; finding clubbing in COPD mandates evaluating for occult lung cancer).
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-rose-900">Cardiovascular Conditions (~10–15%):</span>
                <p className="text-slate-600 mt-0.5">
                  Cyanotic congenital heart diseases (e.g. Tetralogy of Fallot, Eisenmenger syndrome), Subacute Infective Endocarditis (due to platelet-derived growth factors and micro-emboli), Right-to-left cardiac shunts.
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-blue-900">Gastrointestinal & Hepatic:</span>
                <p className="text-slate-600 mt-0.5">
                  Hepatic cirrhosis (hepatopulmonary syndrome), Inflammatory Bowel Disease (Crohn's disease, Ulcerative colitis), Celiac disease.
                </p>
              </div>
            </div>
          </section>

          {/* Clinical Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500 border border-slate-200">
            <strong>Clinical Notice:</strong> This reference is provided for educational and screening context. Digital clubbing is a clinical physical sign requiring thorough systemic investigation by qualified medical specialists.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
