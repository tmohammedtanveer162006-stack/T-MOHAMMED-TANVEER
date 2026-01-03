
import React, { useState, useEffect, useRef } from 'react';
import { EventProject, EventSegment } from '../types';
import { Card, Button, Badge } from './Shared';
import { speakScript } from '../services/geminiService';

interface LiveHostProps {
  project: EventProject;
  onFinish: () => void;
}

const LiveHost: React.FC<LiveHostProps> = ({ project, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<AudioBufferSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const currentSegment = project.segments[currentIdx];

  const playSegment = async (idx: number) => {
    if (idx >= project.segments.length) {
      onFinish();
      return;
    }

    const segment = project.segments[idx];
    setIsSpeaking(true);

    const buffer = await speakScript(segment.content, project.voiceConfig!);
    if (buffer && !isPaused) {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const source = ctxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(ctxRef.current.destination);
      source.onended = () => {
        setIsSpeaking(false);
        // In a real app, we might wait for the "durationMinutes" to pass or a manual "Next"
        // For this demo, we'll wait a few seconds then move to next segment automatically
        if (!isPaused) {
          setTimeout(() => handleNext(), 2000);
        }
      };
      audioRef.current = source;
      source.start();
    } else {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    playSegment(currentIdx);
    return () => {
      audioRef.current?.stop();
    };
  }, [currentIdx]);

  const handleNext = () => {
    audioRef.current?.stop();
    if (currentIdx < project.segments.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    audioRef.current?.stop();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      playSegment(currentIdx);
    } else {
      setIsPaused(true);
      audioRef.current?.stop();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] flex flex-col animate-in zoom-in-95 duration-500">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Main Stage */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-grow p-12 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-950 dark:to-slate-900 border-none">
            {/* Visualizer Mockup */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
               <div className="w-full h-full border-[40px] border-white rounded-full animate-pulse"></div>
            </div>

            <div className={`w-32 h-32 rounded-full mb-8 flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'bg-white scale-110 shadow-2xl' : 'bg-white/20 scale-100'}`}>
              <svg className={`w-16 h-16 ${isSpeaking ? 'text-indigo-600' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>

            <Badge color="emerald">{isSpeaking ? 'AI HOST SPEAKING' : 'IDLE / WAITING'}</Badge>
            <h2 className="text-4xl font-black text-white mt-6 mb-4">{currentSegment.title}</h2>
            <p className="text-white/80 text-xl max-w-lg italic font-light leading-relaxed">
              "{currentSegment.content}"
            </p>
          </Card>

          {/* Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handlePrev} disabled={currentIdx === 0}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button onClick={togglePause} variant={isPaused ? 'primary' : 'secondary'} className="w-32">
                  {isPaused ? (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Resume</>
                  ) : (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pause</>
                  )}
                </Button>
                <Button variant="secondary" onClick={handleNext} disabled={currentIdx === project.segments.length - 1}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </Button>
              </div>

              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speaker Context</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{currentSegment.speakerName || 'Host Solo'}</p>
                 </div>
                 <Button variant="danger" onClick={onFinish}>End Program</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Flow */}
        <Card className="overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Program Flow</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {project.segments.map((s, i) => (
              <div 
                key={s.id} 
                className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${i === currentIdx ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <span className="text-xs font-black opacity-40">{i + 1}</span>
                <div className="flex-grow overflow-hidden">
                  <p className="font-bold text-sm truncate">{s.title}</p>
                  <p className={`text-[10px] uppercase font-bold ${i === currentIdx ? 'text-indigo-200' : 'text-slate-400'}`}>{s.type}</p>
                </div>
                {i < currentIdx && <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveHost;
