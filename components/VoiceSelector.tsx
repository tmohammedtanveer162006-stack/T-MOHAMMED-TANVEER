
import React, { useState } from 'react';
import { VoiceConfig, GenderType, ToneStyle, AccentType } from '../types';
import { Button, Card, Header } from './Shared';
import { speakScript } from '../services/geminiService';

interface VoiceSelectorProps {
  onConfirm: (config: VoiceConfig) => void;
  onBack: () => void;
}

const VOICE_PRESETS = {
  'Male': {
    'Formal': 'Kore',
    'Energetic': 'Puck',
    'Calm': 'Charon',
    'Authoritative': 'Fenrir'
  },
  'Female': {
    'Formal': 'Zephyr',
    'Energetic': 'Zephyr', // Gemini currently has limited prebuilt female voices, reusing Zephyr
    'Calm': 'Zephyr',
    'Authoritative': 'Zephyr'
  }
};

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onConfirm, onBack }) => {
  const [config, setConfig] = useState<VoiceConfig>({
    gender: 'Male',
    tone: 'Formal',
    accent: 'Global English',
    speed: 1.0,
    pitch: 1.0,
    voiceName: 'Kore'
  });
  const [isPreviewing, setIsPreviewing] = useState(false);

  const updateConfig = (updates: Partial<VoiceConfig>) => {
    const newConfig = { ...config, ...updates };
    // Re-calculate voice name based on gender/tone if those changed
    if (updates.gender || updates.tone) {
      newConfig.voiceName = (VOICE_PRESETS as any)[newConfig.gender][newConfig.tone];
    }
    setConfig(newConfig);
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    const buffer = await speakScript(`Welcome to our event. I will be your AI anchor for today's session.`, config);
    if (buffer) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    }
    setIsPreviewing(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header title="Voice Selection" subtitle="Choose the persona for your AI Event Host." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3">Host Persona</label>
            <div className="flex gap-2">
              {(['Male', 'Female'] as GenderType[]).map(g => (
                <button 
                  key={g} 
                  onClick={() => updateConfig({ gender: g })}
                  className={`flex-1 py-3 rounded-lg font-bold border-2 transition-all ${config.gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">Tone & Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Formal', 'Energetic', 'Calm', 'Authoritative'] as ToneStyle[]).map(t => (
                <button 
                  key={t} 
                  onClick={() => updateConfig({ tone: t })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${config.tone === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700 bg-transparent'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">Accent</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-lg outline-none"
              value={config.accent}
              onChange={e => updateConfig({ accent: e.target.value as AccentType })}
            >
              <option>Global English</option>
              <option>Indian Neutral</option>
              <option>British Neutral</option>
            </select>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h4 className="font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 000-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              Speech Dynamics
            </h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span>Speed</span>
                  <span>{config.speed}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" 
                  className="w-full accent-indigo-600"
                  value={config.speed}
                  onChange={e => updateConfig({ speed: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span>Pitch</span>
                  <span>{config.pitch}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" 
                  className="w-full accent-indigo-600"
                  value={config.pitch}
                  onChange={e => updateConfig({ pitch: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <Button variant="secondary" className="w-full py-4" onClick={handlePreview} disabled={isPreviewing}>
              {isPreviewing ? 'Generating...' : 'Preview Voice'}
            </Button>
          </Card>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onBack}>Back</Button>
            <Button className="flex-[2] py-4" onClick={() => onConfirm(config)}>Confirm & Start Event</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
