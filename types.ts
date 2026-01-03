
export type ToneStyle = 'Formal' | 'Energetic' | 'Calm' | 'Authoritative';
export type AccentType = 'Indian Neutral' | 'British Neutral' | 'Global English';
export type GenderType = 'Male' | 'Female';

export interface VoiceConfig {
  gender: GenderType;
  tone: ToneStyle;
  accent: AccentType;
  speed: number;
  pitch: number;
  voiceName: string;
}

export interface EventSegment {
  id: string;
  title: string;
  type: 'Welcome' | 'Introduction' | 'Transition' | 'Break' | 'Session' | 'Vote of Thanks' | 'Closing';
  content: string; // The script to be read
  durationMinutes: number;
  startTime?: string;
  speakerName?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface EventProject {
  id: string;
  name: string;
  date: string;
  description: string;
  rawContent: string;
  segments: EventSegment[];
  voiceConfig?: VoiceConfig;
  status: 'draft' | 'ready' | 'archived';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
  TIMELINE = 'TIMELINE',
  VOICE = 'VOICE',
  LIVE = 'LIVE'
}
