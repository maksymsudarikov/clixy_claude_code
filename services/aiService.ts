/**
 * AI Service - Gemini API Integration
 * Phase 1: Text input → Structured shoot data extraction
 *
 * This service is ISOLATED - safe to add/remove without breaking existing code
 */

import { GoogleGenAI } from '@google/genai';
import { AIGeneratedData, AIServiceResponse, TeamMember } from '../types';

// Get API key from environment (Vite exposes import.meta.env)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CLIENT_AI_ENABLED = import.meta.env.VITE_ENABLE_CLIENT_AI === 'true';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 15000;

// Initialize Gemini client (lazy - only if API key present)
let genAI: GoogleGenAI | null = null;
let model: any = null;

/**
 * Initialize Gemini client
 * @returns true if initialized successfully
 */
const initializeGemini = (): boolean => {
  if (!CLIENT_AI_ENABLED) {
    console.warn('[AI Service] Client-side AI is disabled. Use a server-side function for production AI features.');
    return false;
  }

  if (!GEMINI_API_KEY) {
    console.warn('[AI Service] VITE_GEMINI_API_KEY not found. AI features disabled.');
    return false;
  }

  if (!genAI) {
    try {
      genAI = new GoogleGenAI(GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      console.log('[AI Service] Gemini initialized successfully');
      return true;
    } catch (error) {
      console.error('[AI Service] Failed to initialize Gemini:', error);
      return false;
    }
  }

  return true;
};

/**
 * System prompt for structured data extraction
 * CRITICAL: Must return ONLY valid JSON, no markdown, no explanations
 */
const EXTRACTION_PROMPT = `You are an AI assistant for Clixy, a professional photo/video shoot management platform.

Your task: Extract structured shoot information from the user's description.

CRITICAL RULES:
1. Output ONLY valid JSON (no markdown code blocks, no explanations, no extra text)
2. Use ISO date format: YYYY-MM-DD
3. Use 24-hour time format: HH:MM
4. Support both Russian and English input
5. If information is missing, use empty string "" or empty array []
6. NEVER make up information - only extract what user explicitly mentioned
7. For team roles, use professional titles: "Photographer", "Videographer", "Stylist", "Hair & Makeup Artist", "Model", "Producer", "Assistant"
8. In Russian use: "Фотограф", "Стилист", "Визажист", "Модель", "Продюсер", "Ассистент"

EXPECTED JSON SCHEMA:
{
  "title": string (project name),
  "client": string (client/brand name),
  "description": string (detailed description),
  "date": string (YYYY-MM-DD format),
  "startTime": string (HH:MM format),
  "endTime": string (HH:MM format),
  "locationName": string (venue name),
  "locationAddress": string (full address),
  "projectType": "photo_shoot" | "video_project" | "hybrid",
  "team": [{"role": string, "name": string}] (team members),
  "stylingNotes": string (styling/wardrobe notes),
  "hairMakeupNotes": string (hair & makeup notes)
}

EXAMPLES:

Input (English):
"Nike summer campaign shoot, outdoor location, June 15 from 10am to 4pm, need photographer and stylist"

Output:
{
  "title": "Nike Summer Campaign",
  "client": "Nike",
  "description": "Outdoor summer campaign shoot",
  "date": "2026-06-15",
  "startTime": "10:00",
  "endTime": "16:00",
  "locationName": "Outdoor location",
  "locationAddress": "",
  "projectType": "photo_shoot",
  "team": [
    {"role": "Photographer", "name": ""},
    {"role": "Stylist", "name": ""}
  ],
  "stylingNotes": "Summer campaign styling",
  "hairMakeupNotes": ""
}

Input (Russian):
"Съёмка для Adidas, видео проект, 20 июня с 9 до 18, нужен видеограф и стилист, студия в Москве"

Output:
{
  "title": "Съёмка для Adidas",
  "client": "Adidas",
  "description": "Видео проект",
  "date": "2026-06-20",
  "startTime": "09:00",
  "endTime": "18:00",
  "locationName": "Студия в Москве",
  "locationAddress": "Москва",
  "projectType": "video_project",
  "team": [
    {"role": "Видеограф", "name": ""},
    {"role": "Стилист", "name": ""}
  ],
  "stylingNotes": "",
  "hairMakeupNotes": ""
}

Now extract information from the user's description below.
Remember: Output ONLY the JSON object, nothing else.`;

/**
 * Generate shoot data from text description
 * Main entry point for AI text processing
 */
export async function generateFromText(
  description: string
): Promise<AIServiceResponse> {
  // Validation
  if (!description || description.trim().length === 0) {
    return {
      success: false,
      error: 'Description cannot be empty'
    };
  }

  if (description.length > 5000) {
    return {
      success: false,
      error: 'Description too long (max 5000 characters)'
    };
  }

  // Initialize Gemini
  if (!initializeGemini()) {
    return {
      success: false,
      error: CLIENT_AI_ENABLED
        ? 'AI service is not configured. Please add VITE_GEMINI_API_KEY.'
        : 'AI assistant is currently disabled.'
    };
  }

  console.log('[AI Service] Generating from text:', {
    length: description.length,
    preview: description.substring(0, 100)
  });

  // Call Gemini with retry logic
  try {
    const responseText = await callGeminiWithRetry(description);
    const parsedData = parseAndValidate(responseText);

    console.log('[AI Service] ✅ Successfully generated data:', parsedData);

    return {
      success: true,
      data: parsedData
    };
  } catch (error) {
    console.error('[AI Service] ❌ Generation failed:', error);

    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

/**
 * Call Gemini API with retry logic and timeout
 */
async function callGeminiWithRetry(description: string): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI Service] Attempt ${attempt}/${MAX_RETRIES} - Calling Gemini...`);

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT_MS);
      });

      // Create API call promise
      const apiPromise = model.generateContent([
        EXTRACTION_PROMPT,
        `\nUser description:\n"${description}"`
      ]);

      // Race between timeout and API call
      const result = await Promise.race([apiPromise, timeoutPromise]);
      const responseText = result.response.text();

      console.log('[AI Service] Received response:', {
        length: responseText.length,
        preview: responseText.substring(0, 200)
      });

      return responseText;

    } catch (error: any) {
      console.error(`[AI Service] Attempt ${attempt} failed:`, error);

      // Check if it's a quota error
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('AI quota exceeded. Please try again later.');
      }

      // Check if it's a safety filter error
      if (error.message?.includes('safety') || error.message?.includes('SAFETY')) {
        throw new Error('Content was blocked by safety filters. Please rephrase your description.');
      }

      // If this was the last attempt, throw error
      if (attempt === MAX_RETRIES) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`[AI Service] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Maximum retries exceeded');
}

/**
 * Parse and validate Gemini response
 * Ensures we get valid JSON matching our schema
 */
function parseAndValidate(responseText: string): AIGeneratedData {
  // Remove markdown code blocks if present
  let cleaned = responseText.trim();

  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  cleaned = cleaned.replace(/```\s*$/, '');
  cleaned = cleaned.trim();

  // Try to parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('[AI Service] JSON parse failed:', parseError);
    console.error('[AI Service] Raw response:', responseText);
    throw new Error('AI returned invalid JSON format');
  }

  // Validate and sanitize data
  const validated: AIGeneratedData = {};

  // Basic text fields
  if (parsed.title) validated.title = String(parsed.title).trim();
  if (parsed.client) validated.client = String(parsed.client).trim();
  if (parsed.description) validated.description = String(parsed.description).trim();

  // Date validation (YYYY-MM-DD format)
  if (parsed.date) {
    const dateStr = String(parsed.date);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Check if date is valid
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        validated.date = dateStr;
      }
    }
  }

  // Time validation (HH:MM format)
  if (parsed.startTime) {
    const timeStr = String(parsed.startTime);
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      validated.startTime = timeStr;
    }
  }

  if (parsed.endTime) {
    const timeStr = String(parsed.endTime);
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      validated.endTime = timeStr;
    }
  }

  // Location fields
  if (parsed.locationName) validated.locationName = String(parsed.locationName).trim();
  if (parsed.locationAddress) validated.locationAddress = String(parsed.locationAddress).trim();

  // Project type validation
  if (parsed.projectType) {
    const type = parsed.projectType;
    if (type === 'photo_shoot' || type === 'video_project' || type === 'hybrid') {
      validated.projectType = type;
    }
  }

  // Team array validation
  if (Array.isArray(parsed.team)) {
    validated.team = parsed.team
      .filter((member: any) => member && typeof member === 'object')
      .map((member: any) => ({
        role: String(member.role || '').trim(),
        name: String(member.name || '').trim(),
        email: member.email ? String(member.email).trim() : undefined,
        phone: member.phone ? String(member.phone).trim() : undefined,
      } as TeamMember))
      .filter(member => member.role); // Only keep members with a role
  }

  // Styling notes
  if (parsed.stylingNotes) validated.stylingNotes = String(parsed.stylingNotes).trim();
  if (parsed.hairMakeupNotes) validated.hairMakeupNotes = String(parsed.hairMakeupNotes).trim();

  return validated;
}

/**
 * Extract user-friendly error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Known error types
    if (error.message.includes('quota')) {
      return 'AI service quota exceeded. Please try again in a few minutes.';
    }
    if (error.message.includes('safety')) {
      return 'Content was blocked by safety filters. Please rephrase your description.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('invalid JSON')) {
      return 'AI returned unexpected format. Please try again or contact support.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if AI service is available
 * Useful for feature flag / conditional rendering
 */
export function isAIServiceAvailable(): boolean {
  return !!GEMINI_API_KEY;
}

/**
 * Get AI service status for debugging
 */
export function getAIServiceStatus() {
  return {
    apiKeyConfigured: !!GEMINI_API_KEY,
    initialized: !!genAI,
    model: model ? 'gemini-2.0-flash-exp' : null
  };
}
