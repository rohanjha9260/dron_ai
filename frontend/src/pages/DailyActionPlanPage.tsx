import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Clock, 
  Calendar, 
  Check, 
  Plus, 
  ArrowRight, 
  Zap, 
  Flame,
  Award
} from 'lucide-react';
import { DailyPlanTask } from '../types';
import { initialDailyPlanTasks } from '../data/mockUserData';

interface DailyActionPlanPageProps {
  setCurrentView: (view: string) => void;
}

export const DailyActionPlanPage: React.FC<DailyActionPlanPageProps> = ({ setCurrentView }) => {
  const [tasks, setTasks] = useState<DailyPlanTask[]>(initialDailyPlanTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('DSA');

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: DailyPlanTask = {
      id: `dp_${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      timeEstimate: '30 mins',
      completed: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          Daily Execution Tracker
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Your Plan For Today
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          High-performing engineers win by executing daily micro-sprints. Complete your checklist below to maintain 100% compliance.
        </p>
      </div>

      {/* Daily Progress Gauge Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-slate-900/90 to-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Today's Progress</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-display mt-0.5">
            {completedCount} / {tasks.length} completed <span className="text-cyan-400">({progressPct}%)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {progressPct === 100
              ? '🎉 Outstanding! All daily objectives finished. You are ahead of schedule.'
              : `${tasks.length - completedCount} tasks remaining to stay on track for your 12-week target.`}
          </p>
        </div>

        <div className="w-full sm:w-48 bg-slate-900 h-3 rounded-full overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Task List Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        
        {/* Add Task Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6 border-b border-white/10">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add custom task (e.g. Read Kafka partitioning article)"
            className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="bg-slate-950/80 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="DSA">DSA</option>
            <option value="Dev">Dev</option>
            <option value="SQL">SQL</option>
            <option value="GitHub">GitHub</option>
            <option value="SoftSkills">Soft Skills</option>
            <option value="Core CS">Core CS</option>
          </select>
          <button
            onClick={handleAddTask}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Checkable Tasks */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                task.completed
                  ? 'bg-slate-900/30 border-white/5 opacity-60'
                  : 'bg-slate-900/80 border-white/10 hover:border-indigo-500/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  task.completed 
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' 
                    : 'border-slate-600 bg-slate-800'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-semibold ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}>
                    {task.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Category: {task.category}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-white/5">
                {task.timeEstimate}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
