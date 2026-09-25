import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, CornerDownLeft, Sparkles, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { ChatMessage, PatientAssessment, TriageStep } from '../types/triage';

interface TriageChatProps {
  messages: ChatMessage[];
  currentStep: TriageStep;
  isProcessing: boolean;
  onSendMessage: (text: string) => void;
  currentAngle: number;
}

export const TriageChat: React.FC<TriageChatProps> = ({
  messages,
  currentStep,
  isProcessing,
  onSendMessage,
  currentAngle,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Voice speech-to-text dictation setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleChipClick = (chipText: string) => {
    if (isProcessing) return;
    onSendMessage(chipText);
  };

  // Dynamic suggestion chips based on triage step
  const getSuggestions = () => {
    if (currentStep === 'step2_q1') {
      return [
        'Yes, chronic morning cough and exertional shortness of breath',
        'Occasional wheezing, but no chronic cough',
        'No shortness of breath, chronic cough, or wheezing',
      ];
    }
    if (currentStep === 'step2_q2') {
      return [
        'Yes, notable swelling in both ankles and frequent fatigue',
        'Yes, occasional rapid heartbeat and severe fatigue',
        'No leg swelling, severe fatigue, or palpitations',
      ];
    }
    if (currentStep === 'step2_q3') {
      return [
        'Symptoms started recently (about 2 to 4 weeks ago)',
        'Symptoms have been ongoing for 3 to 6 months',
        'Symptoms have developed slowly over more than a year',
      ];
    }
    return [];
  };

  const suggestions = getSuggestions();
  const isSessionTerminated = currentStep === 'step3_complete' || currentStep === 'normal_terminated';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-xs">
              XT
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Xamine Triage Agent</h3>
              <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                CLINICAL SCREENING
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Autonomous Digital Clubbing & Systemic Symptom Router</p>
          </div>
        </div>

        {/* Status Stepper Tracker */}
        <div className="flex items-center gap-1.5 text-xs">
          {currentStep === 'step1_ingestion' && (
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded font-medium">
              Step 1: Angle Verification
            </span>
          )}
          {currentStep === 'step2_q1' && (
            <span className="text-xs text-teal-800 bg-teal-50 px-2 py-1 rounded font-medium border border-teal-200">
              Step 2: Question 1/3 (Pulmonary)
            </span>
          )}
          {currentStep === 'step2_q2' && (
            <span className="text-xs text-teal-800 bg-teal-50 px-2 py-1 rounded font-medium border border-teal-200">
              Step 2: Question 2/3 (Cardiovascular)
            </span>
          )}
          {currentStep === 'step2_q3' && (
            <span className="text-xs text-teal-800 bg-teal-50 px-2 py-1 rounded font-medium border border-teal-200">
              Step 2: Question 3/3 (Duration/Urgency)
            </span>
          )}
          {currentStep === 'step3_complete' && (
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded font-medium border border-emerald-200">
              Step 3: Referral Generated
            </span>
          )}
          {currentStep === 'normal_terminated' && (
            <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded font-medium border border-slate-200">
              Session Concluded (Normal Limits)
            </span>
          )}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((message) => {
          const isAssistant = message.role === 'assistant';

          // Check if message content is JSON or has JSON block
          const hasJson = message.content.includes('"patient_assessment"');

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-md bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                    : message.isSystemInput
                    ? 'bg-slate-800 text-white font-mono border border-slate-700'
                    : 'bg-teal-700 text-white'
                }`}
              >
                {/* System Input Tag */}
                {message.isSystemInput && (
                  <div className="text-[10px] text-teal-300 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>SYSTEM INPUT TRANSMISSION</span>
                  </div>
                )}

                {hasJson ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs border-b border-slate-100 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Triage Assessment Protocol Completed · Strict JSON Output:</span>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{message.content.trim()}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{message.content}</div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    isAssistant ? 'text-slate-400' : 'text-teal-200'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-md bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-md bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-100" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-200" />
              <span className="text-xs text-slate-500 font-medium ml-1">
                Xamine Triage Agent evaluating clinical parameters...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Response Chips */}
      {!isSessionTerminated && suggestions.length > 0 && (
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
          <div className="text-[11px] font-medium text-slate-500 mb-1.5">
            Quick Clinical Responses:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                disabled={isProcessing}
                className="text-left text-xs bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar or Session Terminated Banner */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        {isSessionTerminated ? (
          <div className="text-center py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            {currentStep === 'step3_complete' ? (
              <span className="font-medium text-slate-800">
                Screening complete. Specialist referral dossier generated above.
              </span>
            ) : (
              <span className="font-medium text-slate-800">
                Session concluded. Lovibond reading within normal limits (&lt;180°).
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Stop voice recording' : 'Dictate response'}
              className={`p-2.5 rounded-lg border transition-colors ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your symptoms or answer the agent's question..."
              disabled={isProcessing}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
