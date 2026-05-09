import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const TeamTasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Design system updates', completed: false, priority: 'high' },
        { id: '2', title: 'Prepare Q3 slide deck', completed: true, priority: 'medium' },
        { id: '3', title: 'Review PRs for frontend', completed: false, priority: 'low' },
    ]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low'|'medium'|'high'>('medium');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        setTasks([{ id: Date.now().toString(), title: newTaskTitle, completed: false, priority: newTaskPriority }, ...tasks]);
        setNewTaskTitle('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
        setTasks(tasks.map(t => t.id === id ? { ...t, priority } : t));
    };

    const priorityColors = {
        low: 'bg-[#1a2f24] text-green-400 border border-green-500/20',
        medium: 'bg-[#332a14] text-amber-400 border border-amber-500/20',
        high: 'bg-[#36181b] text-red-400 border border-red-500/20'
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 p-6 bg-white/[0.03] backdrop-blur-3xl rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors font-['Plus_Jakarta_Sans']"
                    />
                    <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none outline-none font-semibold uppercase tracking-wider text-xs"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                    </button>
                </form>
            </div>

            <div className="space-y-3">
                {tasks.map(task => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={task.id} 
                        className={`group flex items-center gap-4 p-5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-2xl rounded-[20px] transition-all border border-white/5 hover:border-white/10 ${task.completed ? 'opacity-50 grayscale-[50%]' : ''}`}
                    >
                        <button onClick={() => toggleTask(task.id)} className="shrink-0 text-gray-500 hover:text-indigo-400 transition-colors focus:outline-none">
                            {task.completed ? <CheckCircle2 className="w-6 h-6 text-indigo-400" /> : <Circle className="w-6 h-6" />}
                        </button>
                        
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className={`text-white font-medium text-base truncate font-['Plus_Jakarta_Sans'] transition-colors ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                            </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 opacity-100 md:opacity-80 md:group-hover:opacity-100 transition-opacity">
                            <div className="relative">
                                <select
                                    value={task.priority}
                                    onChange={(e) => updatePriority(task.id, e.target.value as any)}
                                    className={`relative z-10 text-[10px] font-bold uppercase tracking-wider pl-3 pr-6 py-1.5 rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/50 ${priorityColors[task.priority]}`}
                                >
                                    <option value="low" className="bg-gray-900 text-green-400">LOW</option>
                                    <option value="medium" className="bg-gray-900 text-amber-400">MED</option>
                                    <option value="high" className="bg-gray-900 text-red-400">HIGH</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>

                            <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors focus:outline-none">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-16">
                        <AlertCircle className="w-12 h-12 text-gray-600 mb-4 mx-auto" />
                        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">No tasks pending</p>
                    </div>
                )}
            </div>
        </div>
    );
};
