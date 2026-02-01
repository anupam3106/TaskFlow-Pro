
import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import { getTaskBreakdown } from '../services/geminiService';
import { IconSparkles } from './Icons';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  initialTask?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate.substring(0, 16));
      setSubTasks(initialTask.subTasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority(Priority.MEDIUM);
      setDueDate('');
      setSubTasks([]);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      subTasks
    });
    onClose();
  };

  const handleAISuggestions = async () => {
    if (!title.trim()) return;
    setIsAIThinking(true);
    const suggestions = await getTaskBreakdown(title, description);
    setSubTasks(suggestions);
    setIsAIThinking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 dark:border-zinc-800">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black tracking-tight">{initialTask ? 'Modify Task' : 'New Assignment'}</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-2">Subject</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Quarterly Report Analysis"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-2">Context</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any specific details or links..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-28 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-2">Severity</label>
                <div className="flex bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl gap-1">
                  {Object.values(Priority).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                        priority === p 
                          ? 'bg-white dark:bg-zinc-800 shadow-lg text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-400 dark:text-zinc-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-6 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/50 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800">
               <div className="flex justify-between items-center mb-4">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600">Smart Breakdown</label>
                 <button 
                  type="button" 
                  onClick={handleAISuggestions}
                  disabled={isAIThinking || !title}
                  className="flex items-center gap-1.5 text-xs font-black uppercase tracking-tighter text-indigo-600 dark:text-indigo-400 hover:opacity-80 disabled:opacity-50 transition"
                 >
                   <IconSparkles />
                   {isAIThinking ? 'Processing...' : 'Auto-Generate'}
                 </button>
               </div>
               <div className="space-y-2">
                 {subTasks.map((st, i) => (
                   <div key={i} className="flex gap-3 items-center bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm animate-slide-down" style={{ animationDelay: `${i * 0.05}s` }}>
                     <div className="w-2 h-2 rounded-full bg-indigo-400/30" />
                     <span className="flex-1 text-sm font-medium">{st}</span>
                     <button type="button" onClick={() => setSubTasks(subTasks.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-600 font-bold p-1">×</button>
                   </div>
                 ))}
                 {subTasks.length === 0 && (
                   <p className="text-xs text-slate-400 dark:text-zinc-500 italic py-2">Harness AI to create an actionable checklist automatically.</p>
                 )}
               </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-[0.2em] rounded-[2rem] transition-all shadow-2xl hover:scale-[1.02] active:scale-95 text-sm"
            >
              {initialTask ? 'Commit Changes' : 'Initialize Task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
