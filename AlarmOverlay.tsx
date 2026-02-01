
import React from 'react';
import { Task } from '../types';
import { IconBell } from './Icons';

interface AlarmOverlayProps {
  task: Task;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onComplete: () => void;
}

const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ task, onDismiss, onSnooze, onComplete }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-100 dark:border-gray-700">
        <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <IconBell />
        </div>
        <h2 className="text-2xl font-bold mb-2">Reminder</h2>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{task.title}</h3>
        {task.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => onSnooze(5)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Snooze 5m
          </button>
          <button 
            onClick={() => onSnooze(15)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Snooze 15m
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition shadow-lg shadow-green-200 dark:shadow-none"
          >
            Mark as Completed
          </button>
          <button 
            onClick={onDismiss}
            className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-2xl transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlarmOverlay;
