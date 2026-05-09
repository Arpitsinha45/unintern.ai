import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Star, TrendingUp, Trophy, Zap, 
  MapPin, Calendar, Edit3, Share2, MessageSquare, 
  Target, Rocket, CheckCircle, Flame, Shield,
  Github, Twitter, Mail, ExternalLink
} from 'lucide-react';

// Subcomponents could be broken out, but keeping here for simplicity

const ProofOfWorkTabs = ['Challenges', 'Projects', 'Achievements'];

import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const reputationData = [
  { name: 'Jan', xp: 400 },
  { name: 'Feb', xp: 800 },
  { name: 'Mar', xp: 1200 },
  { name: 'Apr', xp: 1800 },
  { name: 'May', xp: 2400 },
  { name: 'Jun', xp: 2840 },
];

export const ProfilePage: React.FC = () => {
    const [powTab, setPowTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    // Mock Data
    const [profile, setProfile] = useState({
        name: "Arjun K.",
        tagline: "Top 5% Product Builder & AI Innovator",
        location: "San Francisco, CA",
        joinDate: "Joined March 2024",
        reputation: 2840,
        globalRank: 124,
        stats: {
            challengesCompleted: 42,
            winRate: 85,
            totalEarnings: "$12.4K",
            streak: 14,
            skillLevel: "Elite",
        },
        skills: ["React", "AI Integration", "Product Strategy", "Figma", "Node.js"],
        badges: [
            { id: 1, label: "Verified", icon: <CheckCircle className="w-3 h-3 text-blue-400" />, tip: "Identity verified" },
            { id: 2, label: "Top 5%", icon: <Trophy className="w-3 h-3 text-yellow-400" />, tip: "Top 5% Global Rank" },
            { id: 3, label: "Early Adopter", icon: <Zap className="w-3 h-3 text-purple-400" />, tip: "Joined in beta" }
        ],
        recentActivity: [
            { id: 1, text: "Completed 'AI Agent Architecture' challenge", time: "2 hours ago", type: 'challenge' },
            { id: 2, text: "Won against Sarah M. in 1v1 Code Battle", time: "1 day ago", type: 'battle' },
            { id: 3, text: "Uploaded project 'NeuroSync'", time: "3 days ago", type: 'project' },
        ],
        reviews: [
            { id: 1, author: "Sarah M.", rating: 5, text: "Arjun is a brilliant strategist. Highly recommend teaming up with him.", role: "Founder" },
            { id: 2, author: "Mike T.", rating: 5, text: "Lightning fast execution. Built our MVP in 48 hours.", role: "CTO" },
            { id: 3, author: "Elena R.", rating: 4.5, text: "Great communication and very technical.", role: "Product Manager" }
        ]
    });

    const [editForm, setEditForm] = useState({
        name: profile.name,
        tagline: profile.tagline,
        location: profile.location,
        skills: profile.skills.join(', '),
    });

    const handleSave = () => {
        setProfile({
            ...profile,
            name: editForm.name,
            tagline: editForm.tagline,
            location: editForm.location,
            skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
        });
        setIsEditing(false);
    };

    return (
        <div className="w-full flex flex-col items-center pb-24 font-['Plus_Jakarta_Sans'] text-white">
            <div className="w-full max-w-5xl px-4 mt-8 md:mt-12 flex flex-col gap-8">
                
                {/* SETTINGS / EDIT OVERLAY */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold tracking-tight">Edit Profile</h3>
                                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><Zap className="w-5 h-5 rotate-45" /></button>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Display Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tagline</label>
                                        <input type="text" value={editForm.tagline} onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Location</label>
                                        <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Skills (comma-separated)</label>
                                        <input type="text" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mt-2">
                                        <span className="text-sm font-medium">Public Profile</span>
                                        <div className="w-10 h-5 bg-cyan-500/20 border border-cyan-500/50 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-cyan-500 rounded-full absolute right-0.5 top-0.5"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-sm font-medium text-emerald-400">Available for Work</span>
                                        <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/50 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-emerald-500 rounded-full absolute right-0.5 top-0.5"></div>
                                        </div>
                                    </div>
                                    <button onClick={handleSave} className="w-full py-3 bg-white text-black font-bold tracking-wide rounded-xl mt-4 hover:bg-gray-200 transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 1. HEADER SECTION (Top Card) */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative w-full rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                    {/* Background elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                    
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
                        {/* Avatar */}
                        <div className="relative group perspective-1000">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-purple-500 shadow-xl shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1">
                                <div className="w-full h-full rounded-full border-4 border-[#0a0a0f] overflow-hidden bg-black relative">
                                    <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt="Profile" />
                                </div>
                            </div>
                            <button onClick={() => { setEditForm({ name: profile.name, tagline: profile.tagline, location: profile.location, skills: profile.skills.join(', ') }); setIsEditing(true); }} className="absolute bottom-0 right-0 p-2.5 bg-[#1a1a24] border border-white/20 rounded-full text-white hover:bg-white transition-colors duration-300 hover:text-black shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 translate-y-4 group-hover:translate-y-0 md:translate-y-0 transition-transform">
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                           <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{profile.name}</h1>
                                {profile.badges.map(b => (
                                    <div key={b.id} className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-help" title={b.tip}>
                                        {b.icon}
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">{b.label}</span>
                                    </div>
                                ))}
                           </div>
                           <p className="text-lg text-gray-300 font-medium mb-4">{profile.tagline}</p>
                           
                           <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-medium text-gray-500 mb-6">
                               <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</div>
                               <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {profile.joinDate}</div>
                           </div>

                           <div className="flex items-center gap-3 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-2.5 bg-white text-black font-extrabold uppercase tracking-widest text-[10px] sm:text-xs rounded-xl hover:bg-cyan-400 hover:text-black transition-colors shadow-lg hover:shadow-cyan-400/20 active:scale-95 duration-200">
                                    Connect
                                </button>
                                <button className="flex-1 md:flex-none px-6 py-2.5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded-xl hover:bg-white/10 hover:border-white/30 transition-all active:scale-95 duration-200">
                                    Message
                                </button>
                                <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all text-white group active:scale-95 duration-200">
                                    <Share2 className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                                </button>
                           </div>
                        </div>

                        {/* Right side stats */}
                        <div className="w-full md:w-auto flex md:flex-col justify-around md:justify-center items-center md:items-end gap-2 md:gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-8">
                            <div className="text-center md:text-right">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reputation</div>
                                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                                    {profile.reputation} <span className="text-sm text-emerald-400 font-bold uppercase tracking-wide">XP</span>
                                </div>
                            </div>
                            <div className="w-px h-10 md:w-full md:h-px bg-white/10"></div>
                            <div className="text-center md:text-right">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Global Rank</div>
                                <div className="text-2xl md:text-3xl font-black text-white">
                                    #{profile.globalRank}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. STATS BAR (Horizontal Scroll) */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-full overflow-x-auto no-scrollbar pb-2"
                >
                    <div className="flex items-center gap-4 min-w-max">
                        <StatCard icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} label="Completed" value={profile.stats.challengesCompleted} />
                        <StatCard icon={<Target className="w-4 h-4 text-blue-400" />} label="Win Rate" value={`${profile.stats.winRate}%`} />
                        <StatCard icon={<TrendingUp className="w-4 h-4 text-green-400" />} label="Earnings" value={profile.stats.totalEarnings} />
                        <StatCard icon={<Flame className="w-4 h-4 text-orange-400" />} label="Streak" value={`${profile.stats.streak} Days`} />
                        <StatCard icon={<Shield className="w-4 h-4 text-purple-400" />} label="Skill Level" value={profile.stats.skillLevel} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Skills, Activity, Reviews */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        {/* SKILLS */}
                        <Section title="Expertise">
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all cursor-default text-gray-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </Section>

                        {/* ACTIVITY FEED */}
                        <Section title="Recent Activity">
                            <div className="relative border-l-2 border-white/10 ml-3 space-y-6 pb-2">
                                {profile.recentActivity.map(item => (
                                    <div key={item.id} className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#0a0a0f] border-2 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                        <div className="text-sm font-medium text-gray-200">{item.text}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{item.time}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* REVIEWS */}
                        <Section title="Endorsements">
                            <div className="flex flex-col gap-4">
                                {profile.reviews.map(rev => (
                                    <div key={rev.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white-[0.04] transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10">
                                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${rev.author}`} alt={rev.author} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white leading-none">{rev.author}</div>
                                                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{rev.role}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-yellow-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-xs font-bold">{rev.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed italic">"{rev.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* RIGHT COLUMN: Proof of Work, Graph */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        
                        {/* PROOF OF WORK */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-full flex-1 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    Proof of Work
                                </h2>
                                <button className="relative px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all group overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 group-hover:animate-pulse" /> Hire Me</span>
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1.5s_infinite]" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-px">
                                {ProofOfWorkTabs.map((tab, idx) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setPowTab(idx)}
                                        className={`pb-3 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${powTab === idx ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {tab}
                                        {powTab === idx && (
                                            <motion.div layoutId="powIndicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {powTab === 0 && [1, 2, 3, 4].map((item) => (
                                    <div key={`challenge-${item}`} className="group flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden hover:border-white/20 transition-all hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)]">
                                        <div className="w-full h-32 bg-white/5 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 group-hover:scale-105 transition-transform duration-500"></div>
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-white/10">Top Rated</div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">AI-Driven Analytics Hub Challenge</h3>
                                            <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-2">Completed the AI Analytics challenge processing 1M+ data points daily with real-time websocket integrations.</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-300">
                                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                    4.9/5
                                                </div>
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                    View Proof <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {powTab === 1 && [1, 2, 3].map((item) => (
                                    <div key={`project-${item}`} className="group flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden hover:border-white/20 transition-all hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)]">
                                        <div className="w-full h-32 bg-white/5 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/5 group-hover:scale-105 transition-transform duration-500"></div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">NeuroSync Platform</h3>
                                            <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-2">A comprehensive B2B platform built using modern Web3 architecture and robust edge deployments.</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Deployed
                                                </div>
                                                <button className="flex items-center gap-1.5 text-xs font-bold text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                    View Project <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {powTab === 2 && [1, 2].map((item) => (
                                    <div key={`achievement-${item}`} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all md:col-span-2 hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)]">
                                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/5 border border-amber-500/20 flex items-center justify-center">
                                            <Trophy className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">Global Hackathon Winner</h3>
                                            <p className="text-xs text-gray-400 font-medium">Secured 1st place in the Web3 track among 10k+ participants globally.</p>
                                        </div>
                                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 group-hover:text-amber-400 transition-all text-gray-400">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* REPUTATION GRAPH (Recharts) */}
                        <Section title="Reputation Trajectory">
                            <div className="w-full h-56 bg-white/[0.01] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reputationData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} dy={10} />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#0a0a0f', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} 
                                            itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }} 
                                            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area type="monotone" dataKey="xp" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0a0a0f', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>

                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 py-3 px-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-colors shrink-0">
        <div className="p-2.5 rounded-xl bg-white/5">
            {icon}
        </div>
        <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
            <div className="text-lg font-black text-white leading-tight">{value}</div>
        </div>
    </div>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        className="w-full"
    >
        <h2 className="text-xl font-bold tracking-tight mb-6">{title}</h2>
        {children}
    </motion.div>
);

export default ProfilePage;
