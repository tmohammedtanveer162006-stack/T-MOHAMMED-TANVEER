
import React, { useState } from 'react';
import { EventProject, EventSegment } from '../types';
import { Button, Card, Header, Badge } from './Shared';

interface TimelineEditorProps {
  project: EventProject;
  onUpdate: (project: EventProject) => void;
  onProceed: () => void;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ project, onUpdate, onProceed }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdateSegment = (id: string, updates: Partial<EventSegment>) => {
    const newSegments = project.segments.map(s => s.id === id ? { ...s, ...updates } : s);
    onUpdate({ ...project, segments: newSegments });
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Break': return 'rose';
      case 'Welcome':
      case 'Closing': return 'emerald';
      case 'Session': return 'indigo';
      default: return 'slate';
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header 
        title="Event Timeline" 
        subtitle="Review and refine the AI-generated hosting script." 
        actions={<Button onClick={onProceed}>Voice Configuration &rarr;</Button>}
      />

      <div className="space-y-4">
        {project.segments.map((segment, index) => (
          <Card key={segment.id} className={`p-5 transition-all ${editingId === segment.id ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0 flex md:flex-col items-center justify-center gap-2 md:w-20">
                <span className="text-2xl font-black text-slate-200 dark:text-slate-800">#{index + 1}</span>
                <Badge color={getTypeColor(segment.type)}>{segment.type}</Badge>
              </div>

              <div className="flex-grow">
                {editingId === segment.id ? (
                  <div className="space-y-4">
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded text-lg font-bold outline-none"
                      value={segment.title}
                      onChange={e => handleUpdateSegment(segment.id, { title: e.target.value })}
                    />
                    <textarea 
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm font-mono outline-none"
                      value={segment.content}
                      onChange={e => handleUpdateSegment(segment.id, { content: e.target.value })}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>Done</Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingId(segment.id)} className="cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold">{segment.title}</h4>
                      <span className="text-sm text-slate-400">{segment.durationMinutes} mins</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 italic">
                      "{segment.content}"
                    </p>
                    {segment.speakerName && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-slate-400">Speaker:</span>
                        <span className="text-xs font-bold text-indigo-500">{segment.speakerName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimelineEditor;
