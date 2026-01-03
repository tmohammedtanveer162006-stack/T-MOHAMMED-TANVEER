
import React from 'react';
import { EventProject, AppView } from '../types';
import { Card, Button, Header, Badge } from './Shared';

interface DashboardProps {
  events: EventProject[];
  onSelectEvent: (event: EventProject) => void;
  onCreateNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ events, onSelectEvent, onCreateNew }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header 
        title="Event Dashboard" 
        subtitle="Manage your upcoming programs and AI hosts." 
        actions={
          <Button onClick={onCreateNew}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Create New Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-xl font-medium">No events found</p>
            <p className="text-sm">Click 'Create New Event' to get started.</p>
          </div>
        ) : (
          events.map(event => (
            <Card key={event.id} className="group hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer overflow-hidden" >
              <div className="p-6 h-full flex flex-col" onClick={() => onSelectEvent(event)}>
                <div className="flex items-center justify-between mb-3">
                  <Badge color={event.status === 'ready' ? 'emerald' : 'slate'}>{event.status.toUpperCase()}</Badge>
                  <span className="text-xs text-slate-400">{event.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{event.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 flex-grow">
                  {event.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">AI</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">V</div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Launch Host &rarr;</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
