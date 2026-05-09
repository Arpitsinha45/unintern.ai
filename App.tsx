import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { BrainCircuit, Swords, Rocket, Zap, Users, DollarSign, MessageSquare, LayoutList, X, BookOpen, Globe, Activity, ChevronDown, Plus, Smile, Skull, Star, Brain, Handshake, Trophy, Volume2, Folder, Link, Medal, Award, Gem, TrendingUp, Palette, ArrowRight, ChevronRight, Check, Search, History, Trash2, Clock, ArrowLeft, Menu, Settings2, User, Building, Briefcase, CheckCircle2, Target, Edit3, Mail, Linkedin, MapPin, Camera, BarChart3, Bell, Bot, ArrowUp } from 'lucide-react';
import { StartupRoadmap, AppState, ChatMessage, ChatSession, RoadmapSection, Tab, Mentor, AccentColor, BgPattern, AppTheme } from './types';
import { generateRoadmap, chatWithMitra } from './services/geminiService';
import { SplineScene } from '@/components/ui/splite';
import ReactMarkdown from 'react-markdown';
import { Mermaid } from './components/Mermaid';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { NotificationPanel } from './components/Notifications';
import { ProfilePage } from './components/ProfilePage';
import { HistoryWorkspace } from './components/HistoryWorkspace';
import { TeamTasks } from './components/TeamTasks';
import { TravelCard } from '@/components/ui/card-7';
import { Calendar20 } from '@/components/ui/demo';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// --- Navigation Config ---
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');";

const ACCENT_COLORS: { id: AccentColor; label: string; from: string; to: string; shadow: string }[] = [
  { id: 'cyan-purple', label: 'Cyan & Purple', from: '#22d3ee', to: '#a855f7', shadow: 'rgba(168,85,247,0.4)' },
  { id: 'emerald-teal', label: 'Emerald & Teal', from: '#10b981', to: '#14b8a6', shadow: 'rgba(20,184,166,0.4)' },
  { id: 'rose-pink', label: 'Rose & Pink', from: '#f43f5e', to: '#ec4899', shadow: 'rgba(236,72,153,0.4)' },
  { id: 'amber-orange', label: 'Amber & Orange', from: '#f59e0b', to: '#f97316', shadow: 'rgba(249,115,22,0.4)' },
  { id: 'indigo-violet', label: 'Indigo & Violet', from: '#6366f1', to: '#8b5cf6', shadow: 'rgba(139,92,246,0.4)' },
];

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'HOME', icon: <Rocket className="w-5 h-5" /> },
  { id: 'network', label: 'NETWORK', icon: <Users className="w-5 h-5" /> },
  { id: 'challenges', label: 'ARENA', icon: <Swords className="w-5 h-5" /> },
  { id: 'mentor', label: 'MENTOR', icon: <BookOpen className="w-5 h-5" /> },
];

const NETWORK_NAV_ITEMS = [
  { id: 'back', label: 'BACK', icon: <ArrowLeft className="w-5 h-5" />, subTab: null },
  { id: 'co-founder', label: 'MATCH', icon: <Users className="w-5 h-5" />, subTab: 'co-founder' },
  { id: 'my-team', label: 'TEAMS', icon: <Zap className="w-5 h-5" />, subTab: 'my-team' },
  { id: 'tribes', label: 'TRIBES', icon: <Globe className="w-5 h-5" />, subTab: 'tribes' },
  { id: 'venture-bridge', label: 'BRIDGE', icon: <DollarSign className="w-5 h-5" />, subTab: 'venture-bridge' },
] as const;

const TEAM_CONTEXT_NAV_ITEMS = [
  { id: 'back', label: 'BACK', icon: <ArrowLeft className="w-5 h-5" />, tab: 'back' },
  { id: 'overview', label: 'OVERVIEW', icon: <BarChart3 className="w-5 h-5" />, tab: 'overview' },
  { id: 'team', label: 'TEAM', icon: <Users className="w-5 h-5" />, tab: 'team' },
  { id: 'tasks', label: 'TASKS', icon: <CheckCircle2 className="w-5 h-5" />, tab: 'tasks' },
  { id: 'chat', label: 'CHAT', icon: <MessageSquare className="w-5 h-5" />, tab: 'chat' },
  { id: 'settings', label: 'SETTINGS', icon: <Settings2 className="w-5 h-5" />, tab: 'settings' },
] as const;

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 100, 
      damping: 20 
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring" as const,
      stiffness: 100, 
      damping: 20 
    }
  }
};

// --- Shared Components ---

const Skeleton: React.FC<{ className?: string }> = React.memo(({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
));

const MindMapCard: React.FC<{ name: string; title: string; quote: string; bg: string; border: string; icon: React.ReactNode }> = React.memo(({ name, title, quote, bg, border, icon }) => (
  <div 
      className="flex-shrink-0 w-[160px] h-[200px] md:w-[220px] md:h-[260px] rounded-[12px] flex flex-col items-center justify-center text-center p-4 transition-all duration-500 hover:scale-[1.05] relative group font-['Plus_Jakarta_Sans'] overflow-hidden will-change-transform"
      style={{ 
          backgroundColor: bg, 
          border: `0.5px solid ${border}`
      }}
  >
      {/* Subtle pulsating glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/40 blur-[60px] rounded-full animate-pulse pointer-events-none opacity-50" />
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
        }}
      />

      <div className="mb-3 leading-none group-hover:scale-110 transition-transform relative z-10">
          {icon}
      </div>
      <div className="flex flex-col items-center relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6366f1] mb-1">
              {title}
          </span>
          <h4 className="text-[22px] font-black text-[#111827] mb-2 leading-tight">
              {name}
          </h4>
          <p className="text-[10px] md:text-[11px] text-[#4B5563] font-medium italic leading-snug px-1 line-clamp-2">
              {quote}
          </p>
      </div>
  </div>
));

const AtmosphericLighting: React.FC<{ activeZone: 'home' | 'masterclass' | 'rewards' | 'fame' | 'mentor' | 'bridge'; theme: AppTheme }> = ({ activeZone, theme }) => {
  const accent = ACCENT_COLORS.find(c => c.id === theme.accent) || ACCENT_COLORS[0];
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Fixed Deep Indigo at Top
  const topGlow = `radial-gradient(circle at 50% 0%, ${accent.from}33 0%, transparent 60%)`; 

  const patternOverlay = theme.pattern === 'noise' 
    ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
    : theme.pattern === 'grid'
    ? `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`
    : theme.pattern === 'dots'
    ? `radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`
    : 'none';

  const patternSize = theme.pattern === 'grid' ? '40px 40px' : theme.pattern === 'dots' ? '24px 24px' : '100px 100px';

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden bg-[#050505]">
      {/* Dynamic Mouse Spotlight */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 filter blur-[150px]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle, ${accent.from}44 0%, ${accent.to}11 50%, transparent 70%)`,
        }}
      />

      <div 
        className="absolute inset-0"
        style={{ background: topGlow, opacity: theme.glowIntensity }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{ 
              y: ['-10%', '110%'],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {theme.pattern !== 'none' && (
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: patternOverlay,
            backgroundSize: patternSize
          }}
        />
      )}
    </div>
  );
};

const Toast: React.FC<{ message: string; type?: 'error' | 'success'; onClose: () => void }> = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const isError = type === 'error';

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in fade-in slide-in-from-top-4 duration-500 no-print">
      <div className={`glass-card bg-[#0f0f14]/90 border ${isError ? 'border-red-500/30' : 'border-emerald-500/30'} rounded-2xl p-4 flex items-start gap-4 backdrop-blur-xl`}>
        <div className={`w-10 h-10 rounded-full ${isError ? 'bg-red-500/20 border-red-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} flex items-center justify-center flex-shrink-0 border`}>
          {isError ? (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 pt-0.5">
          <h4 className="text-white font-bold text-sm mb-1">{isError ? 'Execution Snag' : 'Success'}</h4>
          <p className="text-gray-300 text-xs leading-relaxed font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 -mr-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 4,
    minutes: 44,
    seconds: 21
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              } else {
                // Timer reached zero
                clearInterval(timer);
                return prev;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="mt-5 flex items-center gap-2 font-['JetBrains_Mono'] text-[#00E5FF] font-medium text-base md:text-lg tracking-wider">
      <span>{format(timeLeft.days)}d</span>
      <span className="opacity-50">:</span>
      <span>{format(timeLeft.hours)}h</span>
      <span className="opacity-50">:</span>
      <span>{format(timeLeft.minutes)}m</span>
      <span className="opacity-50">:</span>
      <span className="">{format(timeLeft.seconds)}s</span>
    </div>
  );
};

const OnboardingModal: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to SPIKE",
      desc: "The unfair advantage for first-time builders. We prioritize execution over ideas. Stop thinking, start shipping.",
      icon: <Zap className="w-10 h-10 text-amber-400" />
    },
    {
      title: "Meet Startup Mitra AI",
      desc: "Your personal Venture Architect. Generate elite execution roadmaps, no-code tech stacks, and GTM strategies in seconds.",
      icon: <Brain className="w-10 h-10 text-cyan-400" />
    },
    {
      title: "Founder Lounge",
      desc: "Find your co-founder. Connect with the top 1% of builders and join specific tribes to accelerate your growth.",
      icon: <Handshake className="w-10 h-10 text-emerald-400" />
    },
    {
      title: "Rewards & Fame",
      desc: "Execute missions to climb the leaderboard, win equity-free grants, and get featured on the Hall of Fame.",
      icon: <Trophy className="w-10 h-10 text-[#FFD700]" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 no-print">
       <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"></div>
       <div className="relative w-full max-w-md bg-[#0f0f14] border border-white/10 rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none"></div>
          <div className="p-8 flex flex-col items-center text-center relative z-10 min-h-[420px]">
             <button onClick={onFinish} className="absolute top-6 right-6 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors z-20">Skip</button>
             <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 animate-float">
                {steps[step].icon}
             </div>
             <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">{steps[step].title}</h3>
             <p className="text-sm text-gray-400 leading-relaxed font-medium mb-auto px-2">{steps[step].desc}</p>
             <div className="flex gap-2 mb-8 mt-8">
               {steps.map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-purple-500' : 'w-1.5 bg-gray-700'}`}></div>
               ))}
             </div>
             <button onClick={handleNext} className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">
               {step === steps.length - 1 ? "Let's Build" : "Next"}
             </button>
          </div>
       </div>
    </div>
  );
};

const TopHeader: React.FC<{ 
  onHistoryClick: () => void;
  onChatClick: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: AppTheme;
  isHidden?: boolean;
  footerMode: 'main' | 'network' | 'team_context';
  onFooterModeChange: (mode: 'main' | 'network' | 'team_context') => void;
  networkSubTab: string;
  onNetworkSubTabChange: (tab: any) => void;
  teamContextTab: string;
  onTeamContextTabChange: (tab: any) => void;
}> = ({ 
  onHistoryClick, 
  onChatClick, 
  activeTab, 
  onTabChange, 
  theme, 
  isHidden,
  footerMode,
  onFooterModeChange,
  networkSubTab,
  onNetworkSubTabChange,
  teamContextTab,
  onTeamContextTabChange
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#notification-panel')
      ) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const accent = ACCENT_COLORS.find(c => c.id === theme.accent) || ACCENT_COLORS[0];
  return (
    <motion.header 
      initial={false}
      animate={{ 
        y: isHidden ? -100 : 0,
        opacity: isHidden ? 0 : 1
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`fixed top-0 left-0 right-0 h-[72px] z-40 px-4 md:px-8 flex justify-between items-center no-print transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-3xl border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : ''
      }`} 
      style={{
        background: isScrolled 
          ? `linear-gradient(to bottom, ${accent.from}15, transparent), rgba(0, 0, 0, 0.8)` 
          : `linear-gradient(to bottom, ${accent.from}15, transparent)`
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-start cursor-pointer select-none group relative" onClick={() => onTabChange('home')} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <h1 className="text-[18px] font-[400] uppercase text-white leading-none" style={{ letterSpacing: '8px' }}>SPIKE</h1>
          <span className="text-[8px] font-[400] uppercase text-[#9494B8] leading-none mt-1.5" style={{ 
            letterSpacing: '8px',
            width: '100%',
            textAlign: 'justify'
          }}>
            PLATFORM
          </span>
        </div>
      </div>
      
      {/* Center Area - Navigation */}
      <nav className={`hidden lg:flex items-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[52px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full px-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-[540px] overflow-hidden`}>
        <AnimatePresence mode="popLayout" initial={false}>
          {footerMode === 'main' && (
            <motion.div 
              key="main-nav"
              initial={{ x: -40, opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: 40, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex justify-around items-center w-full relative h-full shrink-0"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button 
                    key={item.id} 
                    onClick={() => {
                        onTabChange(item.id);
                        if (item.id === 'network') {
                            onFooterModeChange('network');
                        }
                    }} 
                    className={`flex flex-col items-center justify-center flex-1 h-full relative z-10 group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    animate={{ 
                      opacity: isActive ? 1 : 0.7
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="navTabBg"
                        className="absolute inset-x-2 inset-y-1.5 bg-white/10 border border-white/20 rounded-full z-0 shadow-[inset_0_1px_rgba(255,255,255,0.2)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2">
                       {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                       <span className="text-[10px] font-semibold uppercase tracking-[0.15em] font-['Plus_Jakarta_Sans']">
                         {item.label}
                       </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {footerMode === 'network' && (
            <motion.div 
              key="network-nav"
              initial={{ x: 40, opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: -40, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex justify-around items-center w-full relative h-full shrink-0"
            >
              {NETWORK_NAV_ITEMS.map((item) => {
                const isActive = item.id === 'back' ? false : networkSubTab === item.subTab;
                return (
                  <motion.button 
                    key={item.id} 
                    onClick={() => {
                      if (item.id === 'back') {
                        onFooterModeChange('main');
                        onTabChange('home');
                      } else if (item.id === 'my-team') {
                        onNetworkSubTabChange(item.subTab);
                        onFooterModeChange('team_context');
                      } else if (item.subTab) {
                        onNetworkSubTabChange(item.subTab);
                      }
                    }} 
                    className={`flex flex-col items-center justify-center flex-1 h-full relative z-10 group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'} ${item.id === 'back' ? 'opacity-60 hover:opacity-100' : ''}`}
                    animate={{ 
                      opacity: isActive ? 1 : 0.7
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="navTabBg"
                        className="absolute inset-x-2 inset-y-1.5 bg-white/10 border border-white/20 rounded-full z-0 shadow-[inset_0_1px_rgba(255,255,255,0.2)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-1.5">
                       {React.cloneElement(item.icon as React.ReactElement<any>, { size: 14 })}
                       <span className="text-[9px] font-semibold uppercase tracking-[0.1em] font-['Plus_Jakarta_Sans'] mt-0.5">
                         {item.label}
                       </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {footerMode === 'team_context' && (
            <motion.div 
              key="team-context-nav"
              initial={{ x: 40, opacity: 0, filter: "blur(10px)" }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ x: -40, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex justify-around items-center w-full relative h-full shrink-0"
            >
              {TEAM_CONTEXT_NAV_ITEMS.map((item) => {
                const isActive = item.id === 'back' ? false : teamContextTab === item.tab;
                return (
                  <motion.button 
                    key={item.id} 
                    onClick={() => {
                      if (item.id === 'back') {
                        onFooterModeChange('network');
                      } else if (item.tab) {
                        onTeamContextTabChange(item.tab);
                      }
                    }} 
                    className={`flex flex-col items-center justify-center flex-1 h-full relative z-10 group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'} ${item.id === 'back' ? 'opacity-60 hover:opacity-100' : ''}`}
                    animate={{ 
                      opacity: isActive ? 1 : 0.7
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="navTabBg"
                        className="absolute inset-x-1 inset-y-1.5 bg-white/10 border border-white/20 rounded-full z-0 shadow-[inset_0_1px_rgba(255,255,255,0.2)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                       {React.cloneElement(item.icon as React.ReactElement<any>, { size: 14 })}
                       <span className="text-[8px] font-semibold uppercase tracking-[0.1em] font-['Plus_Jakarta_Sans']">
                         {item.label}
                       </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Right Area - Actions */}
      <div className="flex items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10" ref={notificationRef}>
        <button 
          onClick={onChatClick}
          className="relative group p-2 md:p-2.5 rounded-full hover:bg-white/10 transition-all focus:outline-none"
        >
          <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white/70 group-hover:text-white transition-colors" />
        </button>
        <div className="w-[1px] h-4 md:h-5 bg-white/10 mx-0.5 md:mx-1 rounded-full"></div>
        <div>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative group p-2 md:p-2.5 rounded-full hover:bg-white/10 transition-all focus:outline-none ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-white/70'}`}
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5 group-hover:text-white transition-colors" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-[#111]"></span>}
          </button>
        </div>
        <div className="w-[1px] h-4 md:h-5 bg-white/10 mx-0.5 md:mx-1 rounded-full"></div>
        <div className="p-0.5 ml-0.5 md:ml-1">
          <div onClick={() => onTabChange('profile')} className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 p-[1px] cursor-pointer hover:border-white/50 transition-all overflow-hidden bg-white/5 relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <NotificationPanel 
          isOpen={isNotificationsOpen} 
          onClose={() => setIsNotificationsOpen(false)} 
          unreadCount={unreadCount}
          onMarkAllRead={() => setUnreadCount(0)}
        />
      </div>
    </motion.header>
  );
};

const BottomNavbar: React.FC<{ 
  activeTab: Tab; 
  onTabChange: (tab: Tab) => void; 
  isHidden?: boolean;
  footerMode: 'main' | 'network' | 'team_context';
  onFooterModeChange: (mode: 'main' | 'network' | 'team_context') => void;
  networkSubTab: string;
  onNetworkSubTabChange: (tab: any) => void;
  teamContextTab: string;
  onTeamContextTabChange: (tab: any) => void;
}> = ({ 
  activeTab, 
  onTabChange, 
  isHidden, 
  footerMode, 
  onFooterModeChange, 
  networkSubTab, 
  onNetworkSubTabChange,
  teamContextTab,
  onTeamContextTabChange
}) => {
  return (
    <motion.div 
      initial={false}
      animate={{ 
        y: isHidden ? 100 : 0,
        opacity: isHidden ? 0 : 1
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 h-[72px] bg-black/40 backdrop-blur-[30px] border-t-[0.5px] border-white/20 rounded-[32px] z-50 flex items-center px-2 no-print hover:border-white/30 w-[94%] max-w-[550px] md:hidden overflow-hidden"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {footerMode === 'main' && (
          <motion.div 
            key="main-footer"
            initial={{ y: -40, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 40, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex justify-around items-center w-full relative h-full shrink-0"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button 
                  key={item.id} 
                  onClick={() => {
                    onTabChange(item.id);
                    if (item.id === 'network') {
                      onFooterModeChange('network');
                    }
                  }} 
                  className="flex flex-col items-center justify-center flex-1 h-full space-y-1 relative z-10"
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    opacity: isActive ? 1 : 0.6
                  }}
                  whileHover={{ opacity: 1, scale: 1.1, filter: "brightness(1.2)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="neonDot"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full z-20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="text-white transition-all duration-300">
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-white font-['Plus_Jakarta_Sans'] transition-all duration-300">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {footerMode === 'network' && (
          <motion.div 
            key="network-footer"
            initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -40, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex justify-around items-center w-full relative h-full shrink-0"
          >
            {NETWORK_NAV_ITEMS.map((item) => {
              const isActive = item.id === 'back' ? false : networkSubTab === item.subTab;
              return (
                <motion.button 
                  key={item.id} 
                  onClick={() => {
                    if (item.id === 'back') {
                      onFooterModeChange('main');
                      onTabChange('home');
                    } else if (item.id === 'my-team') {
                      onNetworkSubTabChange(item.subTab);
                      onFooterModeChange('team_context');
                    } else if (item.subTab) {
                      onNetworkSubTabChange(item.subTab);
                    }
                  }} 
                  className="flex flex-col items-center justify-center flex-1 h-full space-y-1 relative z-10"
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 1 : 0.6
                  }}
                  whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="neonDot"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full z-20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className="text-white transition-all duration-300">
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-white font-['Plus_Jakarta_Sans'] transition-all duration-300">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {footerMode === 'team_context' && (
          <motion.div 
            key="team-context-footer"
            initial={{ x: 40, opacity: 0, filter: "blur(10px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: -40, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex justify-around items-center w-full relative h-full shrink-0"
          >
            {TEAM_CONTEXT_NAV_ITEMS.map((item) => {
              const isActive = item.id === 'back' ? false : teamContextTab === item.tab;
              return (
                <motion.button 
                  key={item.id} 
                  onClick={() => {
                    if (item.id === 'back') {
                      onFooterModeChange('network');
                    } else if (item.tab) {
                      onTeamContextTabChange(item.tab);
                    }
                  }} 
                  className="flex flex-col items-center justify-center flex-1 h-full space-y-1 relative z-10"
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 1 : 0.6
                  }}
                  whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="neonDot"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full z-20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className="text-white transition-all duration-300">
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-[1px] text-white font-['Plus_Jakarta_Sans'] transition-all duration-300 text-center px-1">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// --- Helpers ---

const getDeptTextColor = (color: string) => {
    if (color?.startsWith('#')) return 'text-white';
    switch(color) {
        case 'cyan': return 'text-[#3b82f6]';
        case 'orange': return 'text-[#f97316]';
        case 'purple': return 'text-[#8b5cf6]';
        case 'emerald': return 'text-[#10b981]';
        default: return 'text-white';
    }
};

const getLineColor = (color: string) => {
    if (color?.startsWith('#')) return color;
    switch(color) {
        case 'cyan': return '#3b82f6';
        case 'orange': return '#f97316';
        case 'purple': return '#8b5cf6';
        case 'emerald': return '#10b981';
        default: return '#00c8ff';
    }
};

// --- Network Screen & Modules ---

const ProfilePopup = ({ isOpen, onClose, member, dept }: any) => {
    if (!isOpen || !member) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-[320px] bg-[#0c141e] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-2xl shadow-2xl">
                <div className="h-28 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                <div className="px-6 pb-8 -mt-14 flex flex-col items-center">
                    <img src={member.avatar.startsWith('http') ? member.avatar : `https://i.pravatar.cc/200?u=${member.avatar}`} className="w-28 h-28 rounded-full border-4 border-[#0c141e] shadow-2xl mb-4 object-cover" />
                    <h3 className="text-2xl font-black text-white tracking-tight text-center">{member.name}</h3>
                    <p className="text-cyan-400 text-[11px] font-black uppercase tracking-widest mt-1.5">{member.role}</p>
                    
                    <div className="w-full h-[1px] bg-white/5 my-6" />
                    
                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Building className="w-4 h-4 opacity-70" /></div>
                            <span className="text-xs font-bold uppercase tracking-wider">{dept?.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Mail className="w-4 h-4 opacity-70" /></div>
                            <span className="text-xs font-medium lowercase tracking-tight">{member.email || `${member.avatar}@highperform.com`}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><MapPin className="w-4 h-4 opacity-70" /></div>
                            <span className="text-xs font-bold uppercase tracking-wider">{member.location || 'Distributed'}</span>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full mt-8 bg-white text-black rounded-2xl py-4 text-[13px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
                    >
                        Close Intel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DepartmentModal = ({ isOpen, onClose, onSave }: any) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const [formData, setFormData] = useState<any>({
        name: '',
        icon: '🏢',
        color: '#3b82f6',
        manager: {
            name: '',
            role: '',
            avatar: ''
        }
    });

    if (!isOpen) return null;

    const handleAvatarClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    setFormData({
                        ...formData, 
                        manager: { ...formData.manager, avatar: re.target?.result as string }
                    });
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    return (
        <div className="fixed inset-0 w-screen h-screen z-[9999] pointer-events-none">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="fixed inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto" 
                onClick={onClose}
            />
            <motion.div 
                initial={{ x: '-50%', y: '-40%', opacity: 0 }} 
                animate={{ x: '-50%', y: '-50%', opacity: 1 }}
                className="fixed top-1/2 left-1/2 w-[90%] md:w-[400px] max-h-[80vh] md:max-h-[85vh] bg-[rgba(8,13,20,0.97)] border border-white/10 rounded-[20px] overflow-hidden backdrop-blur-3xl shadow-2xl flex flex-col z-[10000] pointer-events-auto"
                onScroll={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 flex justify-between items-start border-b border-white/5">
                    <div className="flex flex-col">
                        <h2 className="text-white text-[14px] font-black uppercase tracking-[2px]">ADD DEPARTMENT</h2>
                        <p className="text-gray-500 text-[11px] mt-1 font-medium italic">Initialize new business unit</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <div 
                    className="flex-1 overflow-y-scroll overscroll-contain px-5 py-6 no-scrollbar touch-auto"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    onScroll={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Department Name</label>
                            <input 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full bg-transparent border-b border-white/12 py-1 text-[12px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                placeholder="e.g. Sales, Operations..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Icon / Emoji</label>
                                <input 
                                    value={formData.icon} 
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[12px] text-white focus:outline-none focus:border-cyan-400 transition-all block font-['Plus_Jakarta_Sans']" 
                                    placeholder="🏢"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Brand Color</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color"
                                        value={formData.color} 
                                        onChange={(e) => setFormData({...formData, color: e.target.value})} 
                                        className="w-7 h-7 rounded bg-transparent border-none p-0 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-gray-400 font-mono">{formData.color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[2px] mb-5">Unit Leadership</h3>
                            
                            <div className="flex flex-col items-center mb-6">
                                <div 
                                    onClick={handleAvatarClick}
                                    className="w-[64px] h-[64px] rounded-full border border-dashed border-white/20 p-0.5 cursor-pointer group relative flex flex-col items-center justify-center bg-white/5 mb-2 hover:border-white/40 transition-colors"
                                >
                                    {formData.manager.avatar ? (
                                        <img src={formData.manager.avatar} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-gray-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest font-['Plus_Jakarta_Sans']">Head Avatar</span>
                            </div>

                            <div className="space-y-5">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Head of Dept Name</label>
                                    <input 
                                        value={formData.manager.name} 
                                        onChange={(e) => setFormData({...formData, manager: {...formData.manager, name: e.target.value}})} 
                                        className="w-full bg-transparent border-b border-white/12 py-1 text-[12px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Head of Dept Role</label>
                                    <input 
                                        value={formData.manager.role} 
                                        onChange={(e) => setFormData({...formData, manager: {...formData.manager, role: e.target.value}})} 
                                        className="w-full bg-transparent border-b border-white/12 py-1 text-[12px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                        placeholder="VP of Sales, Head of Ops..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={() => onSave(formData)}
                        className="w-full h-11 bg-[#080d14] border border-white/20 text-white text-[12px] font-black uppercase tracking-widest rounded-[10px] hover:bg-black hover:border-white/40 transition-all active:scale-95 shadow-xl"
                    >
                        DEPLOY UNIT
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const MemberModal = ({ isOpen, onClose, member, departments, onSave, onDelete, editingDeptId }: any) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const [formData, setFormData] = useState<any>({
        name: '',
        role: '',
        deptId: 'finance',
        email: '',
        linkedin: '',
        twitter: '',
        location: '',
        bio: '',
        skills: [],
        startDate: '',
        avatar: ''
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (member) {
            setFormData({
                ...member,
                deptId: editingDeptId,
                skills: Array.isArray(member.skills) ? member.skills : (member.skills ? member.skills.split(',').map((s: string) => s.trim()) : []),
                twitter: member.twitter || '',
                bio: member.bio || '',
                startDate: member.startDate || '',
                linkedin: member.linkedin || '',
                location: member.location || '',
                email: member.email || '',
                avatar: member.avatar || ''
            });
        } else {
            setFormData({
                name: '',
                role: '',
                deptId: 'finance',
                email: '',
                linkedin: '',
                twitter: '',
                location: '',
                bio: '',
                skills: [],
                startDate: '',
                avatar: ''
            });
        }
    }, [member, editingDeptId, isOpen]);

    if (!isOpen) return null;

    const handleAvatarClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    setFormData({ ...formData, avatar: re.target?.result as string });
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skillToRemove) });
    };

    return (
        <div className="fixed inset-0 w-screen h-screen z-[9999] pointer-events-none">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="fixed inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto" 
            />
            <motion.div 
                initial={{ x: '-50%', y: '-40%', opacity: 0 }} 
                animate={{ x: '-50%', y: '-50%', opacity: 1 }}
                className="fixed top-1/2 left-1/2 w-[90%] md:w-[480px] max-h-[85vh] bg-[rgba(8,13,20,0.97)] border border-white/10 rounded-[20px] overflow-hidden backdrop-blur-3xl shadow-2xl flex flex-col z-[10000] pointer-events-auto"
                onScroll={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 flex justify-between items-start border-b border-white/5">
                    <div className="flex flex-col">
                        <h2 className="text-white text-[14px] font-black uppercase tracking-[2px]">{member ? 'EDIT MEMBER' : 'ADD MEMBER'}</h2>
                        <p className="text-gray-500 text-[11px] mt-1 font-medium italic">Intel Configuration Terminal</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-scroll overscroll-contain px-5 py-6 no-scrollbar">
                    <div className="flex flex-col items-center mb-8">
                        <div 
                            onClick={handleAvatarClick}
                            className="w-[72px] h-[72px] rounded-full border border-dashed border-white/20 p-1 cursor-pointer group relative flex flex-col items-center justify-center bg-white/5 mb-2 hover:border-white/40 transition-colors"
                        >
                            {formData.avatar ? (
                                <img src={formData.avatar.startsWith('http') ? formData.avatar : (formData.avatar || `https://i.pravatar.cc/100?u=${formData.name}`)} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <Camera className="w-5 h-5 text-gray-500" />
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Update Avatar</span>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Full Name</label>
                            <input 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all" 
                                placeholder="Specialist name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Role / Position</label>
                                <input 
                                    value={formData.role} 
                                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                    placeholder="e.g. Lead Dev"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Department</label>
                                <select 
                                    value={formData.deptId} 
                                    onChange={(e) => setFormData({...formData, deptId: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer font-['Plus_Jakarta_Sans']"
                                >
                                    {departments.map((d: any) => (<option key={d.id} value={d.id} className="bg-[#080d14]">{d.name}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Email</label>
                                <input 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                    placeholder="Email"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">LinkedIn</label>
                                <input 
                                    value={formData.linkedin} 
                                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                    placeholder="Profile URL"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Location</label>
                                <input 
                                    value={formData.location} 
                                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                    placeholder="City / Country"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Twitter / X</label>
                                <input 
                                    value={formData.twitter} 
                                    onChange={(e) => setFormData({...formData, twitter: e.target.value})} 
                                    className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                    placeholder="@handle"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Bio / Profile</label>
                            <textarea 
                                value={formData.bio} 
                                onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                                rows={2}
                                className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all resize-none no-scrollbar font-['Plus_Jakarta_Sans']" 
                                placeholder="Intel overview..."
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Skills</label>
                            <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                                {Array.isArray(formData.skills) && formData.skills.map((s: string) => (
                                    <span key={s} className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                                        {s}
                                        <button onClick={() => removeSkill(s)} className="text-cyan-400/50 hover:text-cyan-400 p-0.5"><X className="w-2.5 h-2.5" /></button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                value={skillInput} 
                                onChange={(e) => setSkillInput(e.target.value)} 
                                onKeyDown={addSkill}
                                className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all font-['Plus_Jakarta_Sans']" 
                                placeholder="Add skill (Enter)"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">Start Date</label>
                            <input 
                                type="date"
                                value={formData.startDate} 
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                                className="w-full bg-transparent border-b border-white/12 py-1 text-[13px] text-white focus:outline-none focus:border-cyan-400 transition-all uppercase font-['Plus_Jakarta_Sans']" 
                            />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-white/5 flex flex-col gap-3">
                    <button 
                        onClick={() => onSave(formData)}
                        className="w-full h-12 bg-white text-black text-[12px] font-black uppercase tracking-widest rounded-[12px] hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
                    >
                        {member ? 'SAVE CHANGES' : 'DEPLOY SPECIALIST'}
                    </button>
                    {member && (
                        <button 
                            onClick={() => onDelete(member.id, editingDeptId)}
                            className="w-full h-11 border border-red-500/30 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-[12px] hover:bg-red-500/5 transition-all active:scale-95"
                        >
                            DELETE MEMBER
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

interface Tribe { 
    id: string; 
    name: string; 
    niche: string; 
    criteria: string; 
    members: number; 
    active: number; 
    tags: string[]; 
    isJoined: boolean; 
    coverGradient: string; 
    logo: string;
    channels?: Channel[]; 
}
interface Channel { id: string; name: string; type: 'text' | 'voice'; }
interface RoundPreference { round: string; checkSize: string; focus: string; criteria: string[]; }
interface Investor { id: string; name: string; firm: string; type: string; alignment: number; range: string; vetted: boolean; avatarSeed: string; rounds: string[]; thesis: string; roundPreferences: RoundPreference[]; }

const DepartmentNode: React.FC<{ 
    dept: any, 
    index: number,
    onEdit: (member: any, deptId: string) => void,
    searchQuery: string
}> = ({ dept, index, onEdit, searchQuery }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const isMatch = (member: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return member.name.toLowerCase().includes(q) || member.role.toLowerCase().includes(q);
    };

    const isManagerMatch = isMatch(dept.manager);
    const matchedMembers = dept.members.filter(isMatch);
    const hasAnyMatch = isManagerMatch || matchedMembers.length > 0;

    return (
        <div className="flex flex-col items-center w-full md:flex-1 md:min-w-0 px-2 relative">
            {/* Desktop Vertical connector down from bridge / Mobile vertical from main spine */}
            <div 
                className="w-[1.5px] h-8" 
                style={{ 
                    backgroundColor: 'rgba(255,255,255,0.35)',
                    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))'
                }}
            ></div>

            {/* Dept Badge - Centered on both */}
            <div className="flex items-center justify-center w-full relative z-10 md:pl-0">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="pl-6 pr-4 py-2 rounded-[20px] text-[11px] font-semibold mb-0 h-9 flex items-center gap-3 transition-all group shrink-0 relative bg-black/40 border border-white/15 uppercase tracking-[1px]"
                >
                    <span className={getDeptTextColor(dept.color)}>{dept.name}</span>
                    <motion.div 
                        animate={{ rotate: isExpanded ? 0 : 90 }}
                        className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[12px] text-black"
                    >
                        {isExpanded ? '−' : '+'}
                    </motion.div>
                </button>
            </div>

            {/* Manager and Members */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full flex flex-col items-center overflow-hidden relative"
                    >
                        {/* Manager Section */}
                        <div className={`w-full flex flex-col items-center relative transition-all duration-500 ${isManagerMatch ? 'opacity-100 scale-100' : (matchedMembers.length > 0 ? 'opacity-20 scale-95' : 'opacity-100 scale-100')}`}>
                            {/* Vertical line from Badge to Manager (Silver/White with subtle glow) */}
                            <div 
                                className="w-[1.5px] h-6" 
                                style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.35)',
                                    filter: ''
                                }}
                            ></div>
                            
                            {/* Manager Card - Centered on both */}
                            <div 
                                className="w-[200px] rounded-[16px] p-[8px_12px] md:p-[12px_16px] flex flex-col items-center relative group transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10 active:scale-95"
                                style={{ 
                                    background: '#080d14',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}
                                onClick={() => onEdit(dept.manager, dept.id)}
                            >
                                <img src={dept.manager.avatar.startsWith('http') ? dept.manager.avatar : `https://i.pravatar.cc/100?u=${dept.manager.avatar}`} alt={dept.manager.name} className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] rounded-full border-2 border-white/30 mb-3 object-cover" />
                                <div className="text-center w-full">
                                    <h4 className="text-white text-[14px] md:text-[14px] font-bold leading-tight uppercase tracking-[0.5px] font-['Inter']">{dept.manager.name}</h4>
                                    <p className="text-[#9e9e9e] text-[10px] mt-1 uppercase tracking-[1.5px] font-normal font-['Inter']">{dept.manager.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="w-full mt-0 flex flex-col items-center relative">
                            {/* Branching Lines from Manager */}
                            {dept.members.length > 0 && (
                                <>
                                    {/* Mobile: Tree branches SVGs */}
                                    <div className="md:hidden w-full h-12 relative overflow-visible">
                                        <svg className="w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none" fill="none">
                                            {dept.members.map((m: any, i: number) => {
                                                const isLeft = i % 2 === 0;
                                                const targetX = isLeft ? 25 : 75;
                                                const matched = isMatch(m);
                                                return (
                                                    <path 
                                                        key={i}
                                                        d={`M 50 0 C 50 24, ${targetX} 24, ${targetX} 48`} 
                                                        stroke={getLineColor(dept.color)} 
                                                        strokeWidth="1.5" 
                                                        strokeLinecap="round"
                                                        strokeOpacity={matched ? 0.7 : 0.1}
                                                        style={{ filter: matched ? `drop-shadow(0 0 3px ${getLineColor(dept.color)})` : 'none' }}
                                                    />
                                                );
                                            })}
                                        </svg>
                                    </div>

                                    {/* Desktop: Horizontal branching SVG */}
                                    <div className="hidden md:block w-full h-12 relative">
                                        <svg className="w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none" fill="none">
                                            {dept.members.map((m: any, i: number) => {
                                                const xPos = (100 / (dept.members.length)) * (i + 0.5);
                                                const matched = isMatch(m);
                                                return (
                                                    <path 
                                                        key={i}
                                                        d={`M 50 0 C 50 24, ${xPos} 24, ${xPos} 48`} 
                                                        stroke={getLineColor(dept.color)} 
                                                        strokeWidth="1.5" 
                                                        strokeLinecap="round"
                                                        strokeOpacity={matched ? 0.7 : 0.1}
                                                        style={{ filter: matched ? `drop-shadow(0 0 3px ${getLineColor(dept.color)})` : 'none' }}
                                                    />
                                                );
                                            })}
                                        </svg>
                                    </div>
                                </>
                            )}
                                              {/* Members Grid/Row */}
                            <div className="flex flex-row flex-wrap md:flex-nowrap gap-[10px] md:gap-[12px] w-full items-start justify-center px-2">
                                <AnimatePresence mode="popLayout">
                                    {dept.members.map((member: any, mIdx: number) => (
                                        <motion.div 
                                            key={member.id || mIdx} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: isMatch(member) ? 1 : 0.2, scale: isMatch(member) ? 1 : 0.95 }}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                                            className="relative flex flex-col items-center w-[47%] md:w-auto md:flex-1 md:min-w-0"
                                        >
                                            <div 
                                                className="w-full md:w-[160px] rounded-[10px] md:rounded-[16px] p-[10px_12px] md:p-[12px_16px] flex flex-col items-center hover:border-white/20 transition-all cursor-pointer group/card shadow-md md:shadow-lg md:hover:shadow-cyan-500/10 active:scale-95"
                                                style={{ 
                                                    background: '#080d14',
                                                    border: '1px solid rgba(255,255,255,0.08)'
                                                }}
                                                onClick={() => onEdit(member, dept.id)}
                                            >
                                                <div className="flex flex-row md:flex-col items-center gap-3 md:gap-0 w-full">
                                                    <img src={member.avatar?.startsWith('http') ? member.avatar : (member.avatar ? member.avatar : `https://i.pravatar.cc/36?u=${member.name}`)} alt={member.name} className="w-8 h-8 md:w-[36px] md:h-[36px] rounded-full border border-white/10 md:border-2 md:border-white/30 shrink-0 md:mb-2 object-cover" />
                                                    <div className="flex flex-col text-left md:text-center overflow-hidden w-full">
                                                        <h4 className="text-white text-[12px] md:text-[12px] font-medium md:font-bold leading-tight tracking-normal md:tracking-[0.5px] md:uppercase font-['Inter'] truncate">{member.name}</h4>
                                                        <p className="text-[#9e9e9e] md:text-white text-[10px] md:text-[10px] mt-0.5 md:mt-1 font-normal md:font-medium tracking-normal md:tracking-[1.5px] md:uppercase font-['Inter'] truncate">{member.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    );
};

const NetworkScreen: React.FC<{ 
  setAtmosphere?: (zone: any) => void;
  onSuccess?: (msg: string) => void;
  joinedTribes: string[];
  setJoinedTribes: React.Dispatch<React.SetStateAction<string[]>>;
  requestedIntros: string[];
  setRequestedIntros: React.Dispatch<React.SetStateAction<string[]>>;
  subTab: 'co-founder' | 'tribes' | 'my-team' | 'venture-bridge';
  onSubTabChange: (tab: 'co-founder' | 'tribes' | 'my-team' | 'venture-bridge') => void;
  footerMode: 'main' | 'network' | 'team_context';
  onFooterModeChange: (mode: 'main' | 'network' | 'team_context') => void;
  teamContextTab?: string;
}> = ({ setAtmosphere, onSuccess, joinedTribes, setJoinedTribes, requestedIntros, setRequestedIntros, subTab, onSubTabChange, footerMode, onFooterModeChange, teamContextTab }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [subTab]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [roundFilter, setRoundFilter] = useState('All Rounds');
    const [selectedFounder, setSelectedFounder] = useState<any>(null);
    const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
    
    const [activeTribe, setActiveTribe] = useState<Tribe | null>(null);
    const [isCreatingTribe, setIsCreatingTribe] = useState(false);
    const [activeChannel, setActiveChannel] = useState<string>('announcements');
    const [tribeChatInput, setTribeChatInput] = useState('');

    const handleIntroRequest = (id: string) => {
        setRequestedIntros(prev => [...prev, id]);
        if (onSuccess) onSuccess("Introduction request sent to partner.");
    };

    const handleBookIntro = (id: string) => {
        setRequestedIntros(prev => [...prev, id]);
        if (onSuccess) onSuccess("Introduction request sent to founder.");
    };

    const handleJoinTribe = (id: string) => {
        setJoinedTribes(prev => [...prev, id]);
        if (onSuccess) onSuccess("Joined Tribe successfully!");
    };

    const DEFAULT_TEAM_DATA = [
        { 
            id: 'finance', 
            name: 'Finance', 
            color: 'cyan',
            icon: '💰',
            manager: { id: 'm1', name: 'Alice Chen', role: 'Finance Director', avatar: 'alice', isManager: true },
            members: [
                { id: 'mem1', name: 'David Miller', role: 'Accountant', avatar: 'david' },
                { id: 'mem2', name: 'Sarah Lee', role: 'Analyst', avatar: 'sarah' }
            ]
        },
        { 
            id: 'marketing', 
            name: 'Marketing', 
            color: 'orange',
            icon: '🎯',
            manager: { id: 'm2', name: 'Marcus Bell', role: 'Marketing Lead', avatar: 'marcus', isManager: true },
            members: [
                { id: 'mem3', name: 'Elena Rose', role: 'Strategist', avatar: 'elena' },
                { id: 'mem4', name: 'James Bond', role: 'Manager', avatar: 'james' }
            ]
        },
        { 
            id: 'hr', 
            name: 'Human Resources', 
            color: 'purple',
            icon: '👥',
            manager: { id: 'm3', name: 'Sofia Vergara', role: 'HR Manager', avatar: 'sofia', isManager: true },
            members: [
                { id: 'mem5', name: 'Kevin Hart', role: 'Recruitment', avatar: 'kevin' },
                { id: 'mem6', name: 'Will Smith', role: 'Ops Lead', avatar: 'will' }
            ]
        },
        { 
            id: 'design', 
            name: 'Design', 
            color: 'emerald',
            icon: '🎨',
            manager: { id: 'm4', name: 'Leo DaVinci', role: 'Creative Dir', avatar: 'leo', isManager: true },
            members: [
                { id: 'mem7', name: 'Pablo Picasso', role: 'UI Designer', avatar: 'pablo' },
                { id: 'mem8', name: 'Frida Kahlo', role: 'Artist', avatar: 'frida' }
            ]
        }
    ];

    const [departments, setDepartments] = useState<any[]>(() => {
        const saved = localStorage.getItem('spike_team_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse team data from localStorage", e);
                return DEFAULT_TEAM_DATA;
            }
        }
        return DEFAULT_TEAM_DATA;
    });

    useEffect(() => {
        localStorage.setItem('spike_team_data', JSON.stringify(departments));
    }, [departments]);

    const [viewingMember, setViewingMember] = useState<any>(null);
    const [viewingDept, setViewingDept] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Member Management State
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [editingDeptId, setEditingDeptId] = useState<string>('');

    const handleViewProfile = (member: any, dept: any) => {
        setViewingMember(member);
        setViewingDept(dept);
        setIsProfileOpen(true);
    };

    const [myTribes, setMyTribes] = useState<Tribe[]>([
       { 
           id: 't1', 
           name: "SaaS Scalers", 
           niche: "B2B SaaS", 
           criteria: "MRR > $1k", 
           members: 1240, 
           active: 45, 
           tags: ['HIGH-CONVICTION', 'REVENUE-FIRST'], 
           isJoined: true, 
           coverGradient: 'from-blue-900 to-slate-900', 
           logo: 'SaaS',
           channels: [
               { id: 't1-ann', name: 'announcements', type: 'text' },
               { id: 't1-collab', name: 'collaboration', type: 'text' },
               { id: 't1-res', name: 'resource-vault', type: 'text' }
           ]
       },
       { 
           id: 't2', 
           name: "AI Builders", 
           niche: "Generative AI", 
           criteria: "Active Prototype", 
           members: 3200, 
           active: 180, 
           tags: ['BUILDER-ONLY', 'TECH-HEAVY'], 
           isJoined: true, 
           coverGradient: 'from-purple-900 to-indigo-900', 
           logo: 'AI',
           channels: [
               { id: 't2-gen', name: 'general', type: 'text' },
               { id: 't2-show', name: 'showcase', type: 'text' },
               { id: 't2-voice', name: 'voice-chat', type: 'voice' }
           ]
       }
    ]);

    const [discoverTribes, setDiscoverTribes] = useState<Tribe[]>([
       { 
           id: 't3', 
           name: "D2C Revolution", 
           niche: "Direct to Consumer", 
           criteria: "Physical Product", 
           members: 890, 
           active: 32, 
           tags: ['BRANDING', 'ECOMMERCE'], 
           isJoined: false, 
           coverGradient: 'from-orange-900 to-red-900', 
           logo: 'D2C',
           channels: []
       },
       { 
           id: 't4', 
           name: "Fintech India", 
           niche: "Fintech", 
           criteria: "Compliance Ready", 
           members: 1500, 
           active: 67, 
           tags: ['REGULATION', 'PAYMENTS'], 
           isJoined: false, 
           coverGradient: 'from-emerald-900 to-teal-900', 
           logo: 'Fin',
           channels: []
       },
       { 
           id: 't5', 
           name: "No-Code Wizards", 
           niche: "No-Code Dev", 
           criteria: "Bubble/FlutterFlow", 
           members: 5400, 
           active: 400, 
           tags: ['SPEED', 'MVP'], 
           isJoined: false, 
           coverGradient: 'from-pink-900 to-rose-900', 
           logo: 'Wiz',
           channels: []
       }
    ]);

    const [investors] = useState<Investor[]>([
        { 
            id: 'inv1', 
            name: 'Ravi Gupta', 
            firm: 'Sequoia India', 
            type: 'Venture Capital', 
            alignment: 96, 
            range: '$1M - $10M (Seed/Series A)', 
            vetted: true, 
            avatarSeed: 'Ravi', 
            rounds: ['Seed', 'Series A'], 
            thesis: 'Backing legendary founders building the future of India and Southeast Asia through deep-tech and AI.',
            roundPreferences: [
                { round: 'Seed', checkSize: '$1M - $3M', focus: 'Product-Market Fit', criteria: ['High Retention', 'Scalable Tech Stack'] },
                { round: 'Series A', checkSize: '$5M - $10M', focus: 'Growth & Scale', criteria: ['Unit Economics', 'GTM Velocity'] }
            ]
        },
        { 
            id: 'inv2', 
            name: 'Naval R.', 
            firm: 'AngelList Syndicate', 
            type: 'Angel Group', 
            alignment: 92, 
            range: '$50k - $500k (Pre-Seed)', 
            vetted: true, 
            avatarSeed: 'Naval', 
            rounds: ['Pre-Seed'], 
            thesis: 'Investing in high-leverage individuals and protocols that decentralize power and create permissionless wealth.',
            roundPreferences: [
                { round: 'Pre-Seed', checkSize: '$50k - $500k', focus: 'Founder Quality', criteria: ['Specific Knowledge', 'High Agency'] }
            ]
        },
        { 
            id: 'inv3', 
            name: 'Sarah Chen', 
            firm: 'Horizon Ventures', 
            type: 'Seed Fund', 
            alignment: 88, 
            range: '$250k - $1.5M (Seed)', 
            vetted: true, 
            avatarSeed: 'Sarah', 
            rounds: ['Seed'], 
            thesis: 'Focused on the intersection of sustainability and software, supporting founders solving the climate crisis.',
            roundPreferences: [
                { round: 'Seed', checkSize: '$250k - $1.5M', focus: 'Impact & Tech', criteria: ['Carbon Offset Potential', 'LCA Analysis'] }
            ]
        },
        { 
            id: 'inv4', 
            name: 'Kunal Shah', 
            firm: 'SuperAngels', 
            type: 'Syndicate Lead', 
            alignment: 85, 
            range: '$100k - $300k (Early Seed)', 
            vetted: true, 
            avatarSeed: 'Kunal', 
            rounds: ['Pre-Seed', 'Seed'], 
            thesis: 'Betting on product-first founders who understand consumer psychology and delta-4 efficiency.',
            roundPreferences: [
                { round: 'Pre-Seed', checkSize: '$100k - $200k', focus: 'Product Hook', criteria: ['High NPS', 'Viral Loops'] },
                { round: 'Seed', checkSize: '$200k - $300k', focus: 'Retention', criteria: ['Cohort Analysis', 'LTV/CAC'] }
            ]
        }
    ]);

    const [channels, setChannels] = useState<Channel[]>([
        { id: 'announcements', name: 'announcements', type: 'text' },
        { id: 'collaboration', name: 'collaboration', type: 'text' },
        { id: 'resource-vault', name: 'resource-vault', type: 'text' },
        { id: 'weekly-sync', name: 'weekly-sync', type: 'voice' }
    ]);
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');

    const handleCreateChannel = () => {
        if (!newChannelName.trim() || !activeTribe) return;
        
        // Final validation: only lowercase alphanumeric and hyphens
        const isValid = /^[a-z0-9-]+$/.test(newChannelName);
        if (!isValid) {
            if (onSuccess) onSuccess("Use only lowercase letters, numbers, and hyphens.");
            return;
        }

        const id = newChannelName;
        
        const newChannel: Channel = {
            id: `${activeTribe.id}-${id}`,
            name: id,
            type: newChannelType
        };

        const updateTribes = (tribes: Tribe[]) => tribes.map(t => 
            t.id === activeTribe.id 
            ? { ...t, channels: [...(t.channels || []), newChannel] } 
            : t
        );

        setMyTribes(prev => updateTribes(prev));
        setDiscoverTribes(prev => updateTribes(prev));
        
        // Update activeTribe local copy for UI reflection
        setActiveTribe(prev => prev ? { ...prev, channels: [...(prev.channels || []), newChannel] } : null);

        setNewChannelName('');
        setIsCreatingChannel(false);
        setActiveChannel(newChannel.id);
        if (onSuccess) onSuccess(`Channel #${id} created in ${activeTribe.name}!`);
    };

    const founders = [
        { id: '1', name: "Advait Sharma", role: "Backend Architect", match: 96, synergy: "AI Analysis: Your vision + his scalable architecture = 10x growth potential.", commitment: ["Equity Only", "20h/wk"], skills: ["Node.js", "PostgreSQL", "AWS"], projects: 5, roadmaps: 12, avatar: "Advait", online: true },
        { id: '2', name: "Sarah Chen", role: "Product Designer", match: 94, synergy: "AI Analysis: Perfect design system fit for your B2B roadmap.", commitment: ["Co-Founder", "Full Time"], skills: ["Figma", "UI/UX", "Design Systems"], projects: 3, roadmaps: 8, avatar: "Sarah", online: false },
        { id: '3', name: "Marcus Reynolds", role: "Growth Marketer", match: 91, synergy: "AI Analysis: He specializes in the GTM channels your idea needs.", commitment: ["Advisor", "5h/wk"], skills: ["SEO", "Content Strategy", "PPC"], projects: 7, roadmaps: 15, avatar: "Marcus", online: true }
    ];

    const filteredFounders = founders.filter((f) => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              f.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = roleFilter === 'All Roles' || f.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleSubTabChange = (tab: any) => {
        onSubTabChange(tab);
        if (tab === 'my-team') {
            onFooterModeChange('team_context');
        } else {
            onFooterModeChange('network');
        }
        if (setAtmosphere) {
            setAtmosphere(tab === 'venture-bridge' ? 'bridge' : 'home');
        }
    };

    const renderTribeView = () => {
        if (!activeTribe) return null;
        
        const tribeChannels = activeTribe.channels || [];
        const currentChannel = tribeChannels.find(c => c.id === activeChannel);

        return (
            <AnimatePresence>
                <div 
                    className="fixed inset-0 z-[100] flex justify-end"
                >
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setActiveTribe(null); setActiveChannel(null); }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Side Panel */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md h-full bg-[#0a0a0f] border-l border-white/10 flex flex-col"
                    >
                        {/* Header Image/Gradient */}
                        <div className={`h-48 bg-gradient-to-br ${activeTribe.coverGradient} relative flex-shrink-0`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                            {currentChannel ? (
                                <button 
                                    onClick={() => setActiveChannel(null)}
                                    className="absolute top-6 left-6 p-2 px-4 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Tribe
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setActiveTribe(null)}
                                    className="absolute top-6 left-6 p-2 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <div className="absolute -bottom-6 left-8">
                                <div className="w-20 h-20 rounded-2xl bg-[#0a0a0f] border border-white/10 flex items-center justify-center">
                                    <span className="text-2xl font-black text-white">{activeTribe.logo}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pt-10 px-8 pb-32 no-scrollbar">
                            <AnimatePresence mode="wait">
                                {currentChannel ? (
                                    <motion.div 
                                        key="channel-chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full flex flex-col"
                                    >
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center text-cyan-400">
                                                    {currentChannel.type === 'voice' ? <Volume2 className="w-4 h-4" /> : <span className="font-bold">#</span>}
                                                </div>
                                                <h1 className="text-2xl font-black text-white uppercase tracking-tight">{currentChannel.name}</h1>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Channel Chat Room</p>
                                        </div>

                                        <div className="flex-1 space-y-6 mb-8">
                                            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex-shrink-0"></div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[11px] font-black text-white uppercase">System AI</span>
                                                        <span className="text-[9px] text-gray-600 font-mono">11:03 AM</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-relaxed font-medium">Welcome to the <span className="text-cyan-400">#{currentChannel.name}</span> channel. Context-aware synchronization initialized.</p>
                                                </div>
                                            </div>
                                            {/* Mock messages could go here */}
                                        </div>

                                        <div className="mt-auto">
                                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2 flex items-end gap-2">
                                                <textarea 
                                                    value={tribeChatInput} 
                                                    onChange={(e) => setTribeChatInput(e.target.value)} 
                                                    placeholder={`Message #${currentChannel.name}...`} 
                                                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none px-3 py-2 max-h-32" 
                                                    rows={1} 
                                                />
                                                <button className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="tribe-info"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{activeTribe.name}</h1>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest">{activeTribe.niche}</span>
                                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeTribe.criteria}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Members</p>
                                                    <p className="text-xl font-black text-white">{activeTribe.members.toLocaleString()}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Now</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                        <p className="text-xl font-black text-emerald-400">{activeTribe.active}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Tags & Focus</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {activeTribe.tags.map(tag => (
                                                    <span key={tag} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-300 font-bold tracking-wide transition-all hover:border-white/20">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tribe Channels</h3>
                                                <button 
                                                    onClick={() => setIsCreatingChannel(!isCreatingChannel)}
                                                    className="p-1 px-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400/20 transition-all flex items-center gap-1.5"
                                                >
                                                    <Plus className="w-3 h-3" /> Create
                                                </button>
                                            </div>

                                            {isCreatingChannel && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
                                                >
                                                    <div className="relative">
                                                        <input 
                                                            autoFocus
                                                            type="text" 
                                                            placeholder="channel-name" 
                                                            maxLength={25}
                                                            value={newChannelName}
                                                            onChange={(e) => {
                                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                                setNewChannelName(val);
                                                            }}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateChannel()}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-600 tracking-tighter">
                                                            {newChannelName.length}/25
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 font-medium px-1">Alphanumeric & Hyphens only. No spaces.</p>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => setNewChannelType('text')}
                                                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newChannelType === 'text' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                                                        >
                                                            Text
                                                        </button>
                                                        <button 
                                                            onClick={() => setNewChannelType('voice')}
                                                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newChannelType === 'voice' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                                                        >
                                                            Voice
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleCreateChannel}
                                                            className="flex-3 bg-white text-black text-[10px] font-black uppercase py-2.5 rounded-xl transition-all"
                                                        >
                                                            Confirm New Channel
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsCreatingChannel(false)}
                                                            className="flex-1 bg-white/5 text-gray-400 text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="space-y-2">
                                                {tribeChannels.length > 0 ? tribeChannels.map(c => (
                                                    <div key={c.id} onClick={() => setActiveChannel(c.id)} className="group w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                                                                {c.type === 'voice' ? <Volume2 className="w-4 h-4" /> : <span className="text-sm font-bold">#</span>}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">{c.name}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                                    </div>
                                                )) : (
                                                    <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[32px]">
                                                        <p className="text-xs text-gray-600 font-medium">No active channels. Start the conversation.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sticky Action Button */}
                        {!currentChannel && (
                            <div className="absolute bottom-0 left-0 w-full p-8 pt-4 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent border-t border-white/5">
                                <button 
                                    onClick={() => handleJoinTribe(activeTribe.id)}
                                    disabled={joinedTribes.includes(activeTribe.id)}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl ${
                                        joinedTribes.includes(activeTribe.id)
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-white text-black hover:bg-cyan-400'
                                    }`}
                                >
                                    {joinedTribes.includes(activeTribe.id) ? (
                                        <>
                                            <Check className="w-4 h-4" /> Entered Tribe
                                        </>
                                    ) : (
                                        'Initialize Access'
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    };


    return (
        <div className="flex flex-col h-full w-full p-6 pt-28 pb-32 overflow-y-auto no-scrollbar relative z-10">
            {activeTribe && renderTribeView()}
            
            {/* Investor Detail Modal */}
            {selectedInvestor && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-3xl bg-[#0a0a0c] border border-white/10 rounded-[40px] overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="relative h-48 bg-gradient-to-br from-emerald-900/40 to-black border-b border-white/5 p-8 flex items-end">
                            <button 
                                onClick={() => setSelectedInvestor(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-10"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            
                            <div className="flex items-center gap-6 relative z-0">
                                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 p-1 bg-black">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedInvestor.avatarSeed}`} className="w-full h-full rounded-full bg-gray-900" alt={selectedInvestor.name} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white leading-tight">{selectedInvestor.name}</h2>
                                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">{selectedInvestor.firm} • {selectedInvestor.type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-8">
                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Investment Thesis</h3>
                                        <p className="text-lg text-gray-200 leading-relaxed font-medium italic">"{selectedInvestor.thesis}"</p>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Funding Round Preferences</h3>
                                        <div className="space-y-4">
                                            {selectedInvestor.roundPreferences.map(pref => (
                                                <div key={pref.round} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">{pref.round}</span>
                                                            <span className="text-xs font-mono text-gray-400">{pref.checkSize}</span>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Priority Focus</div>
                                                    </div>
                                                    <p className="text-sm font-bold text-white mb-4">{pref.focus}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {pref.criteria.map(c => (
                                                            <span key={c} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-gray-400 font-medium">#{c}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10">
                                        <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">AI Match Score</h4>
                                        <div className="text-4xl font-black text-white mb-1">{selectedInvestor.alignment}%</div>
                                        <p className="text-[10px] text-emerald-400/60 font-medium">Thesis Alignment</p>
                                        <div className="mt-4 h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${selectedInvestor.alignment}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5">
                                        <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Founder Access</h4>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${selectedInvestor.vetted ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                                            <span className="text-xs font-bold text-gray-300">{selectedInvestor.vetted ? 'AI-Vetted Priority' : 'Standard Access'}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            handleIntroRequest(selectedInvestor.id);
                                            setSelectedInvestor(null);
                                        }}
                                        className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all"
                                    >
                                        Request Intro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col gap-6 mb-8 no-print transition-all duration-500">
                {subTab !== 'my-team' && (
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-1 font-['Plus_Jakarta_Sans']">
                            Network Street
                        </h2>
                        <p className="text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis font-['Plus_Jakarta_Sans'] transition-opacity duration-300">
                            Connect with the top 1% of builders and capital.
                        </p>
                    </div>
                )}
                <AnimatePresence>
                    {footerMode === 'main' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-0 overflow-x-auto no-scrollbar">
                                <div className="flex items-center gap-8 min-w-max">
                                    <button onClick={() => handleSubTabChange('co-founder')} className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative font-['Plus_Jakarta_Sans'] ${subTab === 'co-founder' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Co-Founders {subTab === 'co-founder' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></span>}</button>
                                    <button onClick={() => handleSubTabChange('my-team')} className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative font-['Plus_Jakarta_Sans'] ${subTab === 'my-team' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>My Team {subTab === 'my-team' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></span>}</button>
                                    <button onClick={() => handleSubTabChange('tribes')} className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative font-['Plus_Jakarta_Sans'] ${subTab === 'tribes' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Tribes {subTab === 'tribes' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></span>}</button>
                                    <button onClick={() => handleSubTabChange('venture-bridge')} className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative font-['Plus_Jakarta_Sans'] ${subTab === 'venture-bridge' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>Venture Bridge {subTab === 'venture-bridge' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 rounded-full"></span>}</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card rounded-[24px] p-6 border border-white/10 space-y-4">
                            <div className="flex justify-between items-start">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="flex gap-1">
                                    <Skeleton className="w-12 h-4 rounded" />
                                    <Skeleton className="w-12 h-4 rounded" />
                                </div>
                            </div>
                            <Skeleton className="w-3/4 h-6" />
                            <Skeleton className="w-1/2 h-4" />
                            <div className="space-y-2 pt-4">
                                <Skeleton className="w-full h-3" />
                                <Skeleton className="w-full h-3" />
                                <Skeleton className="w-2/3 h-3" />
                            </div>
                            <div className="pt-4 border-t border-white/5 flex gap-3">
                                <Skeleton className="flex-1 h-10 rounded-xl" />
                                <Skeleton className="flex-1 h-10 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {subTab === 'co-founder' && (
                <>
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                        <div className="relative w-full md:w-1/2 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by Skill..." className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all focus:bg-cyan-400/5 focus:ring-4 focus:ring-cyan-400/10 shadow-sm" />
                        </div>
                        <div className="relative w-full md:w-1/4">
                             <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400/50 appearance-none cursor-pointer">
                                <option>All Roles</option><option>CTO / Tech Lead</option><option>Product Designer</option><option>Growth Marketer</option>
                             </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredFounders.map((f) => (
                            <div key={f.id} className="group relative rounded-[24px] p-[1px] transition-all duration-300 hover:-translate-y-2">
                                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 group-hover:via-[#FFD700]/40 group-hover:opacity-100 transition-all duration-700 animate-shimmer-flash"></div>
                                <div className="absolute inset-0 rounded-[24px] border border-white/5 group-hover:border-[#FFD700]/30 transition-colors duration-500"></div>
                                <div className="relative h-full w-full bg-[#0f0f14]/90 backdrop-blur-xl rounded-[23px] p-6 flex flex-col justify-between">
                                    <div className="absolute top-4 right-4 flex gap-1.5">{f.commitment.map((tag, i) => (<span key={i} className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-bold text-gray-300 uppercase tracking-wider backdrop-blur-sm">{tag}</span>))}</div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-cyan-400 group-hover:to-purple-500 transition-all duration-500 shadow-lg will-change-transform"><img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${f.avatar}`} alt={f.name} className="w-full h-full rounded-full bg-[#0f0f14]" loading="lazy" />{f.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10b981] border-2 border-[#0f0f14] rounded-full"></div>}</div>
                                            <div><h3 className="text-lg font-black text-white leading-tight group-hover:text-cyan-400 transition-colors">{f.name}</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{f.role}</p><div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-tight">{f.match}% Match</div></div>
                                        </div>
                                        <div className="mb-5 relative pl-3 border-l-2 border-cyan-500/30"><p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">AI Synergy Insight</p><p className="text-[11px] text-gray-300 leading-relaxed font-medium">"{f.synergy}"</p></div>
                                        <div className="flex flex-wrap gap-2 mb-6">{f.skills.map(skill => (<span key={skill} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-300 font-medium">{skill}</span>))}</div>
                                    </div>
                                    <div>
                                        <div className="h-[1px] w-full bg-white/5 mb-4"></div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setSelectedFounder(f)} className="py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">Quick Chat</button>
                                            <button 
                                                onClick={() => handleBookIntro(f.id)} 
                                                className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                                    requestedIntros.includes(f.id) 
                                                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 animate-pulse' 
                                                    : 'bg-transparent border-white/20 text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                {requestedIntros.includes(f.id) ? 'Requested' : 'Book Intro'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {subTab === 'tribes' && (
                <div className="flex flex-col gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-1"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">My Tribes</h3></div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {myTribes.map(t => (
                                <button 
                                    key={t.id} 
                                    onClick={() => { setActiveTribe(t); setActiveChannel(null); }} 
                                    className="flex flex-col items-center gap-3 group min-w-[80px]"
                                >
                                    <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-br ${t.coverGradient} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/10">
                                            <span className="text-xs font-black text-white">{t.logo}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{t.name}</span>
                                </button>
                            ))}
                            <button onClick={() => setIsCreatingTribe(true)} className="flex flex-col items-center gap-3 group min-w-[80px]"><div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors"><svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></div><span className="text-[10px] font-bold text-gray-500">Create</span></button>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-6 px-1"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Discover Tribes</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {discoverTribes.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => { setActiveTribe(t); setActiveChannel(null); }} 
                                    className="cursor-pointer group glass-card rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div className={`h-24 bg-gradient-to-br ${t.coverGradient} relative`}><div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div><div className="absolute -bottom-6 left-6"><div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-2xl"><span className="text-sm font-black text-white">{t.logo}</span></div></div><div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider">{t.niche}</div></div>
                                    <div className="pt-8 p-6">
                                        <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-2">{t.name}</h4>
                                        <p className="text-xs text-gray-400 mb-4 font-medium">Entry: <span className="text-gray-300">{t.criteria}</span></p>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                <span className="text-[10px] font-bold text-gray-300">{t.members}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-emerald-400">{t.active} Active</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleJoinTribe(t.id)} 
                                            disabled={joinedTribes.includes(t.id)}
                                            className={`w-full py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                joinedTribes.includes(t.id)
                                                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                                            }`}
                                        >
                                            {joinedTribes.includes(t.id) ? 'Member' : 'Request to Join'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}            {subTab === 'my-team' && (
                <div className="flex-1 w-full relative z-10 overflow-x-auto no-scrollbar bg-transparent">
                    {teamContextTab === 'team' || !teamContextTab ? (
                        <div className="w-full md:min-w-[1600px] flex flex-col items-center">
                            {/* Teams Context Top Bar */}
                            <div className="w-full max-w-[1100px] md:max-w-none md:w-[1600px] px-4 py-3 flex items-center gap-[10px] z-30">
                                {/* ADD MEMBER */}
                                <button 
                                    onClick={() => {
                                        setEditingMember(null);
                                        setEditingDeptId('finance');
                                        setIsMemberModalOpen(true);
                                    }}
                                    className="order-1 flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/12 text-white text-[11px] font-black uppercase tracking-[1px] hover:md:border-white/30 hover:md:bg-white/10 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5 text-white/70" />
                                    <span className="hidden xs:inline">Add Member</span>
                                    <span className="xs:hidden">Member</span>
                                </button>

                                {/* ADD DEPT */}
                                <button 
                                    onClick={() => setIsDepartmentModalOpen(true)}
                                    className="order-3 md:order-2 flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/12 text-[#f97316] text-[11px] font-black uppercase tracking-[1px] hover:md:border-white/30 hover:md:bg-white/10 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5 text-[#f97316]/70" />
                                    <span className="hidden xs:inline">Add Dept</span>
                                    <span className="xs:hidden">Dept</span>
                                </button>

                                {/* SEARCH BAR */}
                                <div className="order-2 md:order-3 flex-1 flex items-center">
                                    <div className="relative w-full">
                                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                            <Search className="w-3.5 h-3.5 text-white/70" />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Search..." 
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            className="w-full h-[38px] pl-10 pr-4 bg-white/5 border border-white/12 rounded-[10px] text-[11px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all uppercase tracking-[1px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div 
                                className="max-w-md md:max-w-none md:w-[1600px] mx-auto pt-8 md:pt-12 pb-32 px-4 flex flex-col items-center relative min-h-[80vh]"
                                style={{
                                backgroundImage: `radial-gradient(circle, rgba(0,200,255,0.2) 1.5px, transparent 1.5px)`,
                                backgroundSize: '28px 28px',
                            }}
                        >
                            {/* CEO Node */}
                            <div className={`flex flex-col items-center relative mb-0 w-full px-4 text-center transition-all duration-500 ${(!memberSearchQuery || "Sarthak Singh".toLowerCase().includes(memberSearchQuery.toLowerCase()) || "CEO & Founder".toLowerCase().includes(memberSearchQuery.toLowerCase())) ? 'opacity-100 scale-100' : 'opacity-20 scale-95'}`}>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-20 w-3/4 md:w-[220px] rounded-[16px] border border-white/20 p-[10px_14px] md:p-[12px_16px] flex flex-col items-center group transition-all duration-500 cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
                                    onClick={() => handleViewProfile({ id: 'ceo', name: 'Sarthak Singh', role: 'CEO & Founder', avatar: 'founder' }, { name: 'Leadership' })}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-[44px] h-[44px] md:w-14 md:h-14 rounded-full p-0 relative mb-3">
                                            <img src="https://i.pravatar.cc/150?u=founder" alt="CEO" className="w-full h-full rounded-full object-cover border-2 border-white/30" />
                                        </div>
                                        <div className="text-center w-full">
                                            <h3 className="text-white text-[13px] md:text-[14px] font-semibold leading-tight uppercase tracking-[0.5px] font-['Inter']">Sarthak Singh</h3>
                                            <p className="text-[rgba(179,136,255,0.85)] text-[10px] mt-1 uppercase tracking-[1.5px] font-normal font-['Inter']">CEO & Founder</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Desktop curved connectors */}
                                <div className="hidden md:block relative w-full h-16 pointer-events-none">
                                    <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-16" viewBox="0 0 1600 64" fill="none">
                                        <path 
                                            d="M 800 0 L 800 20"
                                            stroke="rgba(255,255,255,0.35)" 
                                            strokeWidth="1.5" 
                                            strokeLinecap="round"
                                            style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.2))' }}
                                        />
                                        {/* Branching to Depts */}
                                        {departments.map((dept, idx) => {
                                            const xPos = (1600 / (departments.length)) * (idx + 0.5);
                                            const color = getLineColor(dept.color);
                                            return (
                                                <path 
                                                    key={dept.id}
                                                    d={`M 800 20 C 800 40, ${xPos} 40, ${xPos} 60 L ${xPos} 64`} 
                                                    stroke={color} 
                                                    strokeWidth="1.5" 
                                                    strokeLinecap="round" 
                                                    strokeOpacity="0.7" 
                                                    style={{ filter: `drop-shadow(0 0 3px ${color}44)` }} 
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* Mobile straight connector */}
                                <div 
                                    className="md:hidden w-[1.5px] h-8 mx-auto" 
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.35)',
                                        filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.2))'
                                    }}
                                ></div>
                            </div>


                            {/* Departments Section */}
                            <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full max-w-[1100px] md:max-w-none md:w-[1600px] md:gap-0 relative">
                                {/* Mobile: No more absolute side-spine. DepartmentNode handles its own top connector. */}
                                {departments.map((dept, idx) => (
                                    <DepartmentNode 
                                        key={dept.id} 
                                        dept={dept} 
                                        index={idx} 
                                        onEdit={(member, deptId) => {
                                            setEditingMember(member);
                                            setEditingDeptId(deptId);
                                            setIsMemberModalOpen(true);
                                        }}
                                        searchQuery={memberSearchQuery}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    ) : teamContextTab === 'tasks' ? (
                        <TeamTasks />
                    ) : (
                        <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="glass-card rounded-[32px] p-10 border border-white/10 text-center">
                                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                                    {teamContextTab === 'overview' && <BarChart3 className="w-10 h-10 text-indigo-400" />}
                                    {teamContextTab === 'tasks' && <CheckCircle2 className="w-10 h-10 text-indigo-400" />}
                                    {teamContextTab === 'chat' && <MessageSquare className="w-10 h-10 text-indigo-400" />}
                                    {teamContextTab === 'settings' && <Settings2 className="w-10 h-10 text-indigo-400" />}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Team {teamContextTab}</h3>
                                <p className="text-gray-400 font-medium uppercase tracking-[3px] text-[10px]">Contextual module active</p>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 mb-4"></div>
                                        <div className="h-4 w-3/4 bg-white/10 rounded mb-2"></div>
                                        <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 mb-4"></div>
                                        <div className="h-4 w-3/4 bg-white/10 rounded mb-2"></div>
                                        <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    <ProfilePopup 
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        member={viewingMember}
                        dept={viewingDept}
                    />

                    <MemberModal 
                        isOpen={isMemberModalOpen}
                        onClose={() => setIsMemberModalOpen(false)}
                        member={editingMember}
                        departments={departments}
                        editingDeptId={editingDeptId}
                        onSave={(data: any) => {
                            const updatedDepts = departments.map(d => {
                                if (d.id === data.deptId) {
                                    if (editingMember) {
                                        // Edit
                                        if (d.manager.id === editingMember.id) {
                                            return { ...d, manager: { ...d.manager, ...data, skills: data.skills } };
                                        }
                                        const updatedMembers = d.members.map((m: any) => 
                                            m.id === editingMember.id ? { ...m, ...data, skills: data.skills } : m
                                        );
                                        return { ...d, members: updatedMembers };
                                    } else {
                                        // Add
                                        const newMember = {
                                            ...data,
                                            id: `m-${Date.now()}`,
                                            skills: data.skills
                                        };
                                        return { ...d, members: [...d.members, newMember] };
                                    }
                                }
                                // If department changed, move member
                                if (editingMember && d.id === editingDeptId && data.deptId !== editingDeptId) {
                                     const updatedMembers = d.members.filter((m: any) => m.id !== editingMember.id);
                                     return { ...d, members: updatedMembers };
                                }
                                return d;
                            });

                            // Handle moving member to new department
                            if (editingMember && data.deptId !== editingDeptId) {
                                const finalDepts = updatedDepts.map(d => {
                                    if (d.id === data.deptId) {
                                        const newMember = {
                                            ...data,
                                            id: editingMember.id,
                                            skills: data.skills
                                        };
                                        return { ...d, members: [...d.members, newMember] };
                                    }
                                    return d;
                                });
                                setDepartments(finalDepts);
                            } else {
                                setDepartments(updatedDepts);
                            }
                            
                            setIsMemberModalOpen(false);
                            if (onSuccess) onSuccess(editingMember ? "Specialist record updated." : "New specialist deployed.");
                        }}
                        onDelete={(memberId: string, deptId: string) => {
                            const updatedDepts = departments.map(d => {
                                if (d.id === deptId) {
                                    // Check if it's the manager
                                    if (d.manager.id === memberId) {
                                        // If it's the manager, we clear the manager slot with a placeholder or similar logic
                                        // But for now, let's just make it empty-ish or handle it
                                        return { ...d, manager: { id: `m-deleted-${Date.now()}`, name: 'N/A', role: 'VACANT', avatar: '', isManager: true }, members: d.members };
                                    }
                                    const updatedMembers = d.members.filter((m: any) => m.id !== memberId);
                                    return { ...d, members: updatedMembers };
                                }
                                return d;
                            });
                            setDepartments(updatedDepts);
                            setIsMemberModalOpen(false);
                            if (onSuccess) onSuccess("Specialist decommissioned from unit.");
                        }}
                    />

                    <DepartmentModal 
                        isOpen={isDepartmentModalOpen}
                        onClose={() => setIsDepartmentModalOpen(false)}
                        onSave={(data: any) => {
                            const newDept = {
                                id: data.name.toLowerCase().replace(/\s+/g, '-'),
                                name: data.name,
                                color: data.color,
                                icon: data.icon,
                                manager: {
                                    ...data.manager,
                                    id: `head-${Date.now()}`,
                                    isManager: true
                                },
                                members: []
                            };
                            setDepartments([...departments, newDept]);
                            setIsDepartmentModalOpen(false);
                            if (onSuccess) onSuccess("New business unit initialized.");
                        }}
                    />
                </div>
            )}

            {subTab === 'venture-bridge' && (
                <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Funding Round Filter */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                        <div className="relative w-full md:w-1/3">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Filter by Funding Round</p>
                            <div className="relative">
                                <select 
                                    value={roundFilter} 
                                    onChange={(e) => setRoundFilter(e.target.value)} 
                                    className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400/50 appearance-none cursor-pointer"
                                >
                                    <option>All Rounds</option>
                                    <option>Pre-Seed</option>
                                    <option>Seed</option>
                                    <option>Series A</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {investors.filter(inv => roundFilter === 'All Rounds' || inv.rounds.includes(roundFilter)).map(inv => (
                            <div 
                                key={inv.id} 
                                onClick={() => setSelectedInvestor(inv)}
                                className="group relative rounded-[32px] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/30 bg-[#050505]/90 border border-white/5 backdrop-blur-3xl p-1 cursor-pointer"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                <div className="p-8 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-2 border-[#FFD700]/20 p-1 group-hover:border-[#FFD700]/50 transition-all">
                                                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${inv.avatarSeed}`} className="w-full h-full rounded-full bg-gray-900" alt={inv.name} />
                                            </div>
                                            {inv.vetted && (
                                                <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1.5 border border-[#10b981]/30 shadow-lg cursor-help" title="AI-VETTED FOUNDER ACCESS">
                                                    <div className="bg-[#10b981]/10 text-[#10b981] p-1 rounded-full"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                                                {inv.alignment}% Thesis Alignment
                                            </span>
                                            
                                            {/* AI Match Score Reveal */}
                                            <div className="w-32 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                                <div className="flex justify-between items-center mb-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                                    <span>AI Synergy</span>
                                                    <span>{inv.alignment}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                                        style={{ width: `${inv.alignment}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-2xl font-black text-white leading-tight">{inv.name}</h3>
                                            <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Intelligence</div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">{inv.firm} • {inv.type}</p>
                                        <div className="relative pl-3 border-l border-emerald-500/30">
                                            <p className="text-[11px] text-gray-400 leading-relaxed italic">"{inv.thesis}"</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-10 space-y-4">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Investment Velocity</p>
                                            <p className="text-xs font-bold text-gray-300 font-mono tracking-tight">{inv.range}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">Round Preferences</p>
                                            <div className="space-y-3">
                                                {inv.roundPreferences.map(pref => (
                                                    <div key={pref.round} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">{pref.round}</span>
                                                            <span className="text-[9px] font-mono text-gray-500">{pref.checkSize}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-300 font-bold mb-2">Focus: {pref.focus}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {pref.criteria.map(c => (
                                                                <span key={c} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">#{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {['B2B', 'AI', 'SaaS'].map(tag => (
                                                <span key={tag} className="text-[9px] font-black px-2 py-1 rounded border border-white/5 bg-white/[0.02] text-gray-500 uppercase tracking-tighter">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleIntroRequest(inv.id);
                                            }} 
                                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300 active:scale-95 group-hover:scale-[1.05] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] ${
                                                requestedIntros.includes(inv.id) 
                                                ? 'bg-emerald-600 text-white animate-pulse' 
                                                : 'bg-white text-black hover:bg-gray-100'
                                            }`}
                                        >
                                            {requestedIntros.includes(inv.id) ? 'Sent to Partner' : 'Request Intro'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                </>
            )}

            {/* Founder Details Modal */}
            <AnimatePresence>
                {selectedFounder && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedFounder(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-md bg-[#0f0f14] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 to-purple-500`}>
                                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedFounder.avatar}`} alt={selectedFounder.name} className="w-full h-full rounded-full bg-[#0f0f14]" />
                                        {selectedFounder.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10b981] border-2 border-[#0f0f14] rounded-full"></div>}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-xl leading-tight">{selectedFounder.name}</h3>
                                        <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">{selectedFounder.role}</p>
                                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-tight">{selectedFounder.match}% Match</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedFounder(null)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col gap-6">
                                <div className="relative pl-3 border-l-2 border-cyan-500/30">
                                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">AI Synergy Insight</p>
                                    <p className="text-sm text-gray-300 leading-relaxed font-medium">"{selectedFounder.synergy}"</p>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Skills & Expertise</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFounder.skills.map((skill: string) => (
                                            <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white font-medium">{skill}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-black text-white mb-1">{selectedFounder.projects}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Projects</span>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-black text-white mb-1">{selectedFounder.roadmaps}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Roadmaps</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Commitment</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFounder.commitment.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-bold uppercase tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95">
                                    Start Chat
                                </button>
                                <button className="flex-1 py-3 rounded-xl border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                                    Invite to Team
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {footerMode === 'main' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        className="fixed bottom-24 left-6 z-40 md:hidden"
                    >
                        <button 
                            onClick={() => onFooterModeChange('network')}
                            className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full hover:border-cyan-400/50 transition-all group"
                        >
                            <Menu className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest font-['Plus_Jakarta_Sans']">Options</span>
                            <div className="absolute inset-0 bg-cyan-400/10 rounded-full filter blur-md -z-10 group-hover:bg-cyan-400/20 transition-all opacity-0 group-hover:opacity-100"></div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ChallengesScreen: React.FC<{
    acceptedMissions: string[];
    setAcceptedMissions: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ acceptedMissions, setAcceptedMissions }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [challengeTab, setChallengeTab] = useState<'global' | 'team' | 'skill'>('global');
    const [showConfetti, setShowConfetti] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [challengeTab]);

    const handleAccept = (id: string) => {
        if (!acceptedMissions.includes(id)) {
            setAcceptedMissions(prev => [...prev, id]);
            setShowConfetti(id);
            setTimeout(() => setShowConfetti(null), 1500);
        }
    };

    const ConfettiBurst = () => (
        <div className="absolute inset-0 pointer-events-none z-50">
            {[...Array(16)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }}
                    animate={{ 
                        x: `${50 + (Math.random() - 0.5) * 300}%`, 
                        y: `${50 + (Math.random() - 0.5) * 300}%`, 
                        scale: Math.random() * 1.2 + 0.5,
                        opacity: 0,
                        rotate: Math.random() * 720
                    }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute w-1.5 h-1.5 rounded-sm bg-emerald-400"
                    style={{ 
                        left: '0%', 
                        top: '0%',
                        backgroundColor: ['#34d399', '#6ee7b7', '#10b981', '#ffffff'][Math.floor(Math.random() * 4)]
                    }}
                />
            ))}
        </div>
    );

    const missions = [
        { id: 'm1', title: "MVP Launch Sprint", type: "Global Mission", difficulty: "Hard", timeLeft: "14h 22m 10s", reward: "800 XP + Priority Access", progress: 65, participants: 1204, isUrgent: true, bgGradient: "from-orange-900/20 to-red-900/20" },
        { id: 'm2', title: "First 10 Customers Quest", type: "Global Mission", difficulty: "Medium", timeLeft: "3d 05h 12m", reward: "500 XP + Growth Badge", progress: 32, participants: 850, isUrgent: false, bgGradient: "from-blue-900/20 to-cyan-900/20" },
        { id: 'm3', title: "Pitch Deck Masterclass", type: "Skill Quest", difficulty: "Easy", timeLeft: "5d 10h 00m", reward: "200 XP + Template Pack", progress: 88, participants: 2300, isUrgent: false, bgGradient: "from-purple-900/20 to-indigo-900/20" },
        { id: 'm4', title: "No-Code Hackathon", type: "Team Battle", difficulty: "Expert", timeLeft: "08h 45m 20s", reward: "2000 XP + $5k Grant", progress: 92, participants: 340, isUrgent: true, bgGradient: "from-emerald-900/20 to-teal-900/20" }
    ];

    const leaderboard = [
        { rank: 1, name: "Arjun K.", xp: 3450, change: "+2" },
        { rank: 2, name: "Sarah M.", xp: 3200, change: "-1" },
        { rank: 3, name: "Rohan D.", xp: 2980, change: "+5" },
        { rank: 4, name: "You", xp: 2450, change: "+12", isUser: true },
        { rank: 5, name: "Priya P.", xp: 2100, change: "0" },
    ];

    const filteredMissions = missions.filter(m => {
        if (challengeTab === 'global') return m.type === 'Global Mission';
        if (challengeTab === 'team') return m.type === 'Team Battle';
        if (challengeTab === 'skill') return m.type === 'Skill Quest';
        return true;
    });

    return (
        <div className="flex flex-col h-full w-full p-6 pt-28 pb-32 overflow-y-auto no-scrollbar relative z-10">
            <div className="w-full max-w-6xl mx-auto mb-8">
                <div className="glass-card rounded-[24px] p-1 border border-white/10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none"></div>
                    <div className="flex-1 flex items-center justify-around w-full p-4 md:border-r border-white/5 relative z-10">
                        <div className="flex flex-col items-center"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Global Rank</span><div className="flex items-center gap-2"><span className="text-2xl font-black text-white font-mono">#42</span><span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> 12</span></div></div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total XP</span><span className="text-2xl font-black text-cyan-400 font-mono">2,450</span></div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center"><span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">League</span><div className="flex items-center gap-1.5"><Medal className="w-5 h-5 text-[#FFD700]" /><span className="text-sm font-bold text-[#FFD700] uppercase tracking-wider">Gold</span></div></div>
                    </div>
                    <div className="flex items-center gap-3 p-4 px-8 bg-black/20 rounded-[20px] m-1 md:w-auto w-full justify-center border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-2 hidden md:block">Badges</span>
                        {[<Zap className="w-5 h-5 text-amber-400" />, <Rocket className="w-5 h-5 text-cyan-400" />, <Brain className="w-5 h-5 text-purple-400" />].map((icon, i) => (<div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-110 transition-transform cursor-help">{icon}</div>))}
                        <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-600 text-xs hover:text-white hover:border-white/40 transition-colors cursor-pointer">+2</div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        {[{ id: 'global', label: 'Global Missions', color: 'cyan' }, { id: 'team', label: 'Team Battles', color: 'purple' }, { id: 'skill', label: 'Skill Quests', color: 'emerald' }].map(tab => (
                            <button key={tab.id} onClick={() => setChallengeTab(tab.id as any)} className={`px-6 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${challengeTab === tab.id ? `bg-${tab.color}-500/10 border-${tab.color}-500 text-${tab.color}-400` : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}>{tab.label}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="glass-card rounded-[24px] p-6 border border-white/10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="w-24 h-4" />
                                        <Skeleton className="w-16 h-4" />
                                    </div>
                                    <Skeleton className="w-full h-8" />
                                    <div className="space-y-2">
                                        <Skeleton className="w-1/3 h-3" />
                                        <Skeleton className="w-1/2 h-6" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><Skeleton className="w-1/4 h-3" /><Skeleton className="w-10 h-3" /></div>
                                            <Skeleton className="w-full h-1.5 rounded-full" />
                                        </div>
                                        <Skeleton className="w-full h-12 rounded-xl" />
                                    </div>
                                    <Skeleton className="w-full h-12 rounded-xl" />
                                </div>
                            ))
                        ) : filteredMissions.map((mission) => (
                            <div key={mission.id} className={`group relative glass-card rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${mission.isUrgent ? 'border-orange-500/50' : ''}`}>
                                {mission.isUrgent && <div className="absolute inset-0 border-2 border-orange-500/50 rounded-[24px] animate-pulse pointer-events-none"></div>}
                                <div className={`absolute inset-0 bg-gradient-to-br ${mission.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <div className="p-6 relative z-10">
                                    {showConfetti === mission.id && <ConfettiBurst />}
                                    <div className="flex justify-between items-start mb-4"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${mission.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : mission.difficulty === 'Expert' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>Level: {mission.difficulty}</span>{mission.isUrgent && (<div className="flex items-center gap-1.5 animate-pulse"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div><span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">Ending Soon</span></div>)}</div>
                                    <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{mission.title}</h3>
                                    <div className="mb-6"><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Time Remaining</div><div className="font-mono text-lg font-bold text-gray-200">{mission.timeLeft}</div></div>
                                    <div className="space-y-3">
                                        <div><div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5"><span className="text-gray-400">Completion Rate</span><span className="text-cyan-400">{mission.progress}%</span></div><div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${mission.progress}%` }}></div></div></div>
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg></div><div><div className="text-[9px] text-gray-500 font-bold uppercase">Reward</div><div className="text-xs font-bold text-white">{mission.reward}</div></div></div>
                                    </div>
                                    <button 
                                        onClick={() => handleAccept(mission.id)}
                                        disabled={acceptedMissions.includes(mission.id)}
                                        className={`w-full mt-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative group ${acceptedMissions.includes(mission.id) ? 'bg-emerald-500 text-white cursor-default border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white text-black hover:bg-gray-200'}`}
                                    >
                                        {acceptedMissions.includes(mission.id) ? (
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="flex items-center gap-2"
                                            >
                                                <motion.span 
                                                    initial={{ scale: 0 }} 
                                                    animate={{ scale: 1 }} 
                                                    transition={{ delay: 0.1, type: "spring" }}
                                                >
                                                    MISSION ACCEPTED
                                                </motion.span>
                                                <motion.svg 
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                    className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </motion.svg>
                                                <motion.div
                                                    className="absolute inset-0 bg-white/20"
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '100%' }}
                                                    transition={{ duration: 0.6, ease: "linear" }}
                                                />
                                            </motion.div>
                                        ) : (
                                            "Accept Mission"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="glass-card rounded-[24px] border border-white/10 overflow-hidden sticky top-32 shadow-2xl">
                        <div className="p-5 border-b border-white/10 bg-black/40"><h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Trophy className="w-4 h-4 text-[#FFD700]" /> Weekly Top 5</h4></div>
                        <div className="p-2">{leaderboard.map((user) => (<div key={user.rank} className={`p-3 mb-1 rounded-xl flex items-center gap-3 transition-colors ${user.isUser ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}><div className={`w-6 h-6 flex items-center justify-center font-black text-xs ${user.rank === 1 ? 'text-[#FFD700]' : user.rank === 2 ? 'text-gray-300' : user.rank === 3 ? 'text-orange-400' : 'text-gray-500'}`}>#{user.rank}</div><div className="flex-1"><div className="text-xs font-bold text-white flex justify-between">{user.name}{user.isUser && <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 rounded uppercase self-center">You</span>}</div><div className="text-[10px] text-gray-500 font-mono">{user.xp} XP</div></div><div className={`text-[10px] font-bold ${user.change.startsWith('+') ? 'text-emerald-400' : user.change === '0' ? 'text-gray-600' : 'text-red-400'}`}>{user.change}</div></div>))}</div>
                        <div className="p-4 border-t border-white/10 bg-black/20 text-center"><button className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">View Full Rankings</button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MentorScreen: React.FC = () => {
    const [mentors, setMentors] = useState<(Mentor & { bio: string; synergy: number; featured?: boolean })[]>([
        { 
            id: 'm1', 
            name: "Aditya Singh", 
            role: "Ex-Founder", 
            company: "Stealth (YC S21)", 
            badge: "TOP RATED", 
            skills: ["Fundraising", "Product"], 
            available: true, 
            avatarSeed: "Aditya", 
            rate: "Equity / Free",
            bio: "Built and exited a fintech startup in 2 years. Expert in seed-stage fundraising and product-market fit.",
            synergy: 98,
            featured: true,
            reviews: [
                { id: 'r1', userId: 'u1', userName: 'Arpit S.', rating: 5, comment: "Incredible insights on PMF. Saved us months of trial and error.", date: "2 days ago" },
                { id: 'r2', userId: 'u2', userName: 'Sarah L.', rating: 4, comment: "Very tactical advice on fundraising. Highly recommended.", date: "1 week ago" }
            ]
        },
        { 
            id: 'm2', 
            name: "Sneha Roy", 
            role: "Senior PM", 
            company: "Razorpay", 
            badge: "GROWTH", 
            skills: ["Retention", "Fintech"], 
            available: false, 
            avatarSeed: "Sneha", 
            rate: "₹5000/hr",
            bio: "Leading growth initiatives at India's top fintech unicorn. Specialist in user retention and scaling payment products.",
            synergy: 85,
            reviews: [
                { id: 'r3', userId: 'u3', userName: 'John D.', rating: 5, comment: "Best retention strategist I've talked to.", date: "3 days ago" }
            ]
        },
        { 
            id: 'm3', 
            name: "Vikram M.", 
            role: "CTO", 
            company: "Unacademy", 
            badge: "SCALING", 
            skills: ["System Design", "Hiring"], 
            available: true, 
            avatarSeed: "Vikram", 
            rate: "₹8000/hr",
            bio: "Scaled engineering teams from 10 to 500+. Expert in distributed systems and building high-performance tech cultures.",
            synergy: 92,
            featured: true,
            reviews: []
        },
        { 
            id: 'm4', 
            name: "Priya K.", 
            role: "GTM Lead", 
            company: "Zomato", 
            badge: "MARKETING", 
            skills: ["GTM", "Sales"], 
            available: true, 
            avatarSeed: "Priya", 
            rate: "₹4000/hr",
            bio: "Launched Zomato in 15+ cities. Expert in hyper-local growth and building sales engines from scratch.",
            synergy: 88,
            reviews: [
                { id: 'r4', userId: 'u4', userName: 'Mike R.', rating: 5, comment: "Priya knows GTM like nobody else. Very actionable.", date: "5 days ago" }
            ]
        },
        { 
            id: 'm5', 
            name: "Rahul J.", 
            role: "Venture Partner", 
            company: "Accel", 
            badge: "INVESTOR", 
            skills: ["Pitching", "Strategy"], 
            available: true, 
            avatarSeed: "Rahul", 
            rate: "Free for SPIKE",
            bio: "Evaluating 100+ startups monthly. I help founders refine their narrative and get investor-ready.",
            synergy: 95,
            featured: true,
            reviews: [
                { id: 'r5', userId: 'u5', userName: 'Amit K.', rating: 5, comment: "Rahul's feedback on our pitch deck was a game changer.", date: "Yesterday" }
            ]
        }
    ]);

    const [pastSessions, setPastSessions] = useState<{ id: string; mentorId: string; date: string; time: string; rated: boolean }[]>([
        { id: 's1', mentorId: 'm1', date: 'Apr 5, 2026', time: '10:00 AM', rated: true },
        { id: 's2', mentorId: 'm4', date: 'Apr 8, 2026', time: '02:00 PM', rated: false },
    ]);

    const [selectedMentor, setSelectedMentor] = useState<(Mentor & { bio: string; synergy: number }) | null>(null);
    const [feedbackMentor, setFeedbackMentor] = useState<(Mentor & { sessionId: string }) | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [selectedDateObject, setSelectedDateObject] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>("10:00");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [filterSkill, setFilterSkill] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeMentorId, setActiveMentorId] = useState<string | null>(null);

    const [myProfile, setMyProfile] = useState({
        name: "Sarthak Singh",
        role: "Startup Mitra",
        company: "SPIKE",
        skills: ["Strategy", "Architecture"],
        available: true,
        bio: "Ruthless, execution-focused Venture Architect. Build your unfair advantage.",
        avatarSeed: "Sarthak"
    });

    const [isEditingMyProfile, setIsEditingMyProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState({...myProfile});

    const handleSaveProfile = () => {
        setMyProfile(editProfileData);
        setIsEditingMyProfile(false);
        toast.success("Profile Authenticated", {
            description: "Your architecture credentials have been updated.",
        });
    };

    const allSkills = Array.from(new Set(mentors.flatMap(m => m.skills)));
    const filteredMentors = filterSkill ? mentors.filter(m => m.skills.includes(filterSkill)) : mentors;
    const featuredMentors = mentors.filter(m => m.featured);

    const handleBookClick = (mentor: any) => {
        setSelectedMentor(mentor);
        setSelectedDateObject(new Date());
        setSelectedTime("10:00");
        setIsBooking(false);
        setBookingSuccess(false);
    };

    const handleConfirmBooking = (date?: Date, time?: string | null) => {
        const finalDate = date || selectedDateObject;
        const finalTime = time || selectedTime;
        
        if (!finalDate || !finalTime) return;
        
        const dateStr = finalDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = finalTime;
        
        setIsBooking(true);
        toast.message("Establishing Connection", {
            description: `Drafting partnership with ${selectedMentor?.name}...`,
        });
        
        setTimeout(() => {
            // Simulated Success
            const newSession = {
                id: `s${Date.now()}`,
                mentorId: selectedMentor!.id,
                date: dateStr,
                time: timeStr,
                rated: false
            };
            
            setBookingSuccess(true);
            setIsBooking(false);
            setPastSessions(prev => [newSession, ...prev]);
            
            toast.success("Execution Window Locked!", {
                description: `Session confirmed for ${dateStr} at ${timeStr}.`,
            });
        }, 2000);
    };

    const handleSubmitFeedback = () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        setIsSubmittingFeedback(true);
        
        setTimeout(() => {
            // Update mentor reviews
            setMentors(prev => prev.map(m => {
                if (m.id === feedbackMentor?.id) {
                    const newReview = {
                        id: `r${Date.now()}`,
                        userId: 'u_current',
                        userName: 'You',
                        rating,
                        comment,
                        date: 'Just now'
                    };
                    return { ...m, reviews: [newReview, ...(m.reviews || [])] };
                }
                return m;
            }));

            // Mark session as rated
            setPastSessions(prev => prev.map(s => {
                if (s.id === feedbackMentor?.sessionId) {
                    return { ...s, rated: true };
                }
                return s;
            }));

            toast.success("Feedback submitted!", {
                description: `Thank you for rating ${feedbackMentor?.name}.`,
            });
            
            setIsSubmittingFeedback(false);
            setFeedbackMentor(null);
            setRating(0);
            setComment('');
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full w-full p-6 lg:px-12 pt-28 lg:pt-36 pb-32 lg:pb-40 overflow-y-auto no-scrollbar relative z-10">
            <Toaster richColors />
            <div className="max-w-7xl mx-auto w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col items-center justify-center mb-12 sm:mb-20 group"
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] xl:text-[8rem] font-black tracking-tighter leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)] group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.8)] transition-all duration-700 whitespace-nowrap uppercase">
                        Mentor Corner
                    </h1>
                    <div className="mt-4 flex items-center gap-3 lg:gap-6">
                        <div className="h-[1px] w-8 sm:w-16 lg:w-32 bg-gradient-to-r from-transparent to-emerald-500"></div>
                        <span className="text-[10px] sm:text-xs lg:text-sm font-black text-emerald-500 uppercase tracking-[4px] lg:tracking-[6px]">Elite Execution Partners</span>
                        <div className="h-[1px] w-8 sm:w-16 lg:w-32 bg-gradient-to-l from-transparent to-emerald-500"></div>
                    </div>
                </motion.div>

                {/* Section Header with Filter */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-20">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 lg:mb-4">
                            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <h3 className="text-[11px] lg:text-[14px] font-black text-white uppercase tracking-[3px] lg:tracking-[5px]">
                                {!filterSkill ? 'Featured Architects' : `Experts in ${filterSkill}`}
                            </h3>
                        </div>
                        <p className="text-xs lg:text-sm text-gray-500 font-medium max-w-md lg:max-w-xl">Connect with founders who have actually built what you're dreaming of. No fluff, just execution.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 px-6 py-3.5 lg:px-8 lg:py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-md"
                            >
                                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-gray-500">Expertise:</span> {filterSkill || 'All Domains'}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 overflow-hidden z-50"
                                    >
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => { setFilterSkill(null); setIsDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${!filterSkill ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                All Domains
                                            </button>
                                            {allSkills.map(skill => (
                                                <button
                                                    key={skill}
                                                    onClick={() => { setFilterSkill(skill); setIsDropdownOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterSkill === skill ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Featured Section Grid */}
                {!filterSkill && (
                    <div className="mb-12">
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                            {featuredMentors.map((mentor, idx) => (
                                <motion.div 
                                    key={mentor.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (window.innerWidth < 768) {
                                            setActiveMentorId(activeMentorId === mentor.id ? null : mentor.id);
                                        } else {
                                            handleBookClick(mentor);
                                        }
                                    }}
                                >
                                    <TravelCard
                                        imageUrl={`https://picsum.photos/seed/${mentor.avatarSeed}/800/1200`}
                                        imageAlt={mentor.name}
                                        title={mentor.name}
                                        location={`${mentor.role} @ ${mentor.company}`}
                                        overview={mentor.bio}
                                        price={mentor.rate.split('/')[0]}
                                        pricePeriod={mentor.rate.split('/')[1] ? `/${mentor.rate.split('/')[1]}` : ''}
                                        onBookNow={() => handleBookClick(mentor)}
                                        rating={mentor.reviews && mentor.reviews.length > 0 ? mentor.reviews.reduce((acc, r) => acc + r.rating, 0) / mentor.reviews.length : undefined}
                                        reviewCount={mentor.reviews?.length}
                                        badge={mentor.badge}
                                        isActive={activeMentorId === mentor.id}
                                        skills={mentor.skills}
                                        isAvailable={mentor.available}
                                        className="max-w-none"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Mentors Grid */}
                <div>
                    {!filterSkill && (
                        <div className="flex items-center justify-between mb-6 lg:mb-10">
                            <h3 className="text-[10px] lg:text-xs font-black text-gray-500 uppercase tracking-[3px] lg:tracking-[5px]">
                                All Mentors
                            </h3>
                            <span className="text-[9px] lg:text-xs font-mono text-gray-600">{filteredMentors.length} results</span>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                        {filteredMentors.map((mentor, idx) => (
                            <motion.div 
                                key={mentor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="cursor-pointer"
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        setActiveMentorId(activeMentorId === mentor.id ? null : mentor.id);
                                    } else {
                                        handleBookClick(mentor);
                                    }
                                }}
                            >
                                <TravelCard
                                    imageUrl={`https://picsum.photos/seed/${mentor.avatarSeed}/800/1200`}
                                    imageAlt={mentor.name}
                                    title={mentor.name}
                                    location={`${mentor.role} @ ${mentor.company}`}
                                    overview={mentor.bio}
                                    price={mentor.rate.split('/')[0]}
                                    pricePeriod={mentor.rate.split('/')[1] ? `/${mentor.rate.split('/')[1]}` : ''}
                                    onBookNow={() => handleBookClick(mentor)}
                                    rating={mentor.reviews && mentor.reviews.length > 0 ? mentor.reviews.reduce((acc, r) => acc + r.rating, 0) / mentor.reviews.length : undefined}
                                    reviewCount={mentor.reviews?.length}
                                    badge={mentor.badge}
                                    isActive={activeMentorId === mentor.id}
                                    skills={mentor.skills}
                                    isAvailable={mentor.available}
                                    className="max-w-none"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Profile Refinement Section */}
                <div className="mt-20 lg:mt-32 border-t border-white/5 pt-20">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="w-full md:w-1/3">
                            <div className="flex items-center gap-3 mb-6">
                                <Settings2 className="w-5 h-5 text-emerald-400" />
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Refine Your Profile</h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                                Optimize your mentor identity. How you present yourself determines the quality of your strategic partnerships.
                            </p>
                            
                            {!isEditingMyProfile ? (
                                <div className="glass-card p-6 rounded-[24px] border border-white/10 relative overflow-hidden group shadow-lg hover:shadow-emerald-500/10 transition-shadow">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Award className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${myProfile.avatarSeed}`} alt={myProfile.name} className="w-full h-full" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white tracking-tight">{myProfile.name}</h4>
                                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{myProfile.role} @ {myProfile.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {myProfile.skills.map(s => (
                                            <span key={s} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-bold text-gray-400 uppercase tracking-wider">#{s}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${myProfile.available ? 'bg-emerald-500 animate-pulse' : 'bg-gray-700'}`}></div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{myProfile.available ? 'Ready for Deployment' : 'Offline'}</span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setEditProfileData({...myProfile});
                                                setIsEditingMyProfile(true);
                                            }}
                                            className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                                        >
                                            Edit Identity
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-6 rounded-[24px] border border-emerald-500/30 bg-emerald-500/[0.02]"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[2px] ml-1">Architect Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/40" />
                                                <input 
                                                    value={editProfileData.name}
                                                    onChange={e => setEditProfileData(prev => ({...prev, name: e.target.value}))}
                                                    className="w-full h-11 bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5 flex flex-col">
                                                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[2px] ml-1">Current Role</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/40" />
                                                    <input 
                                                        value={editProfileData.role}
                                                        onChange={e => setEditProfileData(prev => ({...prev, role: e.target.value}))}
                                                        className="w-full h-11 bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 flex flex-col">
                                                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[2px] ml-1">Empire/Company</label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/40" />
                                                    <input 
                                                        value={editProfileData.company}
                                                        onChange={e => setEditProfileData(prev => ({...prev, company: e.target.value}))}
                                                        className="w-full h-11 bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[2px] ml-1">Superpowers (Skills)</label>
                                            <input 
                                                value={editProfileData.skills.join(', ')}
                                                onChange={e => setEditProfileData(prev => ({...prev, skills: e.target.value.split(',').map(s => s.trim())}))}
                                                placeholder="Pitching, PMF, Scale..."
                                                className="w-full h-11 bg-black/40 border border-white/5 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className={`w-4 h-4 ${editProfileData.available ? 'text-emerald-500' : 'text-gray-600'}`} />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Availability</span>
                                            </div>
                                            <button 
                                                onClick={() => setEditProfileData(prev => ({...prev, available: !prev.available}))}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${editProfileData.available ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${editProfileData.available ? 'left-6' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button 
                                                onClick={() => setIsEditingMyProfile(false)}
                                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all"
                                            >
                                                Abort
                                            </button>
                                            <button 
                                                onClick={handleSaveProfile}
                                                className="flex-1 py-3 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
                                            >
                                                Save Identity
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            {/* Potential Stats or More info about profile completeness */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                                <div className="glass-card p-8 rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[80px] -mr-16 -mt-16"></div>
                                     <Activity className="w-10 h-10 text-purple-400 mb-4 opacity-50" />
                                     <h3 className="text-xl font-bold text-white mb-2">Architect Engagement</h3>
                                     <p className="text-xs text-gray-500 max-w-[200px]">Keep your profile sharp to appear in high-value venture recommendations.</p>
                                     <div className="mt-8 flex items-end gap-3 h-16">
                                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                            <div key={i} className="w-2 bg-emerald-500/20 rounded-full relative">
                                                <div className="absolute bottom-0 w-full bg-emerald-500 rounded-full" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                                <div className="glass-card p-8 rounded-[32px] border border-white/10 flex flex-col p-8 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent shadow-xl">
                                     <div className="flex items-center gap-2 mb-6">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Elite Status</span>
                                     </div>
                                     <h3 className="text-2xl font-black text-white tracking-tighter mb-2">Top 5% Advisor</h3>
                                     <p className="text-xs text-gray-500 leading-relaxed font-medium">Your tactical insights have unlocked over $2.4M in potential venture value this month.</p>
                                     <div className="mt-auto pt-8 flex items-center justify-between">
                                        <span className="text-sm font-bold text-white">Lvl. 42</span>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f] bg-white/10 flex items-center justify-center overflow-hidden"><img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Expert${i}`} className="w-full h-full" /></div>)}
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedMentor && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl cursor-pointer"
                        onClick={() => setSelectedMentor(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl max-h-[90vh] bg-[#05050a] border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row cursor-default relative shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
                        >
                            {/* Close Button Mobile */}
                            <button 
                                onClick={() => setSelectedMentor(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-[160] md:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Left Side: Mentor Info */}
                            <div className="w-full md:w-[35%] bg-[#08080c] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center text-center overflow-y-auto no-scrollbar max-h-[35vh] md:max-h-none">
                                <div className="relative mb-6 group">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] overflow-hidden border-2 border-white/10 relative z-10 shadow-2xl shadow-emerald-500/20">
                                        <img 
                                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedMentor.avatarSeed}`} 
                                            alt={selectedMentor.name} 
                                            className="w-full h-full bg-[#0f0f14] object-cover" 
                                        />
                                    </div>
                                    {selectedMentor.available && (
                                        <div className="absolute -bottom-1 -right-1 px-3 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full border-2 border-[#08080c] animate-pulse z-20">
                                            Active
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tighter leading-tight">{selectedMentor.name}</h3>
                                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[2px] mb-6 opacity-80">{selectedMentor.role} @ {selectedMentor.company}</p>
                                
                                <div className="w-full space-y-4 text-left">
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full -mr-8 -mt-8"></div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[1px]">The Thesis</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium italic">
                                            "{selectedMentor.bio}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedMentor.skills.map(skill => (
                                            <span key={skill} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                #{skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Booking Flow */}
                            <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto no-scrollbar">
                                <AnimatePresence mode="wait">
                                    {!bookingSuccess ? (
                                        <motion.div 
                                            key="booking-form"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Schedule Execution</h4>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[1.5px] mt-0.5">Select your deployment window</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedMentor(null)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all md:hidden"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                <Calendar20 
                                                    rate={selectedMentor.rate}
                                                    isBooking={isBooking}
                                                    onConfirm={handleConfirmBooking}
                                                    selectedDate={selectedDateObject}
                                                    selectedTime={selectedTime}
                                                    onDateChange={setSelectedDateObject}
                                                    onTimeChange={setSelectedTime}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="booking-success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center h-full text-center space-y-8"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                                <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center relative z-10">
                                                    <Check className="w-12 h-12 text-black stroke-[4px]" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Strategic Link Established</h4>
                                                <p className="text-gray-500 text-[11px] max-w-[280px] mx-auto leading-relaxed">
                                                    Your session with <span className="text-emerald-400 font-bold">{selectedMentor.name}</span> is confirmed. Check your calendar for the meeting invite.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Phase</span>
                                                    <span className="text-xs font-bold text-white uppercase">{selectedDateObject?.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Window</span>
                                                    <span className="text-xs font-bold text-white uppercase">{selectedTime}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setSelectedMentor(null)}
                                                className="w-full max-w-sm py-4 rounded-xl bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] hover:bg-emerald-400 transition-all"
                                            >
                                                Back to Arena
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {feedbackMentor && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl cursor-pointer"
                        onClick={() => setFeedbackMentor(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[32px] sm:rounded-[48px] overflow-hidden flex flex-col cursor-default shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
                        >
                            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-emerald-500/20 mb-6">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${feedbackMentor.avatarSeed}`} alt={feedbackMentor.name} className="w-full h-full bg-white/5" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Rate your session</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[3px] mb-10">with {feedbackMentor.name}</p>

                                <div className="flex gap-3 mb-10">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-all active:scale-90"
                                        >
                                            <Star 
                                                className={`w-10 h-10 ${rating >= star ? 'text-emerald-400 fill-emerald-400' : 'text-gray-700 hover:text-gray-500'}`} 
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="w-full space-y-6">
                                    <div className="text-left">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px] block mb-4">Your Feedback</label>
                                        <textarea 
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="What did you learn? How can they improve?"
                                            className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setFeedbackMentor(null)}
                                            className="flex-1 py-5 rounded-2xl bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Skip
                                        </button>
                                        <button 
                                            onClick={handleSubmitFeedback}
                                            disabled={isSubmittingFeedback || rating === 0}
                                            className={`flex-[2] py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${rating === 0 || isSubmittingFeedback ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-95'}`}
                                        >
                                            {isSubmittingFeedback ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NeuralChatWorkspace: React.FC<{ isOpen: boolean; onClose: () => void; roadmap: StartupRoadmap | null; activeTab: Tab; onTabChange: (tab: Tab) => void; onGenerateRoadmap?: (idea: string) => void }> = ({ isOpen, onClose, roadmap, activeTab, onTabChange, onGenerateRoadmap }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);
    const [systemInstruction, setSystemInstruction] = useState('');
    
    // Sessions
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Sync messages to sessions
    useEffect(() => {
        if (messages.length === 0) return;
        
        setSessions(prev => {
            if (!currentSessionId) {
                const newId = Date.now().toString();
                setCurrentSessionId(newId);
                return [{ id: newId, timestamp: Date.now(), title: messages[0].text, messages }, ...prev];
            }
            return prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
        });
    }, [messages, currentSessionId]);

    const createNewSession = () => {
        setCurrentSessionId(null);
        setMessages([]);
    };

    const loadSession = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(session.id);
            setMessages(session.messages);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!text || isTyping) return;
        
        const userMessage: ChatMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        
        try {
            const response = await chatWithMitra(text, roadmap, messages, {
                temperature,
                maxTokens,
                systemInstruction: systemInstruction.trim() !== '' ? systemInstruction : undefined
            });
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I hit a snag. Can you repeat that?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col overflow-hidden"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
            <div className="absolute inset-0 z-0 pointer-events-none" style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%)'
            }}></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 to-transparent blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/10 to-transparent blur-[120px] pointer-events-none z-0"></div>

            <div className="flex w-full h-full relative z-10">
                {/* Left Sidebar */}
                <div className={`fixed md:relative z-50 shrink-0 border-r border-white/5 bg-[#050505] flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-[72px] -translate-x-full md:translate-x-0'}`}>
                   <div className={`flex items-center ${isSidebarOpen ? 'justify-end px-4' : 'justify-center'} py-6`}>
                     {isSidebarOpen ? (
                       <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2">
                         Minimize <ArrowLeft className="w-3 h-3" />
                       </button>
                     ) : (
                       <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white p-2 text-[10px] bg-white/5 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center">
                         <Menu className="w-4 h-4" />
                       </button>
                     )}
                   </div>

                   <div className={`flex flex-col gap-2 w-full mt-4 flex-1 overflow-y-auto no-scrollbar ${isSidebarOpen ? 'px-3' : 'px-2 items-center'}`}>
                      <button 
                        onClick={createNewSession}
                        className={`w-full flex items-center ${isSidebarOpen ? 'px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10' : 'p-2.5 rounded-xl justify-center hover:bg-white/5'} text-white text-sm font-medium transition-all font-['Plus_Jakarta_Sans'] gap-2`}
                        title="New Chat"
                      >
                         {isSidebarOpen ? <><Plus className="w-4 h-4 text-cyan-400" /> New Chat</> : <Plus className="w-5 h-5 text-cyan-400" />}
                      </button>

                      {isSidebarOpen && (
                        <>
                          <div className="relative mt-2 mb-2 group">
                             <input 
                               value={sidebarSearchQuery}
                               onChange={(e) => setSidebarSearchQuery(e.target.value)}
                               placeholder="Search history..."
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                             />
                             <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500 group-focus-within:text-cyan-400" />
                          </div>

                          <div className="mt-2 mb-1 px-1">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Previous Chats</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             {sessions.filter(s => s.title.toLowerCase().includes(sidebarSearchQuery.toLowerCase())).map(session => (
                               <button 
                                 key={session.id}
                                 onClick={() => loadSession(session.id)}
                                 className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${currentSessionId === session.id ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-gray-300 hover:bg-white/5'}`}
                               >
                                  {session.title || 'New Chat'}
                               </button>
                             ))}
                             {sessions.length === 0 && (
                                <p className="px-3 py-2 text-xs text-gray-600 font-medium italic">No previous chats.</p>
                             )}
                          </div>
                        </>
                      )}
                   </div>

                   <div className={`mt-auto w-full mb-6 pt-4 border-t border-white/5 flex flex-col gap-1 ${isSidebarOpen ? 'px-4' : 'px-2 items-center'}`}>
                      <button 
                        onClick={() => setIsSettingsModalOpen(true)}
                        className={`w-full flex items-center ${isSidebarOpen ? 'px-3 py-2.5 rounded-xl text-left' : 'p-2.5 rounded-xl justify-center'} text-gray-400 hover:text-white text-sm font-medium hover:bg-white/10 transition-all font-['Plus_Jakarta_Sans'] gap-3`}
                        title="Settings"
                      >
                         <Settings2 className="w-5 h-5 shrink-0" />
                         {isSidebarOpen && <span>Settings</span>}
                      </button>
                      <button 
                        className={`w-full flex items-center ${isSidebarOpen ? 'px-3 py-2.5 rounded-xl text-left' : 'p-2.5 rounded-xl justify-center'} text-gray-400 hover:text-white text-sm font-medium hover:bg-white/10 transition-all font-['Plus_Jakarta_Sans'] gap-3`}
                        title="Account"
                      >
                         <User className="w-5 h-5 shrink-0" />
                         {isSidebarOpen && <span>Account</span>}
                      </button>
                   </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02] relative z-10">
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 group p-2 hover:bg-white/5 rounded-full transition-colors md:w-32"
                >
                    <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                </button>
                
                <div className="flex flex-col items-center flex-1">
                    <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        Startup Mitra AI
                    </h1>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Strategic Advisor</span>
                </div>

                <div className="md:w-32 flex justify-end">
                    <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                        <Settings2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar" ref={scrollRef}>
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                                <Brain className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Refine Your Vision</h2>
                            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                                I'm Startup Mitra, your personal Venture Architect. Tell me about your ideas, challenges, or let's brainstorm strategies to gain an unfair advantage.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/10 border-white/20' : 'bg-cyan-500/20 border-cyan-500/30'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-white/[0.03] border border-white/5 text-gray-300 rounded-tl-sm markdown-body'}`}>
                                        {msg.role === 'user' ? (
                                            <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                                        ) : (
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                    
                    {isTyping && (
                        <div className="flex justify-start w-full">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border bg-cyan-500/20 border-cyan-500/30">
                                    <Bot className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 rounded-tl-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-[#0a0a0f] border-t border-white/5 relative z-20">
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    {!roadmap && messages.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => onGenerateRoadmap?.(messages.filter(m => m.role === 'user').map(m => m.text).join(' '))}
                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] font-bold text-[10px] uppercase tracking-widest transition-all"
                            >
                                ✨ Generate Roadmap from chat
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="relative">
                        <input 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask Mitra about growth, product strategy, or unit economics..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            className={`absolute right-2 top-2 p-2.5 rounded-xl transition-all ${
                                !inputValue.trim() || isTyping 
                                ? 'bg-white/5 text-gray-600' 
                                : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            }`}
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
            </div>
            </div>

            <AnimatePresence>
                {isSettingsModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsSettingsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-cyan-400" />
                                    AI Settings
                                </h3>
                                <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex justify-between text-sm font-medium text-gray-300">
                                        <span>Temperature</span>
                                        <span className="text-cyan-400">{temperature.toFixed(2)}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" max="1" step="0.05"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500"
                                    />
                                    <p className="text-xs text-gray-500">Higher values make output more creative, lower makes it more deterministic.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Max Tokens (Optional)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 2048"
                                        value={maxTokens || ''}
                                        onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                    />
                                    <p className="text-xs text-gray-500">Leave blank for default. Limits the length of the AI's response.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">System Instructions</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Customize how Startup Mitra responds..."
                                        value={systemInstruction}
                                        onChange={(e) => setSystemInstruction(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                                    />
                                    <p className="text-xs text-gray-500">Override the default system prompt to change the persona or instructions.</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setIsSettingsModalOpen(false)}
                                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors"
                            >
                                Save Settings
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const RoadmapSectionCard: React.FC<{ title: string; section: RoadmapSection }> = React.memo(({ title, section }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(section.howTo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-card rounded-[24px] border border-white/10 transition-all duration-500 group will-change-transform ${isExpanded ? 'bg-white/5 ring-1 ring-purple-500/30' : 'hover:border-purple-500/30 hover:-translate-y-1'}`}>
      <div className="p-6 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start gap-4">
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className={`text-base font-bold text-white transition-colors capitalize ${isExpanded ? 'text-purple-300' : 'group-hover:text-purple-300'}`}>{title}</h4>
              </div>
              <p className={`text-xs text-gray-300 leading-relaxed transition-all duration-300 ${isExpanded ? 'opacity-90' : 'line-clamp-2'}`}>{section.description}</p>
           </div>
           <button className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 border border-white/5 ${isExpanded ? 'rotate-180 bg-purple-500/20 text-purple-300 border-purple-500/30' : 'text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0 space-y-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="bg-[#0a0a0a]/40 rounded-xl p-4 border border-white/5 relative group/code">
                <div className="flex justify-between items-center mb-3">
                   <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>Tactical Execution</p>
                   <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-all border border-white/5 group-hover/code:opacity-100 opacity-60">
                     {copied ? <><svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg><span className="text-[9px] font-bold text-emerald-400">Copied</span></> : <><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg><span className="text-[9px] font-bold text-gray-400">Copy</span></>}
                   </button>
                </div>
                <p className="text-[12px] text-gray-200 leading-relaxed whitespace-pre-wrap font-mono tracking-tight">{section.howTo}</p>
            </div>
            <div className="pl-2 border-l-2 border-purple-500/30">
                 <p className="text-[11px] text-purple-200/80 italic leading-relaxed"><span className="font-bold not-italic text-purple-400 text-[10px] uppercase tracking-wider block mb-1">Why This Matters</span>"{section.whyItMatters}"</p>
            </div>
        </div>
      </div>
    </div>
  );
});

const MitraScreen: React.FC<{ roadmap: StartupRoadmap; onBack: () => void; onError: (msg: string) => void }> = ({ roadmap, onBack, onError }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const text = textOverride || inputValue.trim();
    if (!text || isTyping) return;
    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    try {
      const response = await chatWithMitra(text, roadmap, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      onError(err.message || "I'm sorry, I hit a snag. Can you repeat that?");
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, roadmap, messages, onError]);

  const handleExportMarkdown = useCallback(() => {
    let content = `# SPIKE Venture Architect Brief\n\n## Executive Summary\n${roadmap.overview}\n\n## Execution Blueprints\n\n`;
    Object.values(roadmap.sections).forEach((sec: any) => {
      content += `### ${sec.title}\n> ${sec.description}\n\n**Tactical Execution:** ${sec.howTo}\n\n*Why it matters:* ${sec.whyItMatters}\n\n---\n\n`;
    });
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spike_roadmap_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [roadmap]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const sectionKeys: (keyof typeof roadmap.sections)[] = [
    'problemValidation',
    'targetUserClarity',
    'solutionBreakdown',
    'mvpScope',
    'goToMarket',
    'monetization',
    'toolsAndPlatforms',
    'beginnerMistakes'
  ];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-transparent animate-in fade-in zoom-in-[0.98] duration-1000">
      <style>{`@media print { @page { margin: 1cm; size: auto; } body { background: #000 !important; color: #000; -webkit-print-color-adjust: exact; } .no-print { display: none !important; } #root, .global-bg { position: static !important; overflow: visible !important; height: auto !important; } #print-area { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; margin: 0 !important; padding: 0 !important; } .glass-card { background: #fff !important; border: 1px solid #ccc !important; color: #000 !important; box-shadow: none !important; break-inside: avoid; margin-bottom: 20px; } h1, h2, h3, h4, h5, p, span { color: #000 !important; text-shadow: none !important; } .text-gray-200, .text-gray-300, .text-gray-400 { color: #333 !important; } .text-white { color: #000 !important; } svg { color: #000 !important; } }`}</style>
      <nav className="p-5 border-b border-white/10 flex items-center justify-between bg-transparent backdrop-blur-md z-30 no-print">
        <div className="flex items-center space-x-4">
           <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-all hover:bg-white/10 group"><svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"><span className="text-xs font-black text-purple-300">SM</span></div>
              <div><h3 className="text-sm font-bold text-white animate-text-glow">Startup Mitra AI</h3><span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>Architect Mode</span></div>
            </div>
        </div>
        <div className="flex items-center space-x-3">
           <button onClick={handleExportMarkdown} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white" title="Download Markdown"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span className="hidden md:inline">MD</span></button>
           <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white" title="Print / Save PDF"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg><span className="hidden md:inline">PDF</span></button>
        </div>
      </nav>
      <div className="flex-grow flex relative overflow-hidden bg-transparent">
        <main className="flex-grow flex flex-col h-full relative z-10 bg-transparent">
          <div ref={scrollRef} id="print-area" className="flex-grow overflow-y-auto px-6 py-10 space-y-12 scroll-smooth no-scrollbar bg-transparent pb-32">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40"><svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" /></svg></div>
                  <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">Venture Architect Brief</h2>
                </div>
                <div className="glass-card p-8 rounded-[32px] border border-white/10 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-8 opacity-10 no-print"><svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div>
                  <h3 className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">Executive Summary</h3>
                  <div className="text-sm text-gray-200 leading-relaxed font-mono relative z-10 markdown-body">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          if (!inline && match && match[1] === 'mermaid') {
                            return <Mermaid chart={String(children).replace(/\n$/, '')} />
                          }
                          return <code className={className} {...props}>{children}</code>
                        }
                      }}
                    >
                      {roadmap.overview}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 <div className="flex items-center gap-3 mb-8"><div className="h-[1px] flex-grow bg-white/10"></div><span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Execution Blueprints</span><div className="h-[1px] flex-grow bg-white/10"></div></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {sectionKeys.map((key) => {
                        const section = roadmap.sections[key];
                        return <RoadmapSectionCard key={key} title={section.title} section={section} />
                    })}
                 </div>
              </div>
              <div className="space-y-8 pb-8 no-print">
                 <div className="flex items-center gap-3 mb-2 opacity-50"><div className="h-[1px] flex-grow bg-white/10"></div><span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Architect Channel</span><div className="h-[1px] flex-grow bg-white/10"></div></div>
                 {messages.length === 0 && (
                   <div className="text-center py-8 opacity-60">
                      <p className="text-xs text-gray-400 font-mono">Ready for tactical execution instructions.</p>
                      <div className="flex flex-wrap justify-center gap-3 mt-4">{['Deep dive on Step 1', 'How to get 10 users?', 'Low-code tools?'].map(q => (<button key={q} onClick={() => { setInputValue(q); }} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">{q}</button>))}</div>
                   </div>
                 )}
                 {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                      <div className={`max-w-[85%] p-6 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600/90 text-white rounded-tr-none border border-white/10 shadow-lg' : 'glass-card text-gray-100 rounded-tl-none border border-white/5 shadow-md'} transition-all font-mono text-sm`}>
                        <div className="leading-relaxed markdown-body">
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                if (!inline && match && match[1] === 'mermaid') {
                                  return <Mermaid chart={String(children).replace(/\n$/, '')} />
                                }
                                return <code className={className} {...props}>{children}</code>
                              }
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && <div className="flex justify-start"><div className="glass-card p-5 rounded-3xl rounded-tl-none flex space-x-2 items-center"><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>}
              </div>
            </div>
          </div>
          <div className="p-8 pb-28 bg-transparent backdrop-blur-sm no-print">
            <div className="max-w-4xl mx-auto relative group">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                 <textarea ref={textareaRef} rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} placeholder={isListening ? "Listening..." : "Ask Startup Mitra..."} className={`w-full pl-8 pr-32 py-5 glass-input rounded-[32px] outline-none focus:ring-4 ring-indigo-500/20 text-base text-white premium-input transition-all resize-none overflow-hidden no-scrollbar ${isListening ? 'border-purple-500/50' : ''}`} style={{ minHeight: '64px' }} />
                 <div className="absolute right-4 top-1/2 -translate-x-1/2 flex items-center space-x-3">
                   <button type="button" onClick={toggleListening} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 z-10 ${isListening ? 'bg-rose-600 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
                   <button type="submit" disabled={isTyping || !inputValue.trim()} className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 disabled:grayscale z-10"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                 </div>
              </form>
            </div>
            <p className="text-[9px] text-gray-500 text-center mt-5 uppercase tracking-[0.4em] font-black opacity-50 drop-shadow-sm">Execution over everything • Powered by Startup Mitra AI</p>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- App Component ---

const MASTERCLASSES = [
    { title: "Mastering Product-Market Fit", expert: "Kunal Shah", role: "Founder, CRED", watchers: '1.4K' }, 
    { title: "Zero to One: The First 100 Users", expert: "Nithin Kamath", role: "Founder, Zerodha", watchers: '2.1K' }, 
    { title: "The Art of Fundraising", expert: "Naval Ravikant", role: "AngelList", watchers: '850' }, 
    { title: "Viral Growth Loops", expert: "Brian Chesky", role: "CEO, Airbnb", watchers: '1.2K' },
    { title: "Scaling Global Ops", expert: "Ritesh Agarwal", role: "Founder, OYO", watchers: '3.4K' },
    { title: "The Future of Mobility", expert: "Bhavish Aggarwal", role: "Founder, Ola", watchers: '2.8K' },
    { title: "Mastering Hyper-Local Logistics", expert: "Deepinder Goyal", role: "Founder, Zomato", watchers: '4.2K' },
    { title: "The Seed Stage Playbook", expert: "Garry Tan", role: "Y Combinator", watchers: '5.1K' }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [footerMode, setFooterMode] = useState<'main' | 'network' | 'team_context'>('main');
  const [teamContextTab, setTeamContextTab] = useState<'overview' | 'team' | 'tasks' | 'chat' | 'settings'>('overview');
  const [networkSubTab, setNetworkSubTab] = useState<'co-founder' | 'tribes' | 'my-team' | 'venture-bridge'>('co-founder');
  const [initialIdea, setInitialIdea] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Architecting...');
  const [roadmap, setRoadmap] = useState<StartupRoadmap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<{idea: string, roadmap: StartupRoadmap, timestamp: number}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelloBubble, setShowHelloBubble] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let lastKnownScrollY = 0;
    let ticking = false;

    const handleScroll = (e: any) => {
      lastKnownScrollY = e.target === document ? window.scrollY : e.target.scrollTop;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = lastKnownScrollY - lastScrollY.current;
          
          if (Math.abs(delta) > 5) {
            if (delta > 0 && lastKnownScrollY > 100) {
              setIsNavVisible(false);
            } else {
              setIsNavVisible(true);
            }
            lastScrollY.current = lastKnownScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 60) {
        setIsNavVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Reset navigation visibility when switching major views to ensure user can always find their way
  useEffect(() => {
    setIsNavVisible(true);
    lastScrollY.current = 0;
  }, [activeTab, appState]);

  const handleSplineLoad = async () => {
    setShowHelloBubble(true);
    setTimeout(() => setShowHelloBubble(false), 5000);
  };

  const [joinedTribes, setJoinedTribes] = useState<string[]>(['t1', 't2']);
  const [acceptedMissions, setAcceptedMissions] = useState<string[]>([]);
  const [requestedIntros, setRequestedIntros] = useState<string[]>([]);
  const [theme] = useState<AppTheme>({ accent: 'cyan-purple', pattern: 'noise', glowIntensity: 0.8 });

  const [lightingMode, setLightingMode] = useState<'home' | 'masterclass' | 'rewards' | 'fame' | 'mentor' | 'bridge'>('home');
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const prizesCarouselRef = useRef<HTMLDivElement>(null);
  const fameCarouselRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prizesScrollProgress, setPrizesScrollProgress] = useState(0);
  const [fameScrollProgress, setFameScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollPrizesLeft, setCanScrollPrizesLeft] = useState(false);
  const [canScrollPrizesRight, setCanScrollPrizesRight] = useState(true);

  const handleFameScroll = () => {
    if (fameCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = fameCarouselRef.current;
      const progress = scrollWidth > clientWidth ? (scrollLeft / (scrollWidth - clientWidth)) * 100 : 0;
      setFameScrollProgress(progress);
    }
  };

  const filteredHistory = history.filter(h => h.idea.toLowerCase().includes(historySearchQuery.toLowerCase()));
  const loadingMessages = ["Identifying Tier-1 Pain Points...", "Profiling High-Expectation Customers...", "Stripping non-essential features...", "Calculating Unit Economics...", "Optimizing Growth Loops...", "Defining the Magic Moment...", "Mapping No-Code Tech Stacks...", "Predicting Early Pitfalls...", "Hardening the MVP Scope..."];
  
  const hallOfFameStartups = [
    {
      name: 'Unintern.ai',
      category: 'BEST STARTUP OF THE WEEK',
      founder: 'Rohan Singh',
      stage: 'Pre-Seed',
      desc: 'AI Knowledge Automation',
      icon: <BrainCircuit className="w-10 h-10 text-cyan-400" style={{ filter: 'brightness(1.2)' }} />,
      stats: [
        { label: 'Users', value: '8,000', icon: <Users className="w-3 h-3 text-cyan-400" /> },
        { label: 'Revenue', value: '$3k/month', icon: <DollarSign className="w-3 h-3 text-green-400" /> }
      ]
    },
    {
      name: 'Arena',
      category: 'BEST SKILL PERSON OF THE WEEK',
      founder: 'Aarav Mehta',
      stage: 'Seed',
      desc: 'Competitive AI Programming',
      icon: <Swords className="w-10 h-10 text-cyan-400" style={{ filter: 'brightness(1.2)' }} />,
      stats: [
        { label: 'Users', value: '15,000', icon: <Users className="w-3 h-3 text-cyan-400" /> },
        { label: 'Revenue', value: '$12k/month', icon: <DollarSign className="w-3 h-3 text-green-400" /> }
      ]
    },
    {
      name: 'YouthStartup',
      category: 'BEST ENTREPRENEUR OF THE WEEK',
      founder: 'Community',
      stage: 'Early Growth',
      desc: 'Young Founder Media',
      icon: <Rocket className="w-10 h-10 text-purple-500" style={{ filter: 'brightness(1.2)' }} />,
      stats: [
        { label: 'Users', value: '50,000', icon: <Users className="w-3 h-3 text-cyan-400" /> },
        { label: 'Revenue', value: '$25k/month', icon: <DollarSign className="w-3 h-3 text-green-400" /> }
      ]
    },
    {
      name: 'Spike Nexus',
      category: 'BEST EXECUTIONER OF THE WEEK',
      founder: 'Spike Team',
      stage: 'Alpha',
      desc: 'Low-latency GTM Strategy',
      icon: <Zap className="w-10 h-10 text-yellow-400" style={{ filter: 'brightness(1.2)' }} />,
      stats: [
        { label: 'Users', value: '500+', icon: <Users className="w-3 h-3 text-cyan-400" /> },
        { label: 'Revenue', value: 'Beta Testing', icon: <DollarSign className="w-3 h-3 text-green-400" /> }
      ]
    }
  ];

  const [fameIndex, setFameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFameIndex((prev) => (prev + 1) % hallOfFameStartups.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const wallOfFameData = [{ category: "THE LEADER", title: "Best Entrepreneur of the Week", name: "Dev Patel", quote: "Scaled to $10k MRR in 4 weeks.", seed: "Dev" }, { category: "THE MAKER", title: "Best Skill Person", name: "Ananya S.", quote: "Built custom LLM agent in 2 days.", seed: "Ananya" }, { category: "THE NINJA", title: "Execution Ninja", name: "Rahul M.", quote: "Shipped 15 features in 1 week.", seed: "Rahul" }, { category: "THE VISIONARY", title: "Venture Visionary", name: "Sanya K.", quote: "Pivot led to 500% growth.", seed: "Sanya" }];

  const handleScrollProgress = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < (scrollWidth - clientWidth - 10));
    }
  };

  const handlePrizesScrollProgress = () => {
    if (prizesCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = prizesCarouselRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setPrizesScrollProgress(progress);
      setCanScrollPrizesLeft(scrollLeft > 10);
      setCanScrollPrizesRight(scrollLeft < (scrollWidth - clientWidth - 10));
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollPrizesCarousel = (direction: 'left' | 'right') => {
    if (prizesCarouselRef.current) {
      const { clientWidth } = prizesCarouselRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      prizesCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => { let interval: number; if (loading) { let index = 0; interval = window.setInterval(() => { setLoadingMessage(loadingMessages[index]); index = (index + 1) % loadingMessages.length; }, 2000); } return () => window.clearInterval(interval); }, [loading]);
  useEffect(() => { const saved = localStorage.getItem('spike_roadmap_history'); if (saved) { try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); } } const hasOnboarded = localStorage.getItem('spike_has_onboarded_v1'); if (!hasOnboarded) { setShowOnboarding(true); } }, []);
  useEffect(() => { 
      if (activeTab === 'mentor') {
          setLightingMode('mentor');
          return;
      }
      if (appState !== AppState.HOME || activeTab !== 'home') return; 

      const observerOptions = {
        threshold: 0.4
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'section-rewards') setLightingMode('rewards');
            else if (id === 'section-wall-of-fame') setLightingMode('fame');
            else if (id === 'section-masterclass') setLightingMode('masterclass');
            else if (id === 'section-home') setLightingMode('home');
          }
        });
      }, observerOptions);

      const sections = ['section-home', 'section-masterclass', 'section-rewards', 'section-wall-of-fame'];
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
  }, [appState, activeTab]);

  const saveToHistory = useCallback((idea: string, roadmap: StartupRoadmap) => { const newItem = { idea, roadmap, timestamp: Date.now() }; setHistory(prev => { const updated = [newItem, ...prev.filter(h => h.idea !== idea)].slice(0, 50); localStorage.setItem('spike_roadmap_history', JSON.stringify(updated)); return updated; }); }, []);
  const handleArchitect = async (e?: React.FormEvent, text?: string) => { e?.preventDefault(); const trimmedIdea = (text || initialIdea).trim(); if (!trimmedIdea || loading) return; setLoading(true); setLoadingMessage(loadingMessages[0]); setError(null); try { const result = await generateRoadmap(trimmedIdea); if (!result || !result.sections) throw new Error("Could not generate roadmap."); setRoadmap(result); saveToHistory(trimmedIdea, result); setAppState(AppState.MITRA); } catch (err: any) { setError(err.message || "Snag detected. Try again."); } finally { setLoading(false); } };
  const loadFromHistory = (item: any) => { setInitialIdea(item.idea); setRoadmap(item.roadmap); setAppState(AppState.MITRA); setActiveTab('home'); };
  const clearHistory = useCallback(() => {
    if (window.confirm("Purge build archive? This action cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem('spike_roadmap_history');
      toast.success("Build Archive Purged");
    }
  }, []);
  
  const renderContent = () => {
    const accent = ACCENT_COLORS.find(c => c.id === theme.accent) || ACCENT_COLORS[0];
    if (activeTab === 'history') return <HistoryWorkspace history={history} onLoadHistory={loadFromHistory} onClearHistory={clearHistory} onClose={() => setActiveTab('home')} />;
    if (activeTab === 'profile') return <ProfilePage />;
    if (activeTab === 'network') return (
      <NetworkScreen 
        setAtmosphere={setLightingMode} 
        onSuccess={setSuccess}
        joinedTribes={joinedTribes}
        setJoinedTribes={setJoinedTribes}
        requestedIntros={requestedIntros}
        setRequestedIntros={setRequestedIntros}
        subTab={networkSubTab}
        onSubTabChange={setNetworkSubTab}
        footerMode={footerMode}
        onFooterModeChange={setFooterMode}
        teamContextTab={teamContextTab}
      />
    );
    if (activeTab === 'challenges') return (
      <ChallengesScreen 
        acceptedMissions={acceptedMissions}
        setAcceptedMissions={setAcceptedMissions}
      />
    );
    if (activeTab === 'mentor') return <MentorScreen />;
    if (activeTab === 'home') {
      if (appState === AppState.MITRA && roadmap) return <MitraScreen roadmap={roadmap} onBack={() => setAppState(AppState.HOME)} onError={(msg) => setError(msg)} />;
      return (
        <div className="flex-grow flex flex-col items-center justify-start p-6 relative z-10 pt-[100px] bg-transparent pb-32 scroll-smooth">
          <style>{`
            ${FONT_IMPORT}
            html { scroll-behavior: smooth; scroll-padding-top: 80px; }
            .premium-scrollbar::-webkit-scrollbar { height: 4px; } .premium-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; } .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 4px; } .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.6); } 
            
            .obsidian-gold-card {
                background: rgba(10, 10, 15, 0.65) !important;
                backdrop-filter: blur(50px) !important;
                -webkit-backdrop-filter: blur(50px) !important;
                border-radius: 32px;
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(253, 185, 49, 0.3) !important;
                box-shadow: 0 0 20px rgba(253, 185, 49, 0.15);
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
            }
            .obsidian-gold-card:hover {
                border-color: #FDB931 !important;
                box-shadow: 0 0 35px rgba(253, 185, 49, 0.3);
                transform: scale(1.03) translateY(-4px);
            }

            @keyframes light-streak-vertical {
              0% { transform: translateY(-100%) rotate(25deg); opacity: 0; }
              20% { opacity: 0.5; }
              80% { opacity: 0.5; }
              100% { transform: translateY(100%) rotate(25deg); opacity: 0; }
            }
            .light-streak {
              position: absolute;
              top: 0; left: -50%; width: 200%; height: 60px;
              background: linear-gradient(to bottom, transparent, rgba(253, 185, 49, 0.25), transparent);
              pointer-events: none;
              z-index: 5;
              opacity: 0;
            }
            .obsidian-gold-card:hover .light-streak {
              animation: light-streak-vertical 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes badge-shimmer {
              0% { transform: translateX(-100%) rotate(45deg); }
              100% { transform: translateX(300%) rotate(45deg); }
            }
            .cyber-badge-shimmer {
              position: absolute;
              top: 0; left: 0; width: 40px; height: 100%;
              background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
              animation: badge-shimmer 3s infinite ease-in-out;
              pointer-events: none;
            }

            @keyframes dot-pulse-micro {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .neon-dot-pulse {
              animation: dot-pulse-micro 1s ease-in-out infinite;
            }

            @keyframes dot-fade {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; }
            }
            @keyframes rotate-borealis {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes aura-pulse {
              0%, 100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
              50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); }
            }
            .ai-aura-glow {
              animation: aura-pulse 4s ease-in-out infinite;
              border-radius: 9999px;
            }
            .minimal-active-dot {
              animation: dot-fade 4s ease-in-out infinite;
            }

            @keyframes breathe {
              0%, 100% { transform: scale(1); opacity: 0.2; }
              50% { transform: scale(1.1); opacity: 0.4; }
            }
            .animate-breathe {
              animation: breathe 10s infinite ease-in-out;
            }

            @keyframes row-glow-pulse {
              0%, 100% { opacity: 0.1; transform: scale(1); }
              50% { opacity: 0.3; transform: scale(1.2); }
            }
            .animate-row-glow {
              animation: row-glow-pulse 8s ease-in-out infinite;
            }

            @keyframes live-pulse {
              0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
              50% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
            }
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.7; }
            }
            .animate-live-pulse {
              animation: live-pulse 1.5s ease-in-out infinite;
            }
            .animate-heartbeat {
              animation: heartbeat 1s ease-in-out infinite;
            }

            @keyframes radar-ripple {
              0% { transform: scale(1); opacity: 0.8; border-width: 1px; }
              100% { transform: scale(1.4); opacity: 0; border-width: 0.5px; }
            }
            .radar-signal {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              height: 100%;
              border-radius: 9999px;
              border: 1px solid #EF4444;
              pointer-events: none;
              z-index: -1;
            }
            .radar-signal-1 { animation: radar-ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
            .radar-signal-2 { animation: radar-ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.6s; }
            .radar-signal-3 { animation: radar-ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite 1.2s; }

            .borealis-input {
                background: rgba(255, 255, 255, 0.01) !important;
                backdrop-filter: blur(40px) !important;
                -webkit-backdrop-filter: blur(40px) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.03) !important;
            }
            .borealis-input::placeholder {
                color: rgba(230, 230, 255, 0.7) !important; 
                text-shadow: 0 0 10px rgba(168, 85, 247, 0.4); 
                font-size: 15px !important;
                letter-spacing: 0.02em !important;
                text-align: center !important;
                font-weight: 500 !important;
                opacity: 1 !important;
            }
            @media (min-width: 1024px) {
                .borealis-input::placeholder {
                    font-size: 18px !important;
                    line-height: 1.4 !important;
                }
            }
            .neon-button-glow {
                box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
            }
            @keyframes text-shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
            .animate-text-shimmer {
                background: linear-gradient(90deg, #ffffff 0%, #a5b4fc 50%, #ffffff 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: text-shimmer 4s ease-in-out infinite;
            }

            @keyframes float-module {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            .carousel-snap-container {
              scroll-snap-type: x mandatory;
              -webkit-overflow-scrolling: touch;
              display: flex;
              flex-wrap: nowrap;
              overflow-x: auto;
            }
            .carousel-snap-item {
              scroll-snap-align: center;
            }

            /* Crystal Blades */
            .crystal-blade {
              position: absolute;
              top: 0;
              bottom: 0;
              width: 60px;
              opacity: 0;
              transition: all 0.5s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 50;
            }
            .crystal-blade:hover {
              opacity: 1;
              background: radial-gradient(circle at center, rgba(253, 185, 49, 0.08) 0%, transparent 70%);
            }
            .crystal-blade:hover .crystal-blade-line {
              transform: scaleY(1.05);
              box-shadow: 0 0 25px rgba(253, 185, 49, 1);
            }
            .crystal-blade:hover .crystal-chevron {
              transform: scale(1.2);
              color: #FDB931;
              text-shadow: 0 0 15px rgba(253, 185, 49, 0.8);
            }
            .crystal-blade-line {
              width: 1px;
              height: 40%;
              background: linear-gradient(to bottom, transparent, #FDB931, #EAB308, transparent);
              position: relative;
              box-shadow: 0 0 15px rgba(253, 185, 49, 0.8);
              transition: all 0.3s ease;
            }
            .crystal-chevron {
              position: absolute;
              color: white;
              font-size: 24px;
              font-weight: 200;
              transition: all 0.3s ease;
              filter: drop-shadow(0 0 8px rgba(253, 185, 49, 0.8));
            }

            /* Premium Prize Cards - LEAP Look */
            .premium-prize-card {
                width: 230px;
                height: 330px;
                flex-shrink: 0;
                background: white;
                border-radius: 32px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 20px;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: default;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                color: #1F2937;
                gap: 15px;
            }
            .prize-rank-1 { background: #FFF7ED; }
            .prize-rank-2 { background: #F5F3FF; }
            .prize-rank-3 { background: #FFF1F2; }
            .prize-rank-4 { background: #F0F9FF; }

            .premium-prize-card:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            }
            }
            .metallic-icon {
                font-size: 50px;
                margin: 0;
                filter: drop-shadow(0 8px 10px rgba(0,0,0,0.15));
            }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-15px) scale(1.02); }
            }
            .float-slow {
              animation: float-slow 10s ease-in-out infinite;
            }
          `}</style>
          <div id="section-home" className="w-full md:min-h-screen flex flex-col items-center justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 bg-transparent relative overflow-hidden pt-4 pb-8 md:pb-2">
            {/* Enhanced Grid Background - Open & Infinite */}
            <div className="absolute top-[10%] left-0 w-full h-[75%] z-0 pointer-events-none" style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 80%, transparent 100%)'
            }}></div>

            <div className="w-full flex flex-col items-center bg-transparent gap-6 relative z-10 mt-10">
              <AnimatedAIChat 
                onSubmit={(text) => { setInitialIdea(text); handleArchitect(undefined, text); }} 
                loading={loading}
                loadingMessage={loadingMessage}
              />
              <button
                onClick={() => setIsChatOpen(true)}
                className="mt-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <Bot className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                <span>Not sure yet? <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-cyan-400/50">Chat with Mitra to refine your idea first</span></span>
              </button>
            </div>

            <button onClick={() => setActiveTab('history')} className="mt-4 px-8 py-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-[2px] backdrop-blur-md relative z-10">View Build History</button>
          </div>

          {/* Separation Line (Removed as per request) */}

          <div id="section-masterclass" className="w-full max-w-[1400px] mt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 pb-4 relative overflow-visible">
             <div className="mb-4 px-6 text-center relative z-10 flex flex-col items-center">
               <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                 <span className="text-white">Live Masterclasses by </span>
                 <span className="bg-gradient-to-r from-[#00E5FF] to-[#2979FF] bg-clip-text text-transparent">Renowned Industry Experts</span>
               </h3>
               <p className="text-sm md:text-base text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">Zero-to-one insights delivered by India's most successful startup builders.</p>
             </div>

             <div className="relative z-10 group/carousel flex items-center min-h-[440px]">
                {/* Breathe Atmosphere (Removed as per request) */}

                <motion.div 
                  ref={carouselRef}
                  onScroll={handleScrollProgress}
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="carousel-snap-container gap-6 px-16 md:px-48 no-scrollbar pb-16 relative z-10 w-full"
                >
                    {MASTERCLASSES.map((m, i) => (
                        <motion.div 
                            key={i} 
                            variants={fadeInUp}
                            className="relative flex-shrink-0 w-[220px] md:w-[260px] h-[320px] md:h-[380px] carousel-snap-item group/card will-change-transform"
                            style={{ animation: `float-module ${7 + i * 0.5}s ease-in-out infinite` }}
                        >
                            <div className="obsidian-gold-card h-full w-full p-6 flex flex-col">
                                <div className="light-streak"></div>
                                <div className="flex justify-between items-start mb-4">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF4444] border border-[#EF4444] animate-live-pulse relative overflow-visible">
                                    {/* Radar Ripples */}
                                    <div className="radar-signal radar-signal-1"></div>
                                    <div className="radar-signal radar-signal-2"></div>
                                    <div className="radar-signal radar-signal-3"></div>
                                    
                                    <div className="w-1 h-1 bg-white rounded-full animate-heartbeat"></div>
                                    <span className="text-[7px] font-black text-white uppercase tracking-[2px] leading-none">LIVE</span>
                                  </div>
                                </div>
                                
                                <div className="flex-grow flex flex-col justify-start pt-4">
                                  <h4 className="text-xl md:text-2xl font-bold text-white leading-tight mb-4 group-hover/card:text-[#FDB931] transition-colors">
                                    {m.title}
                                  </h4>
                                </div>
                                
                                <div className="bg-black/60 backdrop-blur-2xl rounded-[24px] p-3 flex flex-col gap-3 border border-amber-500/10 group-hover/card:border-amber-500/40 transition-all mt-auto">
                                  <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Executor</span>
                                    <span className="text-xs font-bold text-white/90 truncate">{m.expert}</span>
                                  </div>
                                  <button className="w-full py-2 rounded-full bg-gradient-to-r from-[#FDB931] to-[#EAB308] text-black text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95">
                                    JOIN
                                  </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
             </div>
             
             {/* Simple Gold Progress Line */}
             <div className="max-w-xs mx-auto h-[1px] bg-white/5 relative z-20">
               <div 
                 className="absolute top-0 left-0 h-full bg-[#FDB931]/50 transition-all duration-300"
                 style={{ width: `${scrollProgress}%` }}
               />
             </div>
          </div>
          
          {/* Separation Line */}
          <div className="w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mt-20 mb-24 shadow-[0_0_20px_rgba(251,191,36,0.25)]" />

          {/* YouTube Embed Section */}
          <div id="section-video" className="w-full md:max-w-[720px] lg:max-w-[800px] mx-auto mt-4 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10 px-6">
            <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 group shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">WATCH THE SPIKE VISION</h3>
              <p className="text-sm md:text-base text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">See how we're revolutionizing the startup ecosystem for the next generation of builders.</p>
            </div>
          </div>

          {/* Separation Line */}
          <div className="w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent my-12 shadow-[0_0_20px_rgba(251,191,36,0.25)]" />

          {/* Sequence 1: This Week's Prizes Section */}
          <div id="section-prizes" className="w-full max-w-[1400px] mx-auto mt-8 pb-4 relative bg-transparent overflow-visible">
              <div className="text-center mb-10 flex flex-col items-center px-6">
                  <h3 className="text-xl md:text-4xl font-black tracking-tight leading-tight flex items-center justify-center gap-3">
                      <Trophy className="w-8 h-8 md:w-12 md:h-12 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" /> 
                      <span className="bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">THIS WEEK’S PRIZES FOR TOP PERFORMERS</span>
                  </h3>
                  <div className="mt-4">
                      <CountdownTimer />
                  </div>
              </div>
              
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative z-10 group/carousel flex items-center min-h-[380px]"
              >
                <div 
                  ref={prizesCarouselRef}
                  onScroll={handlePrizesScrollProgress}
                  className="carousel-snap-container gap-8 px-16 md:px-48 no-scrollbar pb-16 relative z-10 w-full"
                >
                    {/* Card 1: Peach */}
                    <motion.div variants={fadeInUp} className="premium-prize-card prize-rank-1 bg-[#FFF7ED] carousel-snap-item">
                        <Medal className="w-10 h-10 text-[#D97706]" />
                        <span className="text-[10px] font-[900] uppercase tracking-wider text-[#D97706]">Top Innovator Badge</span>
                        <h4 className="text-[18px] font-bold text-[#1F2937] leading-tight">VIP Startup Internship Opportunity</h4>
                        <span className="text-[11px] font-medium text-black/40">Rank #1</span>
                        <p className="text-[12px] font-medium text-black/60 leading-snug line-clamp-2">Direct 1:1 mentorship under a funded startup founder.</p>
                    </motion.div>
                    {/* Card 2: Lavender */}
                    <motion.div variants={fadeInUp} className="premium-prize-card prize-rank-2 bg-[#F5F3FF] carousel-snap-item">
                        <Medal className="w-10 h-10 text-[#94A3B8]" />
                        <span className="text-[10px] font-[900] uppercase tracking-wider text-[#71717A]">Mentorship Access</span>
                        <h4 className="text-[18px] font-bold text-[#1F2937] leading-tight">Exclusive Shark Tank Masterclass Pass</h4>
                        <span className="text-[11px] font-medium text-black/40">Rank #2</span>
                        <p className="text-[12px] font-medium text-black/60 leading-snug line-clamp-2">Live access + backstage networking opportunity.</p>
                    </motion.div>
                    {/* Card 3: Rose */}
                    <motion.div variants={fadeInUp} className="premium-prize-card prize-rank-3 bg-[#FFF1F2] carousel-snap-item">
                        <Medal className="w-10 h-10 text-amber-700" />
                        <span className="text-[10px] font-[900] uppercase tracking-wider text-[#92400E]">Hall of Fame Entry</span>
                        <h4 className="text-[18px] font-bold text-[#1F2937] leading-tight">Featured on SPIKE Hall of Fame</h4>
                        <span className="text-[11px] font-medium text-black/40">Rank #3</span>
                        <p className="text-[12px] font-medium text-black/60 leading-snug line-clamp-2">Get spotlighted to 10,000+ peers & mentors.</p>
                    </motion.div>
                    {/* Card 4: Sky Blue */}
                    <motion.div variants={fadeInUp} className="premium-prize-card prize-rank-4 bg-[#F0F9FF] carousel-snap-item">
                        <Award className="w-10 h-10 text-cyan-600" />
                        <span className="text-[10px] font-[900] uppercase tracking-wider text-[#0891B2]">Community Rockstar</span>
                        <h4 className="text-[18px] font-bold text-[#1F2937] leading-tight">Priority Access to Next Startup Challenge</h4>
                        <span className="text-[11px] font-medium text-black/40">Ranks 4-10</span>
                        <p className="text-[12px] font-medium text-black/60 leading-snug line-clamp-2">Early invites to upcoming growth sprints.</p>
                    </motion.div>
                </div>
              </motion.div>
          </div>

          {/* Separation Line */}
          <div className="w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent my-12 shadow-[0_0_20px_rgba(251,191,36,0.25)]" />

          {/* Hall of Fame - Compact Animated Showcase */}
          <div id="section-wall-of-fame" className="w-full max-w-[1100px] mt-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative mx-auto overflow-visible h-auto lg:h-[600px] flex items-center justify-center">
              {/* Subtle Amber Haze */}
              <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.02) 0%, transparent 80%)' }}></div>
              
              <div className="px-6 relative z-10 w-full h-full flex flex-col justify-center">
                  <div className="text-center mb-6">
                      <h3 className="text-[22px] md:text-[26px] font-black tracking-tight mb-1 uppercase font-['Plus_Jakarta_Sans']" style={{ backgroundImage: 'linear-gradient(to right, #ffffff, #94a3b8, #ffffff, #cbd5e1, #ffffff)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'text-shimmer 3s linear infinite', textShadow: '0 0 40px rgba(255,255,255,0.2)' }}>
                          SPIKE&nbsp; Hall of&nbsp; Fame
                      </h3>
                      <p className="text-[11px] font-extrabold uppercase tracking-[5px] font-['Plus_Jakarta_Sans']" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          HONORING THE TITANS BUILDING TODAY'S LEGACY
                      </p>
                  </div>

                  <div className="relative w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16">
                      {/* Spotlight Container (Pillar + Logo) */}
                      <div className="relative flex flex-col items-center lg:w-1/2">
                          {/* Holographic Glow */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none"></div>

                          {/* Floating Logo & Name Container */}
                          <div key={fameIndex} className="relative z-10 flex flex-col items-center animate-glitch-fade">
                              <div className="animate-float-subtle flex flex-col items-center">
                                  {/* Fixed Elite Star Badge */}
                                  <div className="relative z-10 transform scale-110 mb-4">
                                      <span>
                                          <Award className="w-12 h-12 text-amber-500" />
                                      </span>
                                  </div>
                                  
                                  {/* Startup Name - Hyper White */}
                                  <h4 className="text-xl font-extrabold tracking-[2px] uppercase text-center font-['Plus_Jakarta_Sans'] text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.4)' }}>
                                      {hallOfFameStartups[fameIndex].name}
                                  </h4>
                              </div>
                          </div>

                          {/* Vertical Beam - Scanning Light */}
                          <div className="relative w-[1px] h-[15px] mt-1 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/50 to-transparent opacity-30"></div>
                              <div className="animate-scan-beam"></div>
                          </div>

                          {/* 3D Pillar / Podium */}
                          <div className="relative w-[160px] md:w-[200px] h-[260px] -mt-1 overflow-visible">
                              {/* Top Cap - 3D Disk with Silver Highlight */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] md:w-[170px] h-8 bg-gradient-to-b from-[#333] via-[#111] to-[#050505] rounded-[100%] border-t border-white/20 shadow-2xl z-20">
                                  <div className="absolute inset-0 rounded-[100%] border-t border-white/10 opacity-40 shadow-inner"></div>
                              </div>
                              
                              {/* Vertical Body - Fluted Texture */}
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[110px] md:w-[140px] h-[200px] bg-black border-x border-white/5 z-10 overflow-hidden">
                                  <div 
                                    className="w-full h-full animate-rotate-y"
                                    style={{
                                        background: `repeating-linear-gradient(to right, 
                                            #000 0%, #1a1a1a 5%, #000 10%
                                        )`,
                                        backgroundSize: '200% 100%'
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/80 pointer-events-none"></div>
                              </div>
                              
                              {/* Pillar Base - 3 Layered Ellipses */}
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 z-0">
                                  {/* Ambient Base Glow */}
                                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[140%] h-[60px] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.15)_0%,transparent_70%)] blur-xl pointer-events-none z-[-1]"></div>
                                  
                                  {/* Bottom Disk (Widest) */}
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-10 bg-gradient-to-b from-[#1a1a1a] to-black rounded-[100%] border-t border-white/10"></div>
                                  {/* Middle Disk */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] h-10 bg-gradient-to-b from-[#1a1a1a] to-black rounded-[100%] border-t border-white/10"></div>
                                  {/* Top Disk */}
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-gradient-to-b from-[#1a1a1a] to-black rounded-[100%] border-t border-white/10"></div>
                              </div>
                          </div>
                      </div>

                      {/* Founder Detail Card (Deep Obsidian Glass) */}
                      <div key={`card-${fameIndex}`} className="w-full max-w-[260px] h-[380px] rounded-[24px] p-6 flex flex-col animate-cross-fade relative overflow-hidden group"
                           style={{ 
                                background: 'rgba(10, 10, 15, 0.95)', 
                                backdropFilter: 'blur(30px)',
                                border: '1px solid rgba(253, 185, 49, 0.2)',
                                borderImage: 'linear-gradient(to bottom right, rgba(253, 185, 49, 0.3), rgba(255, 255, 255, 0.1)) 1'
                           }}>
                          {/* Inner Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent pointer-events-none"></div>
                          
                          <div className="mb-4 relative z-10">
                              <span className="text-[10px] font-black text-[#FDB931] uppercase tracking-[3px] block mb-2" style={{ fontVariant: 'small-caps' }}>
                                  {hallOfFameStartups[fameIndex].category}
                              </span>
                              <h3 className="text-[20px] font-bold text-white tracking-tight leading-tight font-['Plus_Jakarta_Sans']">
                                  {hallOfFameStartups[fameIndex].founder}
                              </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                              <div>
                                  <span className="text-[10px] font-bold text-[#FDB931]/60 uppercase tracking-[1px] block mb-1 font-['Plus_Jakarta_Sans']">Stage</span>
                                  <p className="text-[13px] font-bold text-white uppercase font-['Plus_Jakarta_Sans']">{hallOfFameStartups[fameIndex].stage}</p>
                              </div>
                              <div>
                                  <span className="text-[10px] font-bold text-[#FDB931]/60 uppercase tracking-[1px] block mb-1 font-['Plus_Jakarta_Sans']">Sector</span>
                                  <p className="text-[13px] font-bold text-white uppercase font-['Plus_Jakarta_Sans']">AI / Tech</p>
                              </div>
                          </div>

                          <div className="mb-6 flex-1 relative z-10">
                              <span className="text-[10px] font-bold text-[#FDB931]/60 uppercase tracking-[1px] block mb-1.5 font-['Plus_Jakarta_Sans']">Mission</span>
                              <p className="text-[13px] text-[#94A3B8] leading-[1.5] font-medium line-clamp-3 font-['Plus_Jakarta_Sans']">
                                  {hallOfFameStartups[fameIndex].desc}
                              </p>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-center justify-between mb-6 relative z-10">
                              {hallOfFameStartups[fameIndex].stats.map((stat, idx) => (
                                  <React.Fragment key={idx}>
                                      <div className="flex items-center gap-2.5">
                                          <span className="text-sm text-[#00E5FF]">{stat.icon}</span>
                                          <div className="flex flex-col">
                                              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest font-['Plus_Jakarta_Sans']">{stat.label}</span>
                                              <span className="text-[13px] font-black text-white font-['Plus_Jakarta_Sans']">{stat.value}</span>
                                          </div>
                                      </div>
                                      {idx === 0 && <div className="w-[1px] h-6 bg-white/5"></div>}
                                  </React.Fragment>
                              ))}
                          </div>

                          <div className="grid grid-cols-2 gap-3 relative z-10">
                              <button className="py-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white text-[10px] font-black uppercase tracking-[1px] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center font-['Plus_Jakarta_Sans']">
                                  Join Team
                              </button>
                              <button className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[1px] text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center font-['Plus_Jakarta_Sans']">
                                  Case Study
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Separation Line */}
          <div className="w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent my-12 shadow-[0_0_20px_rgba(251,191,36,0.25)]" />

          {/* Sequence 2: TOP EXECUTORS LEADERBOARD */}
          <div id="section-rewards" className="w-full max-w-[1200px] mx-auto mt-8 pb-4 relative bg-transparent px-6 overflow-hidden">
              {/* Deep Amber Ambient Haze */}
              <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.06) 0%, transparent 80%)' }}></div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-10 relative z-10"
              >
                  <h3 className="text-[20px] md:text-[28px] font-bold text-white mb-2 tracking-[1px] uppercase flex items-center justify-center gap-3 font-['Plus_Jakarta_Sans']">
                      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                      TOP EXECUTORS LEADERBOARD
                  </h3>
                  <p className="text-white/50 text-[12px] font-medium max-w-2xl mx-auto leading-relaxed tracking-wider">
                      Where consistent execution meets legendary access.
                  </p>
              </motion.div>

              <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-20 items-center lg:items-end justify-center relative z-10">
                  {/* Right Side: REFINED PODIUM LEADERBOARD */}
                  <div className="flex-1 flex flex-col justify-end max-w-2xl w-full pb-2">
                      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end relative h-[300px]">
                          {/* Subtle Light Pillar behind Rank 1 */}
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            whileInView={{ opacity: 1, height: '120%' }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="absolute left-1/2 bottom-0 -translate-x-1/2 w-24 md:w-40 bg-gradient-to-t from-[#f59e0b]/20 to-transparent blur-3xl pointer-events-none z-0"
                          ></motion.div>

                          {/* Rank 2 (Left) - Sarah M. */}
                          <motion.div 
                            initial={{ x: -100, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center z-10 relative"
                          >
                              <div className="relative mb-4">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[1px] bg-white/20 relative">
                                      <div className="absolute inset-0 rounded-full border border-white/30 animate-[pulse_3s_infinite]"></div>
                                      <div className="w-full h-full rounded-full bg-black p-1 overflow-hidden">
                                          <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah" className="w-full h-full rounded-full object-cover" alt="Sarah M." />
                                      </div>
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#94A3B8] flex items-center justify-center text-black font-black text-[10px] border border-white/20">2</div>
                              </div>
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-center mb-4"
                              >
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                      <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tighter font-['Plus_Jakarta_Sans']">Sarah M.</p>
                                  </div>
                                  <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-bold font-['Plus_Jakarta_Sans']">2,450 XP</div>
                              </motion.div>
                              <div className="w-full h-20 md:h-24 bg-[rgba(0,0,0,0.4)] rounded-t-2xl border-x border-t border-white/10 backdrop-blur-sm"></div>
                          </motion.div>

                          {/* Rank 1 (Center) - Arjun K. */}
                          <motion.div 
                            initial={{ y: 150, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center z-20 relative"
                          >
                              <motion.div 
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative mb-5"
                              >
                                  {/* Ambient Sparkle */}
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 1 }}
                                    className="absolute -inset-10 pointer-events-none"
                                  >
                                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#f59e0b] rounded-full animate-ping"></div>
                                    <div className="absolute bottom-0 right-0 w-1 h-1 bg-[#f59e0b] rounded-full animate-ping delay-300"></div>
                                    <div className="absolute top-1/2 left-0 w-1 h-1 bg-[#f59e0b] rounded-full animate-ping delay-700"></div>
                                  </motion.div>

                                  {/* Gold Halo */}
                                  <div className="absolute -inset-2 rounded-full border border-[#f59e0b]/40 animate-[pulse_4s_infinite] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-[2px] bg-[#f59e0b]/40 relative z-10 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                      <div className="w-full h-full rounded-full bg-black p-1.5 overflow-hidden">
                                          <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun" className="w-full h-full rounded-full object-cover" alt="Arjun K." />
                                      </div>
                                  </div>
                                  <div className="absolute -top-2 -right-2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#f59e0b] flex items-center justify-center text-black font-black text-xs border-2 border-black shadow-lg z-20">1</div>
                              </motion.div>
                              
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-center mb-6"
                              >
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                      <p className="text-xs md:text-sm font-black text-white uppercase tracking-widest font-['Plus_Jakarta_Sans']">Arjun K.</p>
                                  </div>
                                  <div className="px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-[10px] md:text-xs font-black font-['Plus_Jakarta_Sans']">
                                      2,840 XP
                                  </div>
                              </motion.div>
                              
                              <div className="w-full h-32 md:h-40 bg-[rgba(0,0,0,0.4)] rounded-t-3xl border-x border-t border-[#f59e0b]/20 backdrop-blur-md relative overflow-hidden">
                                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.05)_50%,transparent_75%)] bg-[length:200%_200%] animate-[text-shimmer_4s_infinite]"></div>
                              </div>
                          </motion.div>

                          {/* Rank 3 (Right) - Rohan D. */}
                          <motion.div 
                            initial={{ x: 100, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center z-10 relative"
                          >
                              <div className="relative mb-4">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[1px] bg-amber-900/40 relative">
                                      <div className="absolute inset-0 rounded-full border border-[#B45309]/30 animate-[pulse_3s_infinite]"></div>
                                      <div className="w-full h-full rounded-full bg-black p-1 overflow-hidden">
                                          <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan" className="w-full h-full rounded-full object-cover" alt="Rohan D." />
                                      </div>
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#B45309] flex items-center justify-center text-black font-black text-[10px] border border-white/20">3</div>
                              </div>
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-center mb-4"
                              >
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                      <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tighter font-['Plus_Jakarta_Sans']">Rohan D.</p>
                                  </div>
                                  <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-bold font-['Plus_Jakarta_Sans']">2,100 XP</div>
                              </motion.div>
                              <div className="w-full h-16 md:h-20 bg-[rgba(0,0,0,0.4)] rounded-t-2xl border-x border-t border-white/10 backdrop-blur-sm"></div>
                          </motion.div>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Separation Line */}
          <div className="w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent my-12 shadow-[0_0_20px_rgba(251,191,36,0.25)]" />
          
          <div className="w-full flex flex-col items-center gap-6 py-10 mt-4">
              <div className="text-center text-white/20">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">Execution Over Everything.</span>
              </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 opacity-60">
           <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
           <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
           <p className="text-sm text-gray-400">This feature is under construction.</p>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col selection:bg-indigo-500/30 overflow-x-hidden no-scrollbar bg-transparent relative"
    >
      <style>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 { font-weight: 800; margin-top: 1.5em; margin-bottom: 0.5em; color: white; }
        .markdown-body h1 { font-size: 1.5rem; }
        .markdown-body h2 { font-size: 1.25rem; }
        .markdown-body h3 { font-size: 1.1rem; }
        .markdown-body p { margin-bottom: 1em; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .markdown-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .markdown-body li { margin-bottom: 0.25em; }
        .markdown-body strong { color: white; font-weight: 800; }
        .markdown-body code { background: rgba(255,255,255,0.1); padding: 0.2em 0.4em; border-radius: 0.25em; font-size: 0.9em; }
        .markdown-body pre code { background: transparent; padding: 0; }
        .markdown-body pre { background: rgba(0,0,0,0.5); padding: 1em; border-radius: 0.5em; overflow-x: auto; margin-bottom: 1em; border: 1px solid rgba(255,255,255,0.1); }
        .markdown-body blockquote { border-left: 4px solid rgba(255,255,255,0.2); padding-left: 1em; color: rgba(255,255,255,0.7); font-style: italic; margin-bottom: 1em; }
      `}</style>
      <AtmosphericLighting activeZone={lightingMode} theme={theme} />
      
      <AnimatePresence>
        {isChatOpen && (
          <NeuralChatWorkspace 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            roadmap={roadmap}
            activeTab={activeTab}
            onTabChange={(tab) => {
                setActiveTab(tab);
                setIsChatOpen(false);
            }}
            onGenerateRoadmap={(idea) => {
                setInitialIdea(idea);
                handleArchitect(undefined, idea);
                setIsChatOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
      </AnimatePresence>

      {(appState !== AppState.MITRA || activeTab !== 'home') && activeTab !== 'history' && (
        <TopHeader 
          onHistoryClick={() => setActiveTab('history')} 
          onChatClick={() => setIsChatOpen(true)}
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          theme={theme}
          isHidden={!isNavVisible}
          footerMode={footerMode}
          onFooterModeChange={setFooterMode}
          networkSubTab={networkSubTab}
          onNetworkSubTabChange={setNetworkSubTab}
          teamContextTab={teamContextTab}
          onTeamContextTabChange={setTeamContextTab}
        />
      )}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}
      {showOnboarding && <OnboardingModal onFinish={() => { localStorage.setItem('spike_has_onboarded_v1', 'true'); setShowOnboarding(false); }} />}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setShowHistory(false)} 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm bg-[#050505]/95 backdrop-blur-3xl border-l border-white/10 flex flex-col h-full overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

            {/* Header */}
            <div className="p-8 pb-4 shrink-0 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    Archive
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1.5px] mt-1">Strategic Build History</p>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all active:scale-95 group"
                      title="Clear Archive"
                    >
                      <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowHistory(false)} 
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative group">
                <input 
                  type="text" 
                  value={historySearchQuery} 
                  onChange={(e) => setHistorySearchQuery(e.target.value)} 
                  placeholder="Filter build history..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-11 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all focus:bg-indigo-500/5 focus:ring-4 focus:ring-indigo-500/20 shadow-lg" 
                />
                <Search className="w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 absolute left-4 top-3.5 transition-colors" />
                {historySearchQuery && (
                  <button 
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-3 top-3 px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-black text-gray-400 hover:text-white"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-2 relative z-10">
              <div className="space-y-3 pb-20">
                 {history.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                     <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center mb-4">
                       <Rocket className="w-8 h-8 text-gray-400" />
                     </div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">No builds archived yet. <br /> Initialize your first venture.</p>
                   </div>
                 ) : filteredHistory.length === 0 ? (
                   <div className="text-center py-20 opacity-40">
                     <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                     <p className="text-xs text-gray-400 font-black uppercase tracking-widest">No matching builds found.</p>
                   </div>
                 ) : filteredHistory.map((h, i) => (
                   <button 
                    key={i} 
                    onClick={() => loadFromHistory(h)} 
                    className="w-full text-left p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col gap-2"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     
                     <div className="flex justify-between items-start relative z-10">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                         <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                           <Clock className="w-2.5 h-2.5" />
                           {new Date(h.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                     </div>

                     <p className="text-[13px] font-bold text-gray-200 line-clamp-2 group-hover:text-white transition-colors relative z-10 leading-snug">
                       {h.idea}
                     </p>
                   </button>
                 ))}
              </div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
          </motion.div>
        </div>
      )}
      <div className="flex-grow flex flex-col transition-all duration-400 ease-in-out">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      {activeTab !== 'history' && (
        <BottomNavbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isHidden={!isNavVisible} 
          footerMode={footerMode}
          onFooterModeChange={setFooterMode}
          networkSubTab={networkSubTab}
          onNetworkSubTabChange={setNetworkSubTab}
          teamContextTab={teamContextTab}
          onTeamContextTabChange={setTeamContextTab}
        />
      )}
    </div>
  );
};

export default App;
