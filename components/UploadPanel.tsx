
import React, { useState, useRef } from 'react';
import { Button, Card, Header, Badge } from './Shared';
import { generateEventScript } from '../services/geminiService';
import { EventProject } from '../types';

interface UploadPanelProps {
  onProcessed: (project: EventProject) => void;
  onCancel: () => void;
}

interface FileEntry {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'xlsx' | 'other';
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onProcessed, onCancel }) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (name: string): FileEntry['type'] => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'docx';
    if (ext === 'ppt' || ext === 'pptx') return 'pptx';
    if (ext === 'txt' || ext === 'md') return 'txt';
    if (ext === 'xls' || ext === 'xlsx') return 'xlsx';
    return 'other';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly type 'f' as 'File' to resolve 'unknown' type error during mapping from FileList
      const newFiles = Array.from(e.target.files).map((f: File) => ({
        file: f,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending' as const,
        type: getFileType(f.name)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fix: Explicitly type 'f' as 'File' to resolve 'unknown' type error during mapping from DataTransfer FileList
      const newFiles = Array.from(e.dataTransfer.files).map((f: File) => ({
        file: f,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending' as const,
        type: getFileType(f.name)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const simulateExtraction = async (file: File) => {
    // In a real implementation, we'd use PDF.js or Mammoth.js
    // Here we simulate the time and complexity of "AI multi-format parsing"
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || `[Binary Content from ${file.name}]`);
      reader.readAsText(file.slice(0, 10000)); // Read first 10kb as sample
    });
  };

  const handleProcess = async () => {
    if (!eventName || files.length === 0) return;
    setIsProcessing(true);
    
    try {
      setProcessingStep('Initializing Multi-Format Neural Parser...');
      await new Promise(r => setTimeout(r, 1000));
      
      let aggregatedContent = "";
      const updatedFiles = [...files];

      for (let i = 0; i < updatedFiles.length; i++) {
        const f = updatedFiles[i];
        setProcessingStep(`Extracting Semantics from ${f.file.name}...`);
        f.status = 'processing';
        setFiles([...updatedFiles]);
        
        const text = await simulateExtraction(f.file);
        aggregatedContent += `\n--- SOURCE: ${f.file.name} ---\n${text}\n`;
        
        f.status = 'done';
        setFiles([...updatedFiles]);
        await new Promise(r => setTimeout(r, 500));
      }

      setProcessingStep('AI Orchestrating Event Flow...');
      const segments = await generateEventScript(aggregatedContent, eventName);
      
      const newProject: EventProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: eventName,
        date: new Date().toLocaleDateString(),
        description,
        rawContent: aggregatedContent,
        segments,
        status: 'draft'
      };
      onProcessed(newProject);
    } catch (err) {
      alert("Error processing contents. Our AI modules encountered a format mismatch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (type: FileEntry['type']) => {
    switch (type) {
      case 'pdf': return <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-bold text-xs">PDF</div>;
      case 'docx': return <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs">DOC</div>;
      case 'pptx': return <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold text-xs">PPT</div>;
      case 'xlsx': return <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold text-xs">XLS</div>;
      default: return <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">TXT</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <Header 
        title="Initialize AI Host" 
        subtitle="Upload schedules, speaker bios, and presentation outlines." 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Event Identity</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Event Title..."
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Short Theme/Motto..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Neural Ingestion Zone</label>
                <div 
                  className={`file-drop-zone relative rounded-2xl p-12 transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[300px] cursor-pointer group ${dragActive ? 'bg-indigo-50 dark:bg-indigo-900/20 scale-[0.99] border-indigo-500' : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  />
                  <div className={`w-20 h-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-xl transition-transform duration-500 ${dragActive ? 'scale-110 animate-pulse' : 'group-hover:scale-105'}`}>
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Drop Event Assets Here</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                    Supported: <span className="text-indigo-600 dark:text-indigo-400 font-bold">PDF, Word, PPT, Excel, Text</span>
                  </p>
                  <div className="mt-6 flex gap-2">
                    <Badge color="slate">Multi-Format OCR</Badge>
                    <Badge color="indigo">AI Extraction</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Processing Queue ({files.length})</h4>
              {files.length > 0 && <button onClick={() => setFiles([])} className="text-[10px] font-bold text-rose-500 hover:underline">Clear All</button>}
            </div>

            <div className="flex-grow space-y-3 overflow-y-auto max-h-[400px] pr-2">
              {files.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium">Waiting for assets...</p>
                </div>
              ) : (
                files.map(f => (
                  <div key={f.id} className="group relative flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right-4">
                    {getIcon(f.type)}
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold truncate pr-6">{f.file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{(f.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {f.status === 'done' && <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-md transition-all"
                    >
                      <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              {isProcessing && (
                <div className="mb-4 space-y-2">
                  <p className="text-[10px] font-black uppercase text-indigo-600 animate-pulse">{processingStep}</p>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-progress origin-left"></div>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={isProcessing}>Cancel</Button>
                <Button 
                  onClick={handleProcess} 
                  disabled={!eventName || files.length === 0 || isProcessing}
                  className="flex-[2] neon-glow"
                >
                  {isProcessing ? 'Synthesizing...' : 'Generate AI Script'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadPanel;
