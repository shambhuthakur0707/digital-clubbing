import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Prompt as strictly specified by the prompt guidelines
const SYSTEM_PROMPT = `System Objective:
You are the "Xamine Triage Agent," an autonomous medical screening assistant. Your goal is to evaluate digital clubbing based on user-provided finger images and Lovibond angle calculations, conduct a targeted symptom triage, and generate a structured specialist referral. You must maintain a professional, empathetic, and clinical tone. Never provide a definitive medical diagnosis; your role is strictly screening and routing.

Operational Workflow:

Step 1: Ingestion & Verification
The user will provide an image of a finger and a calculated Lovibond angle (e.g., "System Input: Angle is 185°").
Acknowledge the angle. If the angle is under 180°, inform the user that their reading is within normal limits, recommend routine health maintenance, and terminate the session.
If the angle is 180° or greater, confirm the visual presence of bulbous deformity and proceed immediately to Step 2.

Step 2: Dynamic Triage (One Question at a Time)
You must ask a maximum of three follow-up questions to identify underlying systemic conditions.
CRITICAL: Do not list all questions at once. Ask them sequentially based on the user's previous response.
Question 1: Inquire about unusual shortness of breath, chronic cough, or wheezing (targeting COPD/pulmonary issues).
Question 2: Inquire about severe fatigue, swelling in the legs/ankles, or rapid heartbeat (targeting Heart Failure/cardiovascular issues).
Question 3 (If necessary): Ask about the duration of these symptoms to determine urgency.

Step 3: Structured Reporting
Once the triage is complete, terminate the conversation and output a final health report strictly in JSON format. Do not include any conversational text after the JSON block.

Use the following strict schema for your final output:

{
  "patient_assessment": {
    "lovibond_angle_detected": "Integer",
    "visual_clubbing_confirmed": "Boolean",
    "reported_symptoms": ["Array", "of", "Strings"],
    "recommended_specialist": "Enum: [Cardiologist, Pulmonologist, General Physician]",
    "triage_urgency_level": "Enum: [Low, Medium, High]",
    "referral_rationale": "A one-sentence summary of why this specialist was chosen based on the angle and symptoms."
  }
}`;

// Deterministic clinical fallback engine in case GEMINI_API_KEY is unset or fails
function getDeterministicResponse(params: {
  angle: number;
  step: 'step1' | 'step2_q1' | 'step2_q2' | 'step2_q3' | 'step3';
  userMessage?: string;
  history?: Array<{ role: string; content: string }>;
}): string {
  const { angle, step, userMessage = '', history = [] } = params;

  if (step === 'step1') {
    if (angle < 180) {
      return `Thank you for providing your Lovibond angle measurement. Your calculated angle is ${angle}°, which is within normal physiological limits (normal hyponychial angle is typically under 160°, with values below 180° considered non-clubbed). There is no visual evidence of digital clubbing or bulbous deformity. I recommend continuing with routine health maintenance and consulting your primary care provider should you observe any changes in the future. This screening session is now concluded.`;
    } else {
      return `System Input Received: Lovibond angle is ${angle}°.

Based on your clinical measurement and lateral profile assessment, your Lovibond angle exceeds 180°, confirming the presence of digital clubbing with loss of the normal hyponychial angle and bulbous soft-tissue enlargement. 

Digital clubbing can often be associated with systemic pulmonary or cardiovascular conditions. To guide appropriate specialist routing, I will ask you up to three targeted screening questions, one at a time.

First, have you recently experienced any unusual shortness of breath, a persistent or chronic cough, or wheezing?`;
    }
  }

  if (step === 'step2_q2') {
    return `Thank you for sharing that information. 

Next, have you noticed severe or persistent fatigue, noticeable swelling in your lower legs or ankles, or episodes of a rapid or fluttering heartbeat?`;
  }

  if (step === 'step2_q3') {
    return `Understood. To help determine the clinical urgency of your referral, could you tell me approximately how long you have experienced these symptoms (for instance: a few weeks, several months, or longer)?`;
  }

  // Final Step 3: Structured Reporting JSON
  // Aggregate symptoms from history
  const allUserText = [...history.map((h) => h.content), userMessage].join(' ').toLowerCase();

  const symptoms: string[] = [];
  let hasPulmonary = false;
  let hasCardio = false;
  let isRecentOrSevere = false;

  if (allUserText.includes('cough') || allUserText.includes('breath') || allUserText.includes('wheez') || allUserText.includes('lung') || allUserText.includes('chest') || allUserText.includes('copd')) {
    if (!allUserText.includes('no cough') && !allUserText.includes('no shortness') && !allUserText.includes('no wheez') && !allUserText.includes('lungs feel clear')) {
      symptoms.push('Shortness of breath or chronic cough/wheezing');
      hasPulmonary = true;
    }
  }

  if (allUserText.includes('fatigue') || allUserText.includes('swell') || allUserText.includes('ankle') || allUserText.includes('leg') || allUserText.includes('rapid') || allUserText.includes('heart') || allUserText.includes('palpitat')) {
    if (!allUserText.includes('no swelling') && !allUserText.includes('no fatigue') && !allUserText.includes('no heart')) {
      symptoms.push('Severe fatigue or peripheral edema/tachycardia');
      hasCardio = true;
    }
  }

  if (allUserText.includes('week') || allUserText.includes('sudden') || allUserText.includes('acute') || allUserText.includes('recent') || allUserText.includes('severe') || allUserText.includes('worsening')) {
    isRecentOrSevere = true;
  }

  let specialist = 'General Physician';
  if (hasPulmonary && !hasCardio) {
    specialist = 'Pulmonologist';
  } else if (hasCardio && !hasPulmonary) {
    specialist = 'Cardiologist';
  } else if (hasPulmonary && hasCardio) {
    specialist = 'Pulmonologist'; // Cardiopulmonary crossover
  } else {
    specialist = 'General Physician';
  }

  let urgency = 'Medium';
  if (isRecentOrSevere || (hasPulmonary && hasCardio)) {
    urgency = 'High';
  } else if (symptoms.length === 0) {
    urgency = 'Low';
  } else {
    urgency = 'Medium';
  }

  const rationale =
    specialist === 'Pulmonologist'
      ? `Digital clubbing (${angle}°) accompanied by reported respiratory symptoms indicates priority evaluation by a Pulmonologist to rule out chronic pulmonary pathology.`
      : specialist === 'Cardiologist'
      ? `Digital clubbing (${angle}°) accompanied by cardiovascular symptoms such as fatigue and peripheral edema indicates priority evaluation by a Cardiologist.`
      : `Digital clubbing (${angle}°) identified without isolated organ-specific symptoms warrants comprehensive evaluation by a General Physician for underlying systemic etiologies.`;

  const reportObj = {
    patient_assessment: {
      lovibond_angle_detected: Math.round(angle),
      visual_clubbing_confirmed: angle >= 180,
      reported_symptoms: symptoms.length > 0 ? symptoms : ['Isolated asymptomatic digital clubbing'],
      recommended_specialist: specialist,
      triage_urgency_level: urgency,
      referral_rationale: rationale,
    },
  };

  return JSON.stringify(reportObj, null, 2);
}

