import { CaseStudyPreset } from '../types/triage';

// Generate clean medical SVG illustrations for lateral nail profile views
function createNailSvg(angle: number, clubbed: boolean): string {
  // SVG drawing of a lateral finger profile showing nail plate and nail fold
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbdcd0" />
        <stop offset="60%" stop-color="#eec3b0" />
        <stop offset="100%" stop-color="#dc9d84" />
      </linearGradient>
      <linearGradient id="nailGrad" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#f5e1d8" />
        <stop offset="50%" stop-color="#fcefe8" />
        <stop offset="100%" stop-color="#e8b4a2" />
      </linearGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15" />
      </filter>
    </defs>
    
    <!-- Background Grid / Calibration Ruler -->
    <rect width="400" height="300" fill="#f8fafc" />
    <path d="M 0 50 L 400 50 M 0 100 L 400 100 M 0 150 L 400 150 M 0 200 L 400 200 M 0 250 L 400 250" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
    <path d="M 50 0 L 50 300 M 100 0 L 100 300 M 150 0 L 150 300 M 200 0 L 200 300 M 250 0 L 250 300 M 300 0 L 300 300 M 350 0 L 350 300" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
    
    <!-- Finger Body -->
    ${
      clubbed
        ? `<!-- Clubbed Finger: Bulbous distal enlargement -->
           <path d="M 20 180 C 80 180 140 175 190 160 C 230 148 260 135 290 140 C 340 150 370 180 360 210 C 350 238 310 248 260 245 C 190 240 100 240 20 240 Z" fill="url(#skinGrad)" filter="url(#softShadow)" />
           <!-- Proximal Nail Fold & Curving Nail Plate -->
           <path d="M 230 150 C 265 142 295 146 325 160 C 345 170 355 185 352 195 C 348 200 338 195 320 185 C 290 168 260 160 230 162 Z" fill="url(#nailGrad)" stroke="#c27d66" stroke-width="1.5" />
           <!-- Nail Plate sheen line -->
           <path d="M 260 152 Q 295 155 330 175" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.6" stroke-linecap="round" />
           <!-- Bulbous pulp shadow -->
           <path d="M 280 230 C 320 230 350 215 348 198" stroke="#be7a62" stroke-width="2" fill="none" opacity="0.4" />`
        : `<!-- Normal Finger: Slim distal phalanx, standard hyponychial angle -->
           <path d="M 20 170 C 80 170 140 168 190 168 C 230 168 260 165 290 170 C 335 178 355 198 345 220 C 335 235 300 235 260 232 C 190 228 100 228 20 228 Z" fill="url(#skinGrad)" filter="url(#softShadow)" />
           <!-- Proximal Nail Fold & Normal Nail Plate -->
           <path d="M 240 166 C 270 167 300 175 328 188 C 338 193 342 200 339 205 C 335 208 325 204 310 198 C 280 186 255 180 238 178 Z" fill="url(#nailGrad)" stroke="#c27d66" stroke-width="1.5" />
           <!-- Nail sheen -->
           <path d="M 265 170 Q 295 176 325 190" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round" />`
    }
    
    <!-- Anatomical Annotation Lines -->
    <g opacity="0.85">
      <!-- Hyponychial angle center point -->
      <circle cx="${clubbed ? 275 : 270}" cy="${clubbed ? 148 : 167}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
      <text x="20" y="32" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#475569">
        LATERAL DIGIT PROFILE VIEW · LOVIBOND CALIPER
      </text>
      <text x="20" y="280" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">
        ${clubbed ? '• Loss of hyponychial angle (>180°) · Distal bulbous contour' : '• Normal hyponychial angle (<180°) · Preserved nail-bed plane'}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CASE_STUDY_PRESETS: CaseStudyPreset[] = [
  {
    id: 'case-1-pulmonary',
    title: 'Case 1: 185° Clubbed Finger (Pulmonary)',
    patientProfile: '64-year-old former smoker presenting with progressive digital enlargement.',
    angle: 185,
    expectedRoute: 'Pulmonologist',
    description: 'Calculated Lovibond angle is 185° with confirmed bulbous deformity. Candidate exhibits chronic productive cough and exertional dyspnea.',
    sampleQ1Answer: 'Yes, I have had a chronic morning cough and noticeable shortness of breath when walking up small inclines.',
    sampleQ2Answer: 'No swelling in my ankles and no heart palpitations, just feeling winded easily.',
    sampleQ3Answer: 'The coughing and shortness of breath have been gradually worsening over the past 4 months.',
    imageDataUri: createNailSvg(185, true),
  },
  {
    id: 'case-2-cardio',
    title: 'Case 2: 192° Marked Clubbing (Cardiovascular)',
    patientProfile: '58-year-old with bilateral finger clubbing, ankle swelling, and fatigue.',
    angle: 192,
    expectedRoute: 'Cardiologist',
    description: 'Prominent drumstick digital deformity with Lovibond angle of 192°. Patient reports bilateral leg swelling and rapid heart rate.',
    sampleQ1Answer: 'No significant cough or wheezing.',
    sampleQ2Answer: 'Yes, severe fatigue every afternoon, notable swelling in both ankles by evening, and occasional racing heartbeat.',
    sampleQ3Answer: 'The swelling and racing pulse began approximately 6 weeks ago.',
    imageDataUri: createNailSvg(192, true),
  },
  {
    id: 'case-3-normal',
    title: 'Case 3: 162° Normal Nail (Routine Limits)',
    patientProfile: '35-year-old seeking routine screening for perceived nail curvature.',
    angle: 162,
    expectedRoute: 'Routine Maintenance',
    description: 'Lovibond angle is 162° (under 180° threshold). Normal hyponychial angle preserved, no bulbous deformity. Qualifies for session termination.',
    sampleQ1Answer: 'No respiratory symptoms.',
    sampleQ2Answer: 'No cardiovascular symptoms.',
    sampleQ3Answer: 'N/A',
    imageDataUri: createNailSvg(162, false),
  },
  {
    id: 'case-4-general',
    title: 'Case 4: 182° Borderline Clubbing (Systemic)',
    patientProfile: '49-year-old noticing gradual finger broadening without isolated organ symptoms.',
    angle: 182,
    expectedRoute: 'General Physician',
    description: 'Lovibond angle is 182° meeting clubbing criteria, without acute isolated pulmonary or cardiac complaints. Requires systemic workup.',
    sampleQ1Answer: 'No, lungs feel completely clear with no cough or wheezing.',
    sampleQ2Answer: 'No swelling in legs and no racing heartbeat. Only general mild tiredness.',
    sampleQ3Answer: 'The finger shape changed over the last 8 to 10 months.',
    imageDataUri: createNailSvg(182, true),
  },
];
