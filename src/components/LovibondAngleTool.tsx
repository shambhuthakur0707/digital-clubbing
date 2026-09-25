import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, Info, ChevronRight, Eye } from 'lucide-react';
import { CASE_STUDY_PRESETS } from '../data/casePresets';
import { CaseStudyPreset } from '../types/triage';

interface LovibondAngleToolProps {
  currentAngle: number;
  onAngleChange: (angle: number) => void;
  selectedImage: string;
  onImageChange: (imageUri: string) => void;
  onSubmitToAgent: (angle: number, imageUri: string) => void;
  isProcessing: boolean;
  activePresetId: string | null;
  onSelectPreset: (preset: CaseStudyPreset) => void;
}

export const LovibondAngleTool: React.FC<LovibondAngleToolProps> = ({
  currentAngle,
  onAngleChange,
  selectedImage,
  onImageChange,
  onSubmitToAgent,
  isProcessing,
  activePresetId,
  onSelectPreset,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateNotes, setEstimateNotes] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isClubbed = currentAngle >= 180;

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string);
          setEstimateNotes(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera integration
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a lateral finger photo instead.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onImageChange(dataUrl);
        stopCamera();
        setEstimateNotes(null);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // AI Angle estimation via Gemini vision
  const handleAIEstimate = async () => {
    try {
      setIsEstimating(true);
      setEstimateNotes(null);
      const res = await fetch('/api/triage/estimate-angle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: selectedImage }),
      });
      const data = await res.json();
      if (data.estimatedAngle) {
        onAngleChange(Math.round(data.estimatedAngle));
        setEstimateNotes(`${data.observation || 'Angle estimated'} (${data.confidence || 'Standard'} confidence)`);
      }
    } catch (err) {
      console.error('Estimate error:', err);
      setEstimateNotes('AI estimation unavailable; manual caliper adjusted.');
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Tool Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step 1: Ingestion & Verification</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">Lovibond Goniometer</span>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mt-0.5">Finger Profile & Angle Assessment</h2>
        </div>

        {/* Live Classification Tag */}
        <div className="flex items-center gap-2">
          {isClubbed ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Angle ≥ 180° (Clubbing Present)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Angle &lt; 180° (Within Normal Limits)</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Preset Selector Bar */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Select Clinical Preset or Upload Patient Image:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CASE_STUDY_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/40 text-teal-950 ring-1 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate">{preset.title.split(':')[0]}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.angle}° · {preset.expectedRoute}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualizer Canvas Area with Goniometer Overlay */}
        <div className="relative rounded-lg border border-slate-200 bg-slate-900 overflow-hidden aspect-[4/3] flex items-center justify-center">
          {isCameraActive ? (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-teal-400/60 pointer-events-none m-8 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs bg-slate-900/80 px-3 py-1.5 rounded backdrop-blur">
                  Align finger profile horizontally inside frame
                </span>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Image View */}
              <img
                src={selectedImage}
                alt="Lateral finger profile view for Lovibond angle calculation"
                className="w-full h-full object-contain"
              />

              {/* Goniometer Protractor Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={isClubbed ? '#f59e0b' : '#059669'} />
                  </marker>
                </defs>

                {/* Caliper Origin Point (Hyponychial Cuticle Fold) */}
                <g transform="translate(270, 158)">
                  {/* Outer Angle Arc */}
                  <circle cx="0" cy="0" r="42" fill="none" stroke={isClubbed ? 'rgba(245, 158, 11, 0.35)' : 'rgba(5, 150, 105, 0.35)'} strokeWidth="3" strokeDasharray="3,3" />

                  {/* Ray 1: Proximal Nail Fold line (Skin tangent) */}
                  <line
                    x1="0"
                    y1="0"
                    x2="-95"
                    y2="5"
                    stroke={isClubbed ? '#d97706' : '#059669'}
                    strokeWidth="2.5"
                    markerEnd="url(#arrow)"
                  />

                  {/* Ray 2: Nail Plate Tangent line based on angle */}
                  {/* Convert Lovibond angle to second vector angle */}
                  {(() => {
                    const angleRad = ((180 - currentAngle) * Math.PI) / 180;
                    const rayLength = 90;
                    const targetX = rayLength * Math.cos(angleRad);
                    const targetY = rayLength * Math.sin(angleRad);

                    return (
                      <>
                        <line
                          x1="0"
                          y1="0"
                          x2={targetX}
                          y2={targetY}
                          stroke={isClubbed ? '#dc2626' : '#059669'}
                          strokeWidth="2.5"
                          markerEnd="url(#arrow)"
                        />
                        {/* Shaded Angle Sector */}
                        <path
                          d={`M 0 0 L -35 2 A 35 35 0 0 1 ${targetX * 0.4} ${targetY * 0.4} Z`}
                          fill={isClubbed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(5, 150, 105, 0.25)'}
                        />
                      </>
                    );
                  })()}

                  {/* Center Vertex Pivot */}
                  <circle cx="0" cy="0" r="5" fill="#ffffff" stroke={isClubbed ? '#b91c1c' : '#047857'} strokeWidth="2.5" />
                </g>

                {/* On-Canvas Metric Badge */}
                <rect x="15" y="15" width="135" height="48" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                <text x="25" y="32" fill="#94a3b8" fontSize="10" fontFamily="system-ui" fontWeight="500">LOVIBOND ANGLE</text>
                <text x="25" y="52" fill="#ffffff" fontSize="18" fontFamily="monospace" fontWeight="700">
                  {currentAngle}°
                </text>
              </svg>

              {/* Image Action Overlay Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-md backdrop-blur border border-slate-700">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload image"
                  className="px-2 py-1 text-slate-200 hover:text-white hover:bg-slate-800 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  title="Take camera snapshot"
                  className="px-2 py-1 text-slate-200 hover:text-white hover:bg-slate-800 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={handleAIEstimate}
                  disabled={isEstimating}
                  title="Estimate angle with Gemini AI"
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs flex items-center gap-1 transition-colors font-medium disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEstimating ? 'Estimating...' : 'AI Verify'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          )}
        </div>

        {/* AI Estimation Note if present */}
        {estimateNotes && (
          <div className="text-xs text-teal-800 bg-teal-50/70 border border-teal-200 rounded-md p-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{estimateNotes}</span>
          </div>
        )}

        {/* Camera Error Notice */}
        {cameraError && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2.5">
            {cameraError}
          </div>
        )}

        {/* Interactive Goniometer Angle Adjuster */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700">Calculated Lovibond Angle:</span>
              <p className="text-[11px] text-slate-500">Angle between proximal nail fold and nail plate surface</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${isClubbed ? 'text-amber-700' : 'text-emerald-700'}`}>
                {currentAngle}
              </span>
              <span className="text-slate-500 font-mono text-sm">degrees (°)</span>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="150"
              max="210"
              step="1"
              value={currentAngle}
              onChange={(e) => onAngleChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>150° (Normal)</span>
              <span className="text-slate-700 font-semibold">160° (Physiological mean)</span>
              <span className="text-amber-700 font-semibold">180° Threshold (Clubbing)</span>
              <span>210° (Marked)</span>
            </div>
          </div>

          {/* Step buttons for fine tuning */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAngleChange(Math.max(150, currentAngle - 5))}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-mono"
              >
                -5°
              </button>
              <button
                type="button"
                onClick={() => onAngleChange(Math.max(150, currentAngle - 1))}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-mono"
              >
                -1°
              </button>
              <button
                type="button"
                onClick={() => onAngleChange(Math.min(210, currentAngle + 1))}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-mono"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => onAngleChange(Math.min(210, currentAngle + 5))}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-mono"
              >
                +5°
              </button>
            </div>

            {/* Quick calibration resets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAngleChange(160)}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Set Normal (160°)
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => onAngleChange(185)}
                className="text-[11px] text-amber-700 hover:text-amber-900 underline font-medium"
              >
                Set Clubbed (185°)
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Submit to Xamine Agent */}
        <div>
          <button
            type="button"
            onClick={() => onSubmitToAgent(currentAngle, selectedImage)}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
              isClubbed
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>
              {isProcessing
                ? 'Connecting to Xamine Agent...'
                : `Submit Angle to Triage Agent (System Input: Angle is ${currentAngle}°)`}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            Transmits measured angle and lateral image according to Step 1 verification protocol.
          </p>
        </div>
      </div>
    </div>
  );
};