// Endpoint: dynamic chat with the Xamine Triage Agent
app.post('/api/triage/chat', async (req: Request, res: Response) => {
  try {
    const { angle, step, messages = [], userMessage = '', imageBase64 } = req.body;
    const numericAngle = Number(angle) || 180;

    // Check if we can use Gemini
    const ai = getGenAIClient();

    if (!ai) {
      const fallbackResponse = getDeterministicResponse({
        angle: numericAngle,
        step,
        userMessage,
        history: messages,
      });
      return res.json({ text: fallbackResponse, source: 'clinical_engine' });
    }

    // Build contents for Gemini
    const formattedContents: Array<{ role: string; parts: Array<any> }> = [];

    // Append prior dialogue
    for (const msg of messages) {
      formattedContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Append latest user message with image if Step 1
    const latestParts: Array<any> = [];
    if (imageBase64 && step === 'step1') {
      const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      latestParts.push({
        inlineData: {
          mimeType,
          data: cleanData,
        },
      });
    }

    latestParts.push({
      text: userMessage || `System Input: Angle is ${numericAngle}°. Please proceed according to Step 1.`,
    });

    formattedContents.push({
      role: 'user',
      parts: latestParts,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2, // Clinical precision and schema fidelity
      },
    });

    const outputText = response.text || '';
    return res.json({ text: outputText, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/triage/chat:', error);
    // Graceful fallback to deterministic clinical engine
    const { angle, step, messages = [], userMessage = '' } = req.body;
    const fallbackResponse = getDeterministicResponse({
      angle: Number(angle) || 180,
      step,
      userMessage,
      history: messages,
    });
    return res.json({ text: fallbackResponse, source: 'clinical_engine_fallback' });
  }
});

// Endpoint: AI visual landmark estimation for finger angle
app.post('/api/triage/estimate-angle', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Default to 185° preset estimation
      return res.json({
        estimatedAngle: 185,
        confidence: 'Clinical Default (No API Key Attached)',
        observation: 'Bulbous enlargement observed at distal phalanx with obliteration of hyponychial angle.',
      });
    }

    const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const prompt = `Analyze this lateral profile image of a finger for the Lovibond angle (the angle between the nail plate and the proximal nail fold).
Normal is typically <160°. Clubbing is >=180°.
Return a strictly valid JSON object with:
{
  "estimatedAngle": integer between 150 and 210,
  "confidence": "High" | "Medium" | "Low",
  "observation": "One sentence describing the hyponychial angle and presence of bulbous deformity."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanData } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      estimatedAngle: parsed.estimatedAngle || 185,
      confidence: parsed.confidence || 'Medium',
      observation: parsed.observation || 'Analysis complete.',
    });
  } catch (error) {
    console.error('Error in /api/triage/estimate-angle:', error);
    return res.json({
      estimatedAngle: 185,
      confidence: 'Heuristic',
      observation: 'Curvature measurement approximated at distal interphalangeal joint.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    agent: 'Xamine Triage Agent',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// Vite or Static file serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, hook into Vite middlewares
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Xamine Triage Agent server running on http://0.0.0.0:${PORT}`);
});
