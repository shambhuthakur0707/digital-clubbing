import React, { useState } from 'react';
import { Header } from './components/Header';
import { LovibondAngleTool } from './components/LovibondAngleTool';
import { TriageChat } from './components/TriageChat';
import { SpecialistReferralCard } from './components/SpecialistReferralCard';
import { ClinicalReferenceModal } from './components/ClinicalReferenceModal';
import { CASE_STUDY_PRESETS } from './data/casePresets';
import { ChatMessage, PatientAssessment, TriageStep, CaseStudyPreset } from './types/triage';
import { Activity, ShieldCheck, FileCheck2, AlertCircle } from 'lucide-react';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-initial-greeting',
  role: 'assistant',
  content: `Welcome to the Xamine Clinical Screening System. I am the autonomous Xamine Triage Agent.

My role is to evaluate digital clubbing based on lateral finger imaging and Lovibond angle measurements, conduct a targeted symptom triage, and generate a structured specialist referral.

To begin Step 1 (Ingestion & Verification), please inspect your lateral finger profile and submit your calculated Lovibond angle using the tool on the left.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<TriageStep>('step1_ingestion');
  const [currentAngle, setCurrentAngle] = useState<number>(185);
  const [selectedImage, setSelectedImage] = useState<string>(CASE_STUDY_PRESETS[0].imageDataUri);
  const [activePresetId, setActivePresetId] = useState<string | null>(CASE_STUDY_PRESETS[0].id);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [finalAssessment, setFinalAssessment] = useState<PatientAssessment | null>(null);
  const [finalRawJson, setFinalRawJson] = useState<string>('');

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Helper to extract PatientAssessment from text
  const extractAssessment = (text: string): { assessment: PatientAssessment | null; rawJson: string } => {
    try {
      const parsed = JSON.parse(text.trim());
      if (parsed.patient_assessment) {
        return { assessment: parsed.patient_assessment, rawJson: JSON.stringify(parsed, null, 2) };
      }
    } catch {}

    const jsonMatch = text.match(/\{[\s\S]*"patient_assessment"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.patient_assessment) {
          return { assessment: parsed.patient_assessment, rawJson: JSON.stringify(parsed, null, 2) };
        }
      } catch (err) {
        console.error('Error parsing regex JSON match:', err);
      }
    }
    return { assessment: null, rawJson: '' };
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: CaseStudyPreset) => {
    setActivePresetId(preset.id);
    setCurrentAngle(preset.angle);
    setSelectedImage(preset.imageDataUri);
  };

  // Reset Session
  const handleResetSession = () => {
    setCurrentStep('step1_ingestion');
    setMessages([INITIAL_GREETING]);
    setFinalAssessment(null);
    setFinalRawJson('');
    setIsProcessing(false);
  };

  // Submit Step 1 angle and image to agent
  const handleSubmitStep1 = async (angle: number, imageUri: string) => {
    if (isProcessing) return;

    const systemInputText = `System Input: Angle is ${angle}°.`;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: systemInputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemInput: true,
      angle,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/triage/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          angle,
          step: 'step1',
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: systemInputText,
          imageBase64: imageUri,
        }),
      });

      const data = await response.json();
      const agentReplyText = data.text || '';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        role: 'assistant',
        content: agentReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Check if angle is under 180°
      if (angle < 180) {
        setCurrentStep('normal_terminated');
      } else {
        setCurrentStep('step2_q1');
      }
    } catch (err) {
      console.error('Error in step 1 triage:', err);
      // Fallback response
      const fallbackText =
        angle < 180
          ? `Thank you for providing your Lovibond angle measurement. Your calculated angle is ${angle}°, which is within normal limits (normal hyponychial angle is under 180°). There is no visual confirmation of digital clubbing. I recommend routine health maintenance. This screening session is now concluded.`
          : `System Input Received: Angle is ${angle}°. The angle exceeds 180°, confirming digital clubbing with loss of the normal hyponychial angle and bulbous soft-tissue enlargement. Proceeding to Step 2 triage.\n\nQuestion 1: Have you experienced any unusual shortness of breath, chronic cough, or wheezing?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-agent-fallback`,
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (angle < 180) {
        setCurrentStep('normal_terminated');
      } else {
        setCurrentStep('step2_q1');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle User Message during Dynamic Triage (Q1, Q2, Q3)
  const handleSendMessage = async (text: string) => {
    if (isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsProcessing(true);

    // Determine current API step parameter
    let apiStep: 'step2_q1' | 'step2_q2' | 'step2_q3' | 'step3' = 'step2_q1';
    let nextStep: TriageStep = 'step2_q2';

    if (currentStep === 'step2_q1') {
      apiStep = 'step2_q2';
      nextStep = 'step2_q2';
    } else if (currentStep === 'step2_q2') {
      apiStep = 'step2_q3';
      nextStep = 'step2_q3';
    } else if (currentStep === 'step2_q3') {
      apiStep = 'step3';
      nextStep = 'step3_complete';
    }

    try {
      const response = await fetch('/api/triage/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          angle: currentAngle,
          step: apiStep,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text,
        }),
      });

      const data = await response.json();
      const agentReplyText = data.text || '';

      const { assessment, rawJson } = extractAssessment(agentReplyText);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        role: 'assistant',
        content: agentReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsedAssessment: assessment,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (assessment) {
        setFinalAssessment(assessment);
        setFinalRawJson(rawJson || agentReplyText);
        setCurrentStep('step3_complete');
      } else {
        setCurrentStep(nextStep);
      }
    } catch (err) {
      console.error('Error in dynamic triage step:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        currentStep={currentStep}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleResetSession}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* If Step 3 is completed, show the Structured Referral Card prominently at the top */}
        {finalAssessment && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <SpecialistReferralCard
              assessment={finalAssessment}
              rawJson={finalRawJson}
              onReset={handleResetSession}
            />
          </div>
        )}

        {/* Normal limits conclusion card if terminated at step 1 */}
        {currentStep === 'normal_terminated' && (
          <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs flex items-start gap-4">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-emerald-950">
                  Screening Session Concluded: Lovibond Angle Within Normal Limits ({currentAngle}°)
                </h3>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                The calculated Lovibond angle is {currentAngle}°, which is below the 180° clinical threshold for digital clubbing. Normal hyponychial anatomy is preserved. Routine preventative health maintenance is recommended. No specialist routing required at this time.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Screen Another Patient
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Clinical Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Lovibond Angle Tool & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <LovibondAngleTool
              currentAngle={currentAngle}
              onAngleChange={setCurrentAngle}
              selectedImage={selectedImage}
              onImageChange={setSelectedImage}
              onSubmitToAgent={handleSubmitStep1}
              isProcessing={isProcessing}
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
            />

            {/* Clinical Protocol Quick Summary Box */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2.5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                <FileCheck2 className="w-4 h-4 text-teal-700" />
                <span>Operational Screening Protocol</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                <li>
                  <strong className="text-slate-800">Step 1:</strong> Ingestion of profile image & angle. If &lt;180°, session terminates with normal reassurance. If ≥180°, bulbous deformity confirmed.
                </li>
                <li>
                  <strong className="text-slate-800">Step 2:</strong> Targeted triage (max 3 questions asked sequentially): Q1 Pulmonary, Q2 Cardiovascular, Q3 Symptom duration.
                </li>
                <li>
                  <strong className="text-slate-800">Step 3:</strong> Final structured referral output strictly in JSON format (specialist routing & urgency classification).
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: Dynamic Triage Conversation (7 cols) */}
          <div className="lg:col-span-7">
            <TriageChat
              messages={messages}
              currentStep={currentStep}
              isProcessing={isProcessing}
              onSendMessage={handleSendMessage}
              currentAngle={currentAngle}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Xamine Triage Agent · Autonomous Medical Screening Protocol</span>
          <span className="text-slate-400">Classified as Clinical Decision Support & Routing Utility</span>
        </div>
      </footer>

      {/* Educational Clinical Reference Modal */}
      <ClinicalReferenceModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
