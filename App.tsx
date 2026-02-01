
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Priority, FilterType, SortType, AppTheme, AlarmState } from './types';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import AlarmOverlay from './components/AlarmOverlay';
import ProgressBar from './components/ProgressBar';
// Added IconCheck to the imports
import { IconPlus, IconBell, IconSparkles, IconCheck } from './components/Icons';
import { getDailySummary } from './services/geminiService';

const App: React.FC = () => {
  // Persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('taskflow_theme');
    return saved ? JSON.parse(saved) : { darkMode: false, accentColor: '#4f46e5' };
  });

  // UI State
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [sort, setSort] = useState<SortType>('DATE');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [alarm, setAlarm] = useState<AlarmState>({ active: false });
  const [dailySummary, setDailySummary] = useState<string>('Analyzing your focus areas...');

  // Audio for alarm
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  audio.loop = true;

  // Effects
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_theme', JSON.stringify(theme));
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Daily Summary update
  useEffect(() => {
    const fetchSummary = async () => {
        const pending = tasks.filter(t => !t.completed);
        if (pending.length === 0) {
           setDailySummary("All caught up! Why not take a break or plan something new?");
           return;
        }
        const summary = await getDailySummary(pending);
        setDailySummary(summary);
    }
    fetchSummary();
  }, [tasks.length]);

  // Alarm Check Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const triggeringTask = tasks.find(t => 
        !t.completed && 
        !t.reminderSent && 
        new Date(t.dueDate) <= now
      );

      if (triggeringTask) {
        setAlarm({ active: true, task: triggeringTask });
        audio.play().catch(e => console.log('Audio play failed', e));
        
        if (Notification.permission === 'granted') {
          new Notification('TaskFlow Reminder', {
            body: triggeringTask.title,
            icon: '/favicon.ico'
          });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, audio]);

  // Notification Permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Actions
  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title || 'Untitled',
      description: taskData.description || '',
      priority: taskData.priority || Priority.MEDIUM,
      dueDate: taskData.dueDate || new Date().toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      reminderSent: false,
      subTasks: taskData.subTasks || []
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (!editingTask) return;
    setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    setEditingTask(null);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSnooze = (minutes: number) => {
    if (!alarm.task) return;
    const newDueDate = new Date(new Date().getTime() + minutes * 60000).toISOString();
    setTasks(tasks.map(t => t.id === alarm.task!.id ? { ...t, dueDate: newDueDate, reminderSent: false } : t));
    dismissAlarm();
  };

  const handleCompleteFromAlarm = () => {
    if (!alarm.task) return;
    handleToggleTask(alarm.task.id);
    dismissAlarm();
  };

  const dismissAlarm = () => {
    if (alarm.task) {
      setTasks(tasks.map(t => t.id === alarm.task!.id ? { ...t, reminderSent: true } : t));
    }
    setAlarm({ active: false });
    audio.pause();
    audio.currentTime = 0;
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const today = new Date().toDateString();
    if (filter === 'TODAY') {
      result = result.filter(t => new Date(t.dueDate).toDateString() === today);
    } else if (filter === 'UPCOMING') {
      result = result.filter(t => !t.completed && new Date(t.dueDate) > new Date());
    } else if (filter === 'COMPLETED') {
      result = result.filter(t => t.completed);
    }

    result.sort((a, b) => {
      if (sort === 'PRIORITY') {
        const pMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sort === 'NAME') return a.title.localeCompare(b.title);
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return result;
  }, [tasks, filter, sort]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length
  }), [tasks]);

  return (
    <div className="min-h-screen transition-all duration-500 ease-in-out">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-black tracking-tighter">Task<span className="text-indigo-600 dark:text-indigo-400">Flow</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme({ ...theme, darkMode: !theme.darkMode })}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-zinc-900 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              {theme.darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Efficiency</p>
              <p className="text-sm font-bold">{stats.completed}/{stats.total} Done</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Summary Card */}
          <div className="relative overflow-hidden bg-indigo-600 dark:bg-indigo-700 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                <IconSparkles /> Insights
            </h2>
            <p className="text-xl font-medium leading-snug mb-8">
                {dailySummary}
            </p>
            <ProgressBar current={stats.completed} total={stats.total} />
          </div>

          {/* Filter Sidebar */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400 dark:text-zinc-600 px-2">Navigation</h3>
            <div className="space-y-2">
              {(['ALL', 'TODAY', 'UPCOMING', 'COMPLETED'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    filter === f 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                    : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                  {filter === f && <IconCheck />}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-black uppercase tracking-widest mt-10 mb-6 text-slate-400 dark:text-zinc-600 px-2">Sorting</h3>
            <div className="flex gap-2">
              {(['DATE', 'PRIORITY', 'NAME'] as SortType[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    sort === s 
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          {/* Overdue Alert */}
          {stats.overdue > 0 && (
            <div className="bg-rose-500 dark:bg-rose-600 text-white rounded-[2rem] p-6 shadow-xl shadow-rose-500/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black">!</div>
                    <h3 className="font-bold">Prioritize Now</h3>
                </div>
                <p className="text-sm text-rose-50 font-medium">You have {stats.overdue} tasks past due date. They should be your focus.</p>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8">
          <div className="flex items-end justify-between mb-10 px-2">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-1">
                {filter === 'ALL' ? 'Everything' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </h2>
              <p className="text-slate-400 dark:text-zinc-500 font-medium">{filteredTasks.length} total assignments</p>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <IconPlus /> New Task
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={handleToggleTask} 
                  onDelete={handleDeleteTask}
                  onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-zinc-800">
                <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-slate-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-zinc-200">Clear Horizon</h3>
                <p className="text-slate-400 dark:text-zinc-500 mt-2 font-medium">Nothing on your plate right now.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="sm:hidden fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-white z-50 transform transition-transform hover:scale-110 active:scale-90"
      >
        <IconPlus />
      </button>

      <TaskForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingTask(null); }} 
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialTask={editingTask}
      />

      {alarm.active && alarm.task && (
        <AlarmOverlay 
          task={alarm.task}
          onDismiss={dismissAlarm}
          onSnooze={handleSnooze}
          onComplete={handleCompleteFromAlarm}
        />
      )}
    </div>
  );
};

export default App;
