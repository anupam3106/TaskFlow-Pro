
import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { IconCheck, IconTrash, IconEdit, IconCalendar } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    [Priority.LOW]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    [Priority.MEDIUM]: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    [Priority.HIGH]: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
  const formattedDate = new Date(task.dueDate).toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group relative bg-white dark:bg-zinc-900 p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${
        isExpanded 
          ? 'ring-2 ring-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 shadow-xl' 
          : 'border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-zinc-700'
      } ${task.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-1 w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
            task.completed 
              ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-200 dark:shadow-none' 
              : 'border-slate-300 dark:border-zinc-600 hover:border-indigo-500 group-hover:scale-105'
          }`}
        >
          {task.completed && <IconCheck />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`font-bold text-lg leading-tight transition-all truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-zinc-100'}`}>
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-rose-500' : 'text-slate-400 dark:text-zinc-500'}`}>
              <IconCalendar />
              <span>{formattedDate}</span>
            </div>
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                 <span className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-widest">
                  {task.subTasks.length} Steps
                </span>
              </div>
            )}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800 animate-slide-down">
              {task.description && (
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  {task.description}
                </p>
              )}
              
              {task.subTasks && task.subTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Checklist</h4>
                  {task.subTasks.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1 group/step">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-600 group-hover/step:scale-125 transition-transform" />
                      <span className="text-sm text-slate-700 dark:text-zinc-300">{step}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-end sm:hidden">
                 <span className="text-[10px] text-slate-400 italic">Click to collapse</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition"
            title="Edit"
          >
            <IconEdit />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this task?')) onDelete(task.id);
            }}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition"
            title="Delete"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
