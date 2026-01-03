
import React, { useState, useEffect } from 'react';
import { EventProject, AppView, VoiceConfig } from './types';
import Dashboard from './components/Dashboard';
import UploadPanel from './components/UploadPanel';
import TimelineEditor from './components/TimelineEditor';
import VoiceSelector from './components/VoiceSelector';
import LiveHost from './components/LiveHost';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [events, setEvents] = useState<EventProject[]>([]);
  const [activeProject, setActiveProject] = useState<EventProject | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Persistence (mocked)
  useEffect(() => {
    const saved = localStorage.getItem('ai_events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const saveEvents = (newEvents: EventProject[]) => {
    setEvents(newEvents);
    localStorage.setItem('ai_events', JSON.stringify(newEvents));
  };

  const handleCreateNew = () => {
    setActiveProject(null);
    setView(AppView.CREATE);
  };

  const handleProcessed = (project: EventProject) => {
    setActiveProject(project);
    setView(AppView.TIMELINE);
  };

  const handleUpdateProject = (project: EventProject) => {
    setActiveProject(project);
  };

  const handleProceedToVoice = () => {
    setView(AppView.VOICE);
  };

  const handleVoiceConfirm = (config: VoiceConfig) => {
    if (activeProject) {
      const updated = { ...activeProject, voiceConfig: config, status: 'ready' as const };
      setActiveProject(updated);
      
      // Update global events list
      const exists = events.find(e => e.id === updated.id);
      if (exists) {
        saveEvents(events.map(e => e.id === updated.id ? updated : e));
      } else {
        saveEvents([...events, updated]);
      }
      
      setView(AppView.LIVE);
    }
  };

  const handleEventFinish = () => {
    setView(AppView.DASHBOARD);
    setActiveProject(null);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <span className="font-black text-lg tracking-tight dark:text-white uppercase">AI Host <span className="text-indigo-600">Pro</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 000 14 7 7 0 000-14z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            events={events} 
            onSelectEvent={(e) => {
              setActiveProject(e);
              setView(e.status === 'ready' ? AppView.LIVE : AppView.TIMELINE);
            }} 
            onCreateNew={handleCreateNew} 
          />
        )}

        {view === AppView.CREATE && (
          <UploadPanel 
            onProcessed={handleProcessed} 
            onCancel={() => setView(AppView.DASHBOARD)} 
          />
        )}

        {view === AppView.TIMELINE && activeProject && (
          <TimelineEditor 
            project={activeProject} 
            onUpdate={handleUpdateProject} 
            onProceed={handleProceedToVoice} 
          />
        )}

        {view === AppView.VOICE && (
          <VoiceSelector 
            onConfirm={handleVoiceConfirm} 
            onBack={() => setView(AppView.TIMELINE)} 
          />
        )}

        {view === AppView.LIVE && activeProject && (
          <LiveHost 
            project={activeProject} 
            onFinish={handleEventFinish} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
