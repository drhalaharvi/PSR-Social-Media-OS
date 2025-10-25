// This is a mock API service to simulate backend interactions.
import { GoogleGenAI, GenerateContentParameters, Type } from "@google/genai";
import { getProviders, connectionStore } from './secrets';

// --- TYPES ---
interface HealthStatus {
  ok: boolean;
}

interface BrandAnswer {
  answer: string;
  sources: string[];
}

export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface PlannedPost {
  id: string;
  date: string; // YYYY-MM-DD
  channel: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN';
  pillar: string;
  idea: string;
  status: PostStatus;
}

export interface CreativeSuggestion {
    hook: string;
    caption: string;
    altText: string;
    hashtags: string[];
    firstComment: string;
    citations: string[];
    imageUrl?: string;
}

export type InboxItemSource = 'Facebook Comment' | 'Instagram DM' | 'Google Review' | 'LinkedIn Reply';
export type Sentiment = 'Positive' | 'Negative' | 'Neutral';
export type Intent = 'Question' | 'Complaint' | 'Feedback' | 'Appointment Request';

export interface InboxItem {
  id: string;
  source: InboxItemSource;
  author: string;
  content: string;
  timestamp: string;
  sentiment: Sentiment;
  intent: Intent;
  flagged: boolean;
}

export interface ReplyTemplate {
  id: string;
  name: string;
  text: string;
}

export interface ExperimentVariant {
    id: string;
    name: string; // e.g., "Hook A", "Thumbnail B"
    impressions: number;
    clicks: number;
    alpha: number; // successes for beta distribution
    beta: number; // failures for beta distribution
}

export interface Experiment {
    id: string;
    name: string;
    status: 'Running' | 'Paused' | 'Completed';
    variants: ExperimentVariant[];
}


// --- STATE MANAGEMENT (MOCKS) ---
let brandFacts: string[] = []; // In-memory RAG store
let masterPlan: PlannedPost[] = []; // Central source of truth for the plan
let experiments: Record<string, Experiment> = {}; // In-memory experiment store

// --- GEMINI INITIALIZATION ---
const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY is not set in the environment.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

// --- API OBJECT ---
export const api = {
  healthCheck: async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ok: true };
  },

  uploadBrandDocument: async (file: File): Promise<{ success: boolean; message: string; chunks_created: number }> => {
    const text = await file.text();
    const chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 10);
    brandFacts = chunks;
    return {
      success: true,
      message: `Document '${file.name}' uploaded and processed successfully.`,
      chunks_created: chunks.length,
    };
  },

  getBrandAnswer: async (question: string): Promise<BrandAnswer> => {
    if (brandFacts.length === 0) return { answer: "The brand knowledge base is empty. Please upload a document.", sources: [] };
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const retrievedChunks = brandFacts.filter(fact => questionWords.some(word => fact.toLowerCase().includes(word)));
    const finalContext = retrievedChunks.length > 0 ? retrievedChunks : brandFacts.slice(0, 5);
    const contextString = finalContext.map((chunk, i) => `[Source ${i+1}]: ${chunk}`).join("\n\n");
    
    const ai = getGeminiClient();
    if (!ai) return { answer: "Gemini API key not configured.", sources: [] };

    const systemInstruction = `You are a helpful AI assistant for a healthcare clinic's social media team. Answer questions based *only* on the provided context documents. Do not use outside information. If the answer isn't in the sources, say so. After the answer, cite the source numbers used, like this: (Source 1), (Source 1, 2).`;
    const prompt = `CONTEXT DOCUMENTS:\n---\n${contextString}\n---\n\nQUESTION: ${question}`;

    try {
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction } });
      return { answer: response.text, sources: finalContext };
    } catch (error) {
      console.error("Error generating brand answer:", error);
      return { answer: "An error occurred generating an answer.", sources: [] };
    }
  },

  getChatbotResponse: async (message: string, history: GenerateContentParameters['contents']): Promise<string> => {
    const ai = getGeminiClient();
    if (!ai) return "Gemini API key not configured.";

    let modelName = 'gemini-2.5-flash';
    try {
      const classificationPrompt = `Is the following user query simple or complex? A simple query is a basic factual question or greeting. A complex query requires reasoning, creative generation, or detailed explanation. Respond with only 'SIMPLE' or 'COMPLEX'.\n\nQuery: ${message}`;
      const classificationResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: classificationPrompt });
      if (classificationResponse.text.trim().toUpperCase() === 'COMPLEX') modelName = 'gemini-2.5-pro';
    } catch (error) {
      console.error("Error during query classification:", error);
    }

    try {
      const chat = ai.chats.create({ model: modelName, history });
      const response = await chat.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error(`Error generating content with ${modelName}:`, error);
      throw new Error("Failed to get response from AI model.");
    }
  },

  // --- AI PLANNER APIS ---
  getPlan: async (): Promise<PlannedPost[]> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 200));
    return JSON.parse(JSON.stringify(masterPlan)); // Return a deep copy
  },

  generatePlan: async (inputs: { cadence: string; pillars: string; blackout_dates: string; events: string; }): Promise<PlannedPost[]> => {
    const ai = getGeminiClient();
    if (!ai) throw new Error("API key not configured.");
    
    const systemInstruction = "You are an expert social media strategist for a healthcare clinic. Generate a 30-day content plan in a valid JSON array format based on user inputs. Each object must have 'date' (YYYY-MM-DD), 'channel' (FACEBOOK, INSTAGRAM, TWITTER, or LINKEDIN), 'pillar', and 'idea' properties.";
    const prompt = `Generate a 30-day plan starting from tomorrow. Inputs:\n- Cadence: ${inputs.cadence}\n- Pillars: ${inputs.pillars}\n- Blackout Dates: ${inputs.blackout_dates}\n- Special Events: ${inputs.events}\n\nReturn ONLY the JSON array.`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                channel: { type: Type.STRING, enum: ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN'] },
                pillar: { type: Type.STRING },
                idea: { type: Type.STRING }
            },
            required: ["date", "channel", "pillar", "idea"]
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema }
        });

        const planJson = JSON.parse(response.text);
        masterPlan = planJson.map((item: any) => ({ ...item, id: crypto.randomUUID(), status: 'draft' }));
        return masterPlan;
    } catch (error) {
        console.error("Error generating plan:", error);
        throw new Error("Failed to generate content plan.");
    }
  },

  updatePost: async(post: PlannedPost): Promise<PlannedPost> => {
     console.log("Updating post:", post.id, "New date:", post.date, "Status:", post.status);
     // Simulate network delay and potential failure
     await new Promise(res => setTimeout(res, 600));
     if (Math.random() < 0.1) { // 10% chance of failure
        console.error("Mock API Error: Failed to update post", post.id);
        throw new Error("Failed to save post update.");
     }
     const postIndex = masterPlan.findIndex(p => p.id === post.id);
     if (postIndex !== -1) {
        masterPlan[postIndex] = post;
     }
     return post;
  },

  // --- CREATIVE STUDIO API ---
  getCreativeSuggestions: async (brief: { objective: string; channel: string; tone: string; notes: string; }): Promise<CreativeSuggestion[]> => {
    const ai = getGeminiClient();
    if (!ai) throw new Error("API key not configured.");

    const retrievedFacts = brandFacts.slice(0, 5); // Mock RAG retrieval
    const contextString = retrievedFacts.map((fact, i) => `[Source ${i+1}]: ${fact}`).join("\n");
    const systemInstruction = "You are an AI copywriter for a healthcare clinic. Generate 3 creative variants for a social media post. For the 'altText', write a detailed, descriptive paragraph suitable for visually impaired users, which will also serve as a high-quality prompt for an AI image generator. Cite the sources you used.";
    const prompt = `BRIEF:\n- Goal: ${brief.objective}\n- Channel: ${brief.channel}\n- Tone: ${brief.tone}\n- Notes: ${brief.notes}\n\nBRAND FACTS:\n${contextString}\n\nGenerate 3 distinct variants.`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                hook: { type: Type.STRING },
                caption: { type: Type.STRING },
                altText: { type: Type.STRING, description: "Detailed, descriptive text for image generation." },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                firstComment: { type: Type.STRING },
                citations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["hook", "caption", "altText", "hashtags", "firstComment", "citations"]
        }
    };

    try {
        const textResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema }
        });
        const textVariants: Omit<CreativeSuggestion, 'imageUrl'>[] = JSON.parse(textResponse.text);

        const getAspectRatio = (channel: string): "1:1" | "16:9" | "4:3" | "9:16" => {
            switch (channel.toUpperCase()) {
                case 'TWITTER': return '16:9';
                case 'INSTAGRAM_STORY': return '9:16';
                case 'FACEBOOK': return '4:3';
                case 'INSTAGRAM':
                case 'LINKEDIN':
                default: return '1:1';
            }
        };

        const suggestionsWithImages = await Promise.all(
            textVariants.map(async (variant) => {
                try {
                    const response = await ai.models.generateImages({
                      model: 'imagen-4.0-generate-001',
                      prompt: variant.altText,
                      config: {
                        numberOfImages: 1,
                        aspectRatio: getAspectRatio(brief.channel),
                        outputMimeType: 'image/png',
                      },
                    });
                    const imageUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
                    return { ...variant, imageUrl };
                } catch (imgError) {
                    console.error("Error generating image for variant:", imgError);
                    return { ...variant, imageUrl: '' };
                }
            })
        );
        return suggestionsWithImages;

    } catch (error) {
        console.error("Error getting creative suggestions:", error);
        throw new Error("Failed to get creative suggestions.");
    }
  },
  
  // --- UNIFIED INBOX APIS ---
  getInboxItems: async (): Promise<InboxItem[]> => {
    const mockItems: Omit<InboxItem, 'sentiment' | 'intent'>[] = [
        { id: '1', source: 'Facebook Comment', author: 'John Doe', content: 'Do you offer telehealth appointments for dermatology?', timestamp: '2 hours ago', flagged: false },
        { id: '2', source: 'Google Review', author: 'Jane Smith', content: 'The wait time was over an hour and the front desk was rude. Very disappointed with my experience.', timestamp: '1 day ago', flagged: false },
        { id: '3', source: 'Instagram DM', author: 'sam_wilson', content: 'Hi! Can I book an appointment for a flu shot next week?', timestamp: '3 days ago', flagged: false },
        { id: '4', source: 'LinkedIn Reply', author: 'Dr. Emily Carter', content: 'Great article on preventative care. It aligns with our latest research.', timestamp: '5 days ago', flagged: false },
    ];

    const ai = getGeminiClient();
    if (!ai) return mockItems.map(item => ({ ...item, sentiment: 'Neutral', intent: 'Question' }));

    const analysisPromises = mockItems.map(async (item) => {
      const prompt = `Analyze the following message and return its sentiment and intent.
      Message: "${item.content}"
      Sentiment must be one of: Positive, Negative, Neutral.
      Intent must be one of: Question, Complaint, Feedback, Appointment Request.
      Return a valid JSON object with "sentiment" and "intent" keys.`;
      const responseSchema = {
          type: Type.OBJECT,
          properties: {
              sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
              intent: { type: Type.STRING, enum: ['Question', 'Complaint', 'Feedback', 'Appointment Request'] }
          },
          required: ["sentiment", "intent"]
      };

      try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema }});
        const analysis = JSON.parse(response.text);
        return { ...item, ...analysis };
      } catch (e) {
        console.error("Failed to analyze inbox item", e);
        return { ...item, sentiment: 'Neutral', intent: 'Question' };
      }
    });

    return Promise.all(analysisPromises);
  },

  getInboxReply: async (item: InboxItem): Promise<{ draft: string; escalation: boolean }> => {
    const ai = getGeminiClient();
    if (!ai) return { draft: "Error: API key not configured.", escalation: false };
    
    let systemInstruction = `You are an AI assistant for a healthcare clinic's social media team. Your goal is to draft safe, empathetic, and compliant replies.
    Policy Rules:
    1.  **NEVER provide medical advice.**
    2.  If the user asks a medical question (about symptoms, treatments, conditions), your ONLY response must be the text "escalate:clinician". Do not add any other text.
    3.  For negative reviews, be empathetic, do not admit fault, and guide the user to a private channel (e.g., "We're sorry to hear about your experience. Please call our clinic manager at...").
    4.  If asked about appointments or hours, be helpful and provide the information if available in brand facts.
    5.  Always be professional and friendly.`;

    const prompt = `Draft a reply for this message from ${item.source}:\n\nAuthor: ${item.author}\nMessage: "${item.content}"`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction }});
        const draft = response.text.trim();

        if (draft === "escalate:clinician") {
            return { draft: "Clinical escalation required.", escalation: true };
        }
        return { draft, escalation: false };
    } catch (e) {
        console.error("Error generating reply:", e);
        return { draft: "Failed to generate reply.", escalation: false };
    }
  },

  getReplyTemplates: async(): Promise<ReplyTemplate[]> => ([
      { id: '1', name: 'Hours Inquiry', text: 'Thanks for asking! Our clinic is open Monday-Friday from 8 AM to 5 PM, and on Saturdays from 9 AM to 1 PM.'},
      { id: '2', name: 'Appointment Booking', text: 'We can certainly help with that. The best way to book an appointment is to call our front desk at 555-123-4567 or visit our website: www.healwellclinic.com/appointments.'},
      { id: '3', name: 'Thank You', text: 'Thank you so much for your kind words! We appreciate you being a part of the HealWell Clinic family.'}
  ]),
  
  flagInboxItem: async (itemId: string, flagged: boolean): Promise<void> => {
    console.log(`Setting item ${itemId} flagged status to ${flagged}`);
  },

  // --- EXPERIMENTS API ---
  getExperiments: async (): Promise<Experiment[]> => Object.values(experiments),

  createExperiment: async (name: string, variants: string[]): Promise<Experiment> => {
    const newExperiment: Experiment = {
        id: `exp_${crypto.randomUUID()}`,
        name,
        status: 'Running',
        variants: variants.map(v => ({
            id: `var_${crypto.randomUUID()}`,
            name: v,
            impressions: 0,
            clicks: 0,
            alpha: 1, // Start with 1 success
            beta: 1   // Start with 1 failure
        }))
    };
    experiments[newExperiment.id] = newExperiment;
    return newExperiment;
  },

  runExperimentSimulation: async(experimentId: string, iterations: number = 1): Promise<Experiment> => {
    const experiment = experiments[experimentId];
    if (!experiment) throw new Error("Experiment not found.");

    // True CTRs for the simulation (unknown to the bandit)
    const trueCTRs = experiment.variants.map(() => Math.random() * 0.1); 
    console.log("Simulation True CTRs:", trueCTRs);

    for (let i = 0; i < iterations; i++) {
        // Thompson Sampling: sample from the Beta distribution for each variant
        const samples = experiment.variants.map(v => {
            // Basic Beta sampler (in reality, use a library)
            const a = v.alpha, b = v.beta;
            let sample = 0;
            for(let j=0; j<a; j++) sample += Math.log(Math.random());
            for(let j=0; j<b; j++) sample -= Math.log(Math.random());
            return Math.exp(sample / (a + b));
        });

        const bestVariantIndex = samples.indexOf(Math.max(...samples));
        const chosenVariant = experiment.variants[bestVariantIndex];
        
        // Simulate an impression and a click based on the true CTR
        chosenVariant.impressions += 1;
        if (Math.random() < trueCTRs[bestVariantIndex]) {
            chosenVariant.clicks += 1;
            chosenVariant.alpha += 1; // Success
        } else {
            chosenVariant.beta += 1; // Failure
        }
    }
    return experiment;
  },
  
  // --- COMPETITOR ANALYSIS API ---
  getCompetitorAnalysis: async (competitorHandle: string): Promise<any> => {
      const mockPosts = [
          "Struggling with seasonal allergies? Our new allergy testing can pinpoint the cause. Book today!",
          "Meet Dr. Evans, our new head of cardiology! She brings 15 years of experience from Johns Hopkins.",
          "We're proud to support the local 5K run for health awareness this weekend! #CommunityHealth",
          "Did you know? Drinking enough water can boost your energy levels by up to 20%. #HealthTips",
      ];

      const ai = getGeminiClient();
      if (!ai) return null;

      const prompt = `Analyze the following social media posts from a competitor clinic (@${competitorHandle}). Based on these posts, identify their primary content pillars, their tone of voice, and their likely posting frequency.
      
      POSTS:
      - "${mockPosts.join('"\n- "')}"
      
      Return a valid JSON object with "pillars" (an array of strings), "tone" (a string), and "frequency" (a string).`;
      
      const responseSchema = {
          type: Type.OBJECT,
          properties: {
              pillars: { type: Type.ARRAY, items: { type: Type.STRING }},
              tone: { type: Type.STRING },
              frequency: { type: Type.STRING }
          },
          required: ["pillars", "tone", "frequency"]
      };

      try {
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: { responseMimeType: "application/json", responseSchema }
          });
          const analysis = JSON.parse(response.text);
          return { analysis, posts: mockPosts };
      } catch(e) {
          console.error("Error analyzing competitor:", e);
          return null;
      }
  },

  // --- CONNECTOR APIS ---
  getProviders: async () => getProviders(),
  updateApiKeyConnection: async (providerId: string, key: string, secret: string) => {
    console.log(`Connecting ${providerId} with key: ${key}`);
    const provider = connectionStore[providerId];
    if (provider && provider.authType === 'apikey') {
        provider.connected = true;
        provider.credentials.apiKey = key;
        provider.credentials.apiSecret = secret;
    }
  },
  toggleOAuthConnection: async (providerId: string, connect: boolean) => {
     console.log(`${connect ? 'Connecting' : 'Disconnecting'} ${providerId}`);
     const provider = connectionStore[providerId];
     if (provider && provider.authType === 'oauth') {
        provider.connected = connect;
     }
  }
};

// --- MOCK WORKER ---
const runScheduler = () => {
  setInterval(() => {
    masterPlan.forEach(post => {
        if (post.status === 'approved') {
            post.status = 'scheduled';
            console.log(`[WORKER] Post ${post.id} is now scheduled.`);
            
            setTimeout(() => {
                // Simulate publishing, with a chance of failure
                if (Math.random() < 0.15) {
                    post.status = 'failed';
                    console.error(`[WORKER] Post ${post.id} failed to publish.`);
                } else {
                    post.status = 'published';
                    console.log(`[WORKER] Post ${post.id} has been published.`);
                }
            }, 5000); // 5 second delay to simulate publishing time
        }
    });
  }, 10000); // Check for approved posts every 10 seconds
};

runScheduler();