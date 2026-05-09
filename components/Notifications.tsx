import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, Paperclip, Check, X } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onMarkAllRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, unreadCount, onMarkAllRead }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'inbox'>('general');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="notification-panel"
          initial={{ opacity: 0, y: isMobile ? '100%' : 10, scale: isMobile ? 1 : 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMobile ? '100%' : 10, scale: isMobile ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={
            isMobile 
              ? "fixed inset-0 z-[100] bg-[#09090b]/90 backdrop-blur-2xl text-white font-['Plus_Jakarta_Sans'] flex flex-col"
              : "absolute top-14 right-0 w-[400px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden text-white font-['Plus_Jakarta_Sans']"
          }
        >
            {/* Header */}
            <div className={`flex justify-between items-center p-4 ${isMobile ? 'pt-8' : ''}`}>
              <h3 className="font-bold text-sm tracking-wide">NOTIFICATIONS</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={onMarkAllRead}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${unreadCount > 0 ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-500 cursor-default'}`}
                >
                  Mark all read
                </button>
                {isMobile && (
                  <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-start px-4 border-b border-white/5">
              <div className="flex space-x-6">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`relative py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'general' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  General
                  {activeTab === 'general' && (
                    <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('inbox')}
                  className={`relative py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'inbox' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  <span className="flex items-center gap-2">
                    Inbox {unreadCount > 0 && <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">{unreadCount}</span>}
                  </span>
                  {activeTab === 'inbox' && (
                    <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className={`overflow-y-auto no-scrollbar ${isMobile ? 'flex-1' : 'max-h-[350px]'}`}>
              <div className="flex flex-col">
                
                {/* Item 1 */}
                <div className="flex gap-3 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden">
                    <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Tom" alt="Tom" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold group-hover:text-white ${unreadCount > 0 ? 'text-white/90' : 'text-gray-400'}`}>Tom added new video</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">12 mins ago • New post</p>
                  </div>
                  {unreadCount > 0 && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                </div>

                {/* Item 2 */}
                <div className="flex gap-3 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden">
                    <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Tom" alt="Tom" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold group-hover:text-white ${unreadCount > 0 ? 'text-white/90' : 'text-gray-400'}`}>Tom left comments for you</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">27 mins ago • New comment</p>
                  </div>
                  {unreadCount > 0 && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                </div>

                {/* Item 3 (Actions) */}
                <div className="flex gap-3 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden">
                    <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Anna" alt="Anna" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white/90 group-hover:text-white">Anna requested to create an ad</p>
                    <p className="text-[10px] text-gray-500 mt-1 mb-3 uppercase tracking-wider font-semibold">2 hours ago • Campaign</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors">
                        Decline
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        Accept
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item 4 (Attachment) */}
                <div className="flex gap-3 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden">
                    <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Jason" alt="Jason" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white/90 group-hover:text-white">Jason attached the file</p>
                    <p className="text-[10px] text-gray-500 mt-1 mb-3 uppercase tracking-wider font-semibold">6 hours ago • Attached files</p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors w-fit">
                      <Paperclip size={12} />
                      <span className="font-mono text-[10px]">Work_examples.pdf</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
            
          </motion.div>
      )}
    </AnimatePresence>
  );

  if (isMobile) {
    if (typeof document === 'undefined') return null;
    return createPortal(content, document.body);
  }

  return content;
};
