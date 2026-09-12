/**
 * Google Gemini AI Integration Service for HUNTIQ
 * Provides direct Gemini 2.5 / 2.0 REST API calls with deterministic fallback.
 */

export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-flash';
  temperature: number;
  systemInstruction?: string;
}

export interface GeneratedOutreachContent {
  subject: string;
  body: string;
  followUp: string;
  linkedinNote: string;
}

const STORAGE_KEY_API_KEY = 'huntiq_gemini_api_key';
const STORAGE_KEY_MODEL = 'huntiq_gemini_model';
const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiService {
  private apiKey: string = '';
  private model: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-flash' = DEFAULT_MODEL;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (typeof window !== 'undefined') {
        const storedKey = localStorage.getItem(STORAGE_KEY_API_KEY);
        if (storedKey) {
          this.apiKey = storedKey;
        }
        const storedModel = localStorage.getItem(STORAGE_KEY_MODEL) as any;
        if (storedModel) {
          this.model = storedModel;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
    if (typeof window !== 'undefined') {
      if (this.apiKey) {
        localStorage.setItem(STORAGE_KEY_API_KEY, this.apiKey);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
    }
  }

  public getModel(): 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-flash' {
    return this.model;
  }

  public setModel(model: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-flash'): void {
    this.model = model;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MODEL, model);
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Tests connection against the Gemini REST API.
   */
  public async testConnection(keyToTest?: string): Promise<{ success: boolean; message: string; model?: string }> {
    const key = (keyToTest ?? this.apiKey).trim();
    if (!key) {
      return {
        success: false,
        message: 'No Gemini API key provided. Please enter a valid key.'
      };
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(key)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Respond with exactly the word "CONNECTED" to verify connection.' }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        return {
          success: false,
          message: `Gemini API Error: ${errMsg}`
        };
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'CONNECTED';

      return {
        success: true,
        message: `Successfully connected to Google Gemini (${this.model})! Response: "${text}"`,
        model: this.model
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err?.message || 'Network error or CORS issue'}`
      };
    }
  }

  /**
   * Generates a conversational Copilot answer grounded in sales intelligence.
   */
  public async generateCopilotResponse(
    prompt: string,
    contextSummary: string = ''
  ): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
      const systemPrompt = `You are HUNTIQ Copilot, an elite B2B sales intelligence and revenue strategy assistant.
Your goal is to provide concise, data-backed, high-impact sales insights and next-step recommendations for enterprise revenue leaders.
Context data:
${contextSummary}

Respond directly and professionally in clean GitHub Markdown. Focus on actionable insights, "Why Now?" timing triggers, and clear sales moves.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Generates hyper-personalized cold outreach copy using Gemini.
   */
  public async generateOutreach(
    companyName: string,
    recipientName: string = 'Decision Maker',
    recipientRole: string = 'Head of People & Operations',
    signalText: string = 'hiring surge and regional expansion',
    tone: string = 'Executive & Direct'
  ): Promise<GeneratedOutreachContent> {
    if (this.isConfigured()) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
        const prompt = `You are an expert enterprise B2B sales copywriter.
Generate a high-converting cold outreach package for:
- Company: ${companyName}
- Recipient: ${recipientName} (${recipientRole})
- Trigger/Signal: ${signalText}
- Tone: ${tone}

Return a valid JSON object with the following exact keys:
{
  "subject": "Compelling, short 4-7 word email subject line",
  "body": "Personalized 3-paragraph email referencing the trigger, presenting ROI value proposition, and closing with a low-friction 10-minute call CTA",
  "followUp": "Short 2-sentence bump email to send 4 days later",
  "linkedinNote": "Under 280 character connection request note"
}
Output ONLY the raw JSON without markdown code fences.`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              subject: parsed.subject || `Scaling & execution readiness at ${companyName}`,
              body: parsed.body || `Hi ${recipientName},\n\nNoticed ${companyName}'s momentum around ${signalText}. Let's connect on accelerating execution.\n\nBest,\nAyoola`,
              followUp: parsed.followUp || `Hi ${recipientName}, following up on my previous note regarding ${companyName}'s growth.`,
              linkedinNote: parsed.linkedinNote || `Hi ${recipientName}, loved seeing ${companyName}'s growth. Would love to connect!`
            };
          }
        }
      } catch (err) {
        console.warn('Gemini outreach generation fallback triggered:', err);
      }
    }

    // Deterministic fallback if Gemini is offline / unconfigured
    const firstName = recipientName.split(' ')[0] || 'there';
    return {
      subject: tone === 'Executive & Direct'
        ? `Quick question re: ${companyName}'s expansion`
        : `Ideas for ${companyName}'s team during this growth phase`,
      body: `Hi ${firstName},\n\nSaw the announcement regarding "${signalText}" at ${companyName} — congratulations on the momentum!\n\nTypically, when organizations scale at this pace, leaders in your position face bottlenecks around team coordination, execution velocity, and managing operational complexity.\n\nWe’ve helped similar leadership teams unlock 30%+ efficiency improvements without adding overhead.\n\nDo you have 10 minutes this Thursday or Friday for a brief conversation on how we can support ${companyName}?\n\nBest regards,\nAyoola Ade\nHUNTIQ Growth Team`,
      followUp: `Hi ${firstName},\n\nFollowing up on my previous note. Thought you might find this relevant given ${companyName}'s recent milestones.\n\nWould you be open to a quick 5-minute sanity check later this week?\n\nBest,\nAyoola`,
      linkedinNote: `Hi ${firstName}, saw ${companyName}'s recent milestones regarding ${signalText}. Would love to connect and follow your journey!`
    };
  }
}

export const geminiService = new GeminiService();
