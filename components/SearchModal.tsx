import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare } from 'lucide-react';
import { ChatSession } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, sessions, onSelectSession }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
         inputRef.current?.focus();
      }, 50); // Small delay to ensure render focus
    }
    if (!isOpen) {
        setQuery(''); 
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter(session => {
    const q = query.toLowerCase().trim();
    if (!q) return true; 
    
    const titleMatch = session.title.toLowerCase().includes(q);
    const messageMatch = session.messages.some(m => m.text.toLowerCase().includes(q));
    
    return titleMatch || messageMatch;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-base outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder="搜索聊天..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button 
             onClick={() => { setQuery(''); onClose(); }} 
             className="p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white">
            {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                    未找到与 "{query}" 相关的聊天
                </div>
            ) : (
                <div className="space-y-0.5">
                    {filteredSessions.map(session => {
                        // Find matching message snippet if query exists, else show last message
                        let snippet = session.messages[session.messages.length - 1]?.text || "";
                        if (query) {
                            const match = session.messages.find(m => m.text.toLowerCase().includes(query.toLowerCase()));
                            if (match) snippet = match.text;
                        }
                        
                        return (
                          <button
                              key={session.id}
                              onClick={() => {
                                  onSelectSession(session.id);
                                  onClose();
                              }}
                              className="w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-100/80 rounded-lg transition-colors text-left group border border-transparent hover:border-gray-100"
                          >
                               <div className="flex-shrink-0 text-gray-400 mt-0.5 group-hover:text-gray-600">
                                  <MessageSquare size={18} />
                               </div>
                               <div className="flex-1 min-w-0">
                                   <div className="font-medium text-gray-900 truncate text-sm">{session.title}</div>
                                   <div className="text-xs text-gray-500 line-clamp-2 mt-0.5 break-all">
                                      {snippet}
                                   </div>
                               </div>
                               <div className="text-[10px] text-gray-400 whitespace-nowrap pt-1">
                                  {new Date(Number(session.id) || Date.now()).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                               </div>
                          </button>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;