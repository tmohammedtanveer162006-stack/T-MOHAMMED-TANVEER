
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { EventProject, EventSegment, VoiceConfig } from "../types";

// Initialize the Gemini AI client with the API key from environment variables
// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for audio decoding
export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export async function generateEventScript(rawContent: string, eventName: string): Promise<EventSegment[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an elite AI Event Host. Analyze the provided multi-source content for the event: "${eventName}". 
    The content might be extracted from PDFs, Word docs, and Slides.
    Your task is to:
    1. Extract a clear timeline of sessions.
    2. Identify all speakers and their specific roles.
    3. Generate high-fidelity professional anchor scripts for every transition.
    4. Create filler announcements for gaps.
    
    Structure the script with these specific segment types: 'Welcome', 'Introduction', 'Transition', 'Break', 'Session', 'Vote of Thanks', 'Closing'.
    
    Content Dump: ${rawContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            content: { type: Type.STRING, description: "The professional anchor script for this segment. Speak in a natural, authoritative, yet engaging tone." },
            durationMinutes: { type: Type.NUMBER },
            speakerName: { type: Type.STRING, nullable: true }
          },
          required: ["id", "title", "type", "content", "durationMinutes"]
        }
      }
    }
  });

  try {
    // Handle potentially undefined response text gracefully
    // The GenerateContentResponse object features a text property (not a method)
    const text = (response.text || "").trim();
    return JSON.parse(text).map((s: any, idx: number) => ({
      ...s,
      isCompleted: false,
      isCurrent: idx === 0
    }));
  } catch (e) {
    console.error("Failed to parse script", e);
    return [];
  }
}

export async function speakScript(text: string, config: VoiceConfig): Promise<AudioBuffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `In a ${config.tone.toLowerCase()} ${config.accent.toLowerCase()} style: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decodeBase64(base64Audio);
    return await decodeAudioData(audioBytes, audioContext, 24000, 1);
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
}
