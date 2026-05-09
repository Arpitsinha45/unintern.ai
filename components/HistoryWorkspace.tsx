import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, Plus, Search, Map, Layout, FileText, Users, History, Settings, HelpCircle, Sun, Moon, Link, Image as ImageIcon, Code, Menu, Mic, Send, MessageSquare, Zap, Gift, Home, ArrowLeft, Bell, Paperclip, Command, ArrowUp } from 'lucide-react';
import { StartupRoadmap } from '../types';

interface HistoryWorkspaceProps {
  history: { idea: string; roadmap: StartupRoadmap; timestamp: number }[];
  onLoadHistory: (item: any) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryWorkspace: React.FC<HistoryWorkspaceProps> = ({ 
  history, 
  onLoadHistory, 
  onClearHistory,
  onClose
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const renderLeftSidebar = () => {
    return (
      <>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}
        
        <div className={`fixed md:relative z-50 shrink-0 border-r border-white/5 bg-[#0a0a0f]/95 backdrop-blur-3xl flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-[72px] -translate-x-full md:translate-x-0'}`}>
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
                className={`w-full flex items-center ${isSidebarOpen ? 'px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10' : 'p-2.5 rounded-xl justify-center hover:bg-white/5'} text-white text-sm font-medium transition-all font-['Plus_Jakarta_Sans']`}
                title="History"
              >
                 {isSidebarOpen ? 'History' : <History className="w-5 h-5 text-gray-400 hover:text-white" />}
              </button>

              {isSidebarOpen && (
                <>
                  <div className="mt-4 mb-2 px-1">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Previous Chats</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 text-sm hover:bg-white/5 transition-colors truncate">
                        Revolutionize Customer Engagement...
                     </button>
                     <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 text-sm hover:bg-white/5 transition-colors truncate">
                        Chatbots on Steroids: Meet the AI...
                     </button>
                     <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 text-sm hover:bg-white/5 transition-colors truncate">
                        Startup Unit Economics...
                     </button>
                  </div>

                  <div className="mt-6 mb-2 px-1">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Projects</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 text-sm hover:bg-white/5 transition-colors truncate">
                        New Project
                     </button>
                     <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 text-sm hover:bg-white/5 transition-colors truncate">
                        Learning From 100 Years of...
                     </button>
                  </div>
                </>
              )}
           </div>

           <div className={`mt-auto w-full mb-6 pt-4 border-t border-white/5 flex flex-col gap-1 ${isSidebarOpen ? 'px-4' : 'px-2 items-center'}`}>
              <button 
                className={`w-full flex items-center ${isSidebarOpen ? 'px-3 py-2.5 rounded-xl text-left' : 'p-2.5 rounded-xl justify-center'} text-gray-400 hover:text-white text-sm font-medium hover:bg-white/10 transition-all font-['Plus_Jakarta_Sans'] gap-3`}
                title="Settings"
              >
                 <Settings className="w-5 h-5 shrink-0" />
                 {isSidebarOpen && <span>Settings</span>}
              </button>
              <button 
                className={`w-full flex items-center ${isSidebarOpen ? 'px-3 py-2.5 rounded-xl text-left' : 'p-2.5 rounded-xl justify-center'} text-gray-400 hover:text-white text-sm font-medium hover:bg-white/10 transition-all font-['Plus_Jakarta_Sans'] gap-3`}
                title="Account"
              >
                 <Users className="w-5 h-5 shrink-0" />
                 {isSidebarOpen && <span>Account</span>}
              </button>
           </div>
        </div>
      </>
    );
  };

  const renderRightSidebar = () => {
    return null;
  };

  return (
    <div className={`w-full h-screen font-['Plus_Jakarta_Sans'] flex overflow-hidden bg-[#0a0a0f] text-white`}>
      
      {/* BACKGROUND GRADIENT & GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[100px] pointer-events-none z-0" />

      {renderLeftSidebar()}

      {/* CENTER WORKSPACE */}
      <div className="flex-1 h-full flex flex-col relative">
        
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 h-[72px] px-4 md:px-8 flex justify-between items-center z-40 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
             {!isSidebarOpen && (
               <button 
                 onClick={() => setIsSidebarOpen(true)} 
                 className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 md:hidden transition-colors"
                 >
                 <Menu className="w-5 h-5" />
               </button>
             )}
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hidden md:flex items-center justify-center text-white hover:bg-white/10 transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
          </div>

          <nav className={`hidden md:flex items-center pointer-events-auto absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[52px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full px-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden w-[400px]`}>
            <div className="flex justify-around items-center w-full h-full">
               <button className={`flex flex-col items-center justify-center flex-1 h-full relative z-10 group text-gray-400 hover:text-white transition-colors`}>
                 <div className="relative z-10 flex items-center gap-2">
                    <Users size={16} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] font-['Plus_Jakarta_Sans']">Network</span>
                 </div>
               </button>
               <button className={`flex flex-col items-center justify-center flex-1 h-full relative z-10 group text-white`}>
                 <div className="absolute inset-x-2 inset-y-1.5 bg-white/10 border border-white/20 rounded-full z-0 shadow-[inset_0_1px_rgba(255,255,255,0.2)]" />
                 <div className="relative z-10 flex items-center gap-2">
                    <Zap size={16} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] font-['Plus_Jakarta_Sans']">Arena</span>
                 </div>
               </button>
               <button className={`flex flex-col items-center justify-center flex-1 h-full relative z-10 group text-gray-400 hover:text-white transition-colors`}>
                 <div className="relative z-10 flex items-center gap-2">
                    <Bot size={16} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] font-['Plus_Jakarta_Sans']">Mentor</span>
                 </div>
               </button>
            </div>
          </nav>

          <div className="flex items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto">
            <button className="relative group p-2 md:p-2.5 rounded-full hover:bg-white/10 transition-all focus:outline-none">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white/70 group-hover:text-white transition-colors" />
            </button>
            <div className="w-[1px] h-4 md:h-5 bg-white/10 mx-0.5 md:mx-1 rounded-full"></div>
            <div>
              <button className={`relative group p-2 md:p-2.5 rounded-full hover:bg-white/10 transition-all focus:outline-none text-white/70`}>
                <Bell className="w-4 h-4 md:w-5 md:h-5 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="w-[1px] h-4 md:h-5 bg-white/10 mx-0.5 md:mx-1 rounded-full"></div>
            <div className="p-0.5 ml-0.5 md:ml-1">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 p-[1px] cursor-pointer hover:border-white/50 transition-all overflow-hidden bg-white/5 relative group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Emilia" alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col px-4 md:px-8 max-w-4xl mx-auto w-full pt-20 pb-6 relative">
            
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10 w-full relative z-10 pt-8">
               <h1 className="text-3xl md:text-[40px] font-bold text-white mb-2 leading-tight">
                 <span className="text-gray-400">HI Rownok</span> Ready to<br/>Achieve Great Things?
               </h1>
               
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="hidden md:flex absolute top-24 left-1/2 -translate-x-1/2 w-[400px] h-[150px] mt-8 justify-center items-end z-20 pointer-events-none"
               >
                  {/* Floating Bubbles & Bot */}
                  <div className="absolute left-[5%] top-[20%] bg-blue-500/20 px-4 py-2 rounded-2xl rounded-bl-sm text-sm border border-blue-500/30 flex items-center gap-2 backdrop-blur-md">
                    <div className="w-5 h-5 rounded-full bg-blue-500" /> Hey there! Need a boost?
                  </div>
                  <div className="absolute right-[5%] top-[0%] bg-blue-500/20 px-4 py-2 rounded-2xl rounded-br-sm text-sm border border-blue-500/30 flex items-center gap-2 backdrop-blur-md">
                    <div className="w-5 h-5 rounded-full bg-blue-500" /> Let's build!
                  </div>
                  
                  <div className="w-28 h-28 bg-gradient-to-b from-[#1a1c2d] to-[#0f111a] rounded-t-[50px] rounded-b-[40px] border border-white/10 shadow-2xl flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.3)] z-10 pb-2">
                    <div className="w-16 h-8 bg-black rounded-full shadow-inner flex items-center justify-center gap-2 px-3">
                       <div className="w-2.5 h-1 bg-white rounded-full opacity-50" />
                       <div className="w-2.5 h-1 bg-white rounded-full opacity-50" />
                    </div>
                    <div className="w-6 h-1 bg-blue-400 rounded-full mt-3 opacity-50" />
                    <div className="absolute -left-4 top-1/2 -mt-4 w-6 h-12 bg-blue-500 rounded-full blur-md opacity-50 -rotate-12" />
                    <div className="absolute -right-4 top-1/2 -mt-4 w-6 h-12 bg-blue-500 rounded-full blur-md opacity-50 rotate-12" />
                  </div>
               </motion.div>
            </motion.div>
            <div className="hidden md:block h-64 flex-1" /> {/* Spacer only on desktop so bot has room */}

            {/* Input Container */}
            <div className="w-full max-w-3xl mx-auto bg-[#13151A] border border-white/5 rounded-[20px] shadow-2xl relative z-30 mb-8 overflow-hidden">
               <div className="relative">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Describe your startup idea..."
                    className="w-full bg-transparent outline-none resize-none pt-4 pb-12 px-5 min-h-[120px] text-white placeholder-gray-500/70 text-[15px]"
                  />
                  
                  {/* Divider */}
                  <div className="h-[1px] w-full bg-white/5" />

                  {/* Actions */}
                  <div className="flex items-center justify-between px-3 py-2 bg-[#13151A]">
                     <div className="flex items-center gap-1">
                       <button className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                         <Paperclip className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1">
                         <Command className="w-4 h-4" />
                       </button>
                     </div>

                     <button className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <ArrowUp className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
        </div>
      </div>

    </div>
  );
};

const SidebarItem = ({ icon, label, isOpen, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center ${isOpen ? 'justify-start px-3 py-2.5 rounded-xl gap-3' : 'justify-center aspect-square rounded-xl'} bg-white/5 border border-white/10 backdrop-blur-md shadow-sm text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group relative`}
    title={!isOpen ? label : undefined}
  >
    <div className={`${isOpen ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0`}>
      {React.cloneElement(icon, { className: 'w-full h-full' })}
    </div>
    {isOpen && <span className="text-sm font-medium tracking-wide">{label}</span>}
  </button>
);

const Brain = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
)
