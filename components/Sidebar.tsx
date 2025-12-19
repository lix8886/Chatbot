
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Folder, 
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderInput,
  ChevronDown,
  ChevronRight,
  SquarePen
} from 'lucide-react';
import { ChatSession, Project } from '../types';
import SearchModal from './SearchModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  projects: Project[];
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (project: Project) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (session: ChatSession) => void;
  onMoveToProject: (session: ChatSession) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  sessions, 
  currentSessionId,
  onSelectSession,
  projects,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  onDeleteSession,
  onRenameSession,
  onMoveToProject
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  
  // State for Project menu
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [projectMenuPosition, setProjectMenuPosition] = useState<{ top: number; left: number } | null>(null);
  
  // State for Session menu
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);
  const [sessionMenuPosition, setSessionMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuProjectId(null);
        setActiveMenuSessionId(null);
        setProjectMenuPosition(null);
        setSessionMenuPosition(null);
      }
    };

    if (activeMenuProjectId || activeMenuSessionId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuProjectId, activeMenuSessionId]);

  const handleProjectMenuClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setActiveMenuSessionId(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveMenuProjectId(projectId);
    setProjectMenuPosition({ top: rect.bottom + 5, left: rect.left });
  };

  const handleSessionMenuClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setActiveMenuProjectId(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveMenuSessionId(sessionId);
    setSessionMenuPosition({ top: rect.bottom + 5, left: rect.left });
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Filter sessions that are NOT in any project
  const unprojectedSessions = sessions.filter(s => !s.projectId);

  return (
    <>
      <div 
        className={`
          flex-shrink-0 h-full bg-[#f9f9f9] border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'w-[260px]' : 'w-[68px]'}
        `}
      >
        <div className="h-full flex flex-col text-sm text-gray-900 relative">
          
          {/* Header Action / Toggle */}
          <div className={`flex items-center p-3 ${isOpen ? 'justify-between' : 'justify-center'}`}>
            {isOpen ? (
              <>
                <div className="font-medium text-gray-400 text-xs px-2">CHATS</div>
                <button 
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                >
                  <PanelLeftClose size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={onToggle}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
          </div>

          {/* Main Navigation Area */}
          <div className="flex-1 flex flex-col overflow-y-auto px-2 space-y-4 custom-scrollbar overflow-x-hidden">
            
            {/* Action Group */}
            <div className={`space-y-1 ${!isOpen ? 'flex flex-col items-center' : ''}`}>
              <button 
                onClick={onNewChat}
                className={`flex items-center gap-3 transition-colors group ${
                  isOpen 
                    ? 'w-full px-3 py-2.5 hover:bg-gray-200 rounded-lg' 
                    : 'p-3 hover:bg-gray-200 rounded-full'
                }`}
                title="新聊天"
              >
                {isOpen ? <Sparkles size={18} className="text-blue-500" /> : <SquarePen size={22} className="text-gray-700" />}
                {isOpen && <span className="font-medium">新聊天</span>}
              </button>
              
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-3 transition-colors text-gray-700 ${
                  isOpen 
                    ? 'w-full px-3 py-2 hover:bg-gray-200 rounded-lg' 
                    : 'p-3 hover:bg-gray-200 rounded-full'
                }`}
                title="搜索聊天"
              >
                <Search size={isOpen ? 18 : 22} />
                {isOpen && <span>搜索聊天</span>}
              </button>
            </div>

            {/* Content List (Visible only when open) */}
            {isOpen && (
              <div className="animate-in fade-in duration-300">
                {/* Projects Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between px-3 mb-2 group">
                      <h3 className="text-xs font-medium text-gray-500">项目</h3>
                      <button 
                        onClick={onCreateProject} 
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="新建项目"
                      >
                          <Plus size={14} />
                      </button>
                  </div>
                  
                  <div className="space-y-0.5">
                    {projects.map(project => {
                        const projectSessions = sessions.filter(s => s.projectId === project.id);
                        const isExpanded = expandedProjects[project.id];
                        
                        return (
                          <div key={project.id} className="group flex flex-col">
                            <div className="relative flex items-center">
                              <button 
                                  onClick={() => toggleProjectExpand(project.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                              >
                                  {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                  <Folder size={18} className={`flex-shrink-0 ${isExpanded ? 'text-blue-500' : 'text-gray-400'}`} />
                                  <span className="truncate flex-1 text-left font-medium">{project.name}</span>
                              </button>
                              <button
                                onClick={(e) => handleProjectMenuClick(e, project.id)}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-300 rounded text-gray-500 transition-opacity ${
                                  activeMenuProjectId === project.id ? 'opacity-100 bg-gray-200' : 'opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="ml-6 mt-0.5 border-l-2 border-gray-100 pl-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                                {projectSessions.length === 0 ? (
                                  <div className="px-3 py-1.5 text-xs text-gray-400 italic">空</div>
                                ) : (
                                  projectSessions.map(session => (
                                      <div key={session.id} className="group relative">
                                        <button 
                                          onClick={() => onSelectSession(session.id)}
                                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors text-gray-700 group ${
                                            currentSessionId === session.id ? 'bg-gray-200' : 'hover:bg-gray-200'
                                          }`}
                                        >
                                          <span className="truncate text-left flex-1 pr-6 text-sm">{session.title}</span>
                                        </button>
                                        <button
                                          onClick={(e) => handleSessionMenuClick(e, session.id)}
                                          className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-300 rounded text-gray-500 transition-opacity ${
                                            activeMenuSessionId === session.id ? 'opacity-100 bg-gray-200' : 'opacity-0 group-hover:opacity-100'
                                          }`}
                                        >
                                          <MoreHorizontal size={14} />
                                        </button>
                                      </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                    })}
                  </div>
                </div>

                {/* Regular History Section */}
                <div className="pt-2">
                  <h3 className="px-3 text-xs font-medium text-gray-500 mb-2">你的聊天</h3>
                  <div className="space-y-0.5 flex flex-col">
                      {unprojectedSessions.map((session) => (
                        <div key={session.id} className="group relative">
                          <button 
                            onClick={() => onSelectSession(session.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 group ${
                              currentSessionId === session.id ? 'bg-gray-200' : 'hover:bg-gray-200'
                            }`}
                          >
                            <MessageSquare size={16} className={`flex-shrink-0 ${currentSessionId === session.id ? 'text-gray-800' : 'text-gray-500'}`} />
                            <span className="truncate text-left flex-1 pr-6">{session.title}</span>
                          </button>
                          
                          <button
                            onClick={(e) => handleSessionMenuClick(e, session.id)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-300 rounded text-gray-500 transition-opacity ${
                              activeMenuSessionId === session.id ? 'opacity-100 bg-gray-200' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      ))}
                      {unprojectedSessions.length === 0 && <div className="px-3 text-gray-400 text-xs italic">暂无历史记录</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className={`p-3 border-t border-gray-200 mt-auto flex flex-col items-center gap-2`}>
            
            <button className={`w-full flex items-center gap-3 transition-colors ${isOpen ? 'px-2 py-2 hover:bg-gray-200 rounded-lg' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                JO
              </div>
              {isOpen && (
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">Jome Lili</div>
                  <div className="text-xs text-gray-500">免费版</div>
                </div>
              )}
              {isOpen && (
                <div className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 bg-white hover:bg-gray-50">
                  升级
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        sessions={sessions}
        onSelectSession={onSelectSession}
      />

      {/* Menus using Portal */}
      {activeMenuProjectId && projectMenuPosition && createPortal(
        <div 
          ref={menuRef}
          className="fixed z-[9999] w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left"
          style={{ top: projectMenuPosition.top, left: projectMenuPosition.left }}
        >
          {(() => {
            const project = projects.find(p => p.id === activeMenuProjectId);
            if (!project) return null;
            return (
              <div className="p-1">
                 <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 mb-1 truncate">{project.name}</div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onRenameProject(project); setActiveMenuProjectId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                 >
                    <Pencil size={16} />
                    <span>重命名项目</span>
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); setActiveMenuProjectId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
                 >
                    <Trash2 size={16} />
                    <span>删除项目</span>
                 </button>
              </div>
            );
          })()}
        </div>,
        document.body
      )}

      {activeMenuSessionId && sessionMenuPosition && createPortal(
        <div 
          ref={menuRef}
          className="fixed z-[9999] w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left p-1"
          style={{ top: sessionMenuPosition.top, left: sessionMenuPosition.left }}
        >
          {(() => {
            const session = sessions.find(s => s.id === activeMenuSessionId);
            if (!session) return null;
            return (
              <>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onRenameSession(session); setActiveMenuSessionId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl text-left"
                 >
                    <Pencil size={18} className="text-gray-500" />
                    <span>重命名</span>
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMoveToProject(session); setActiveMenuSessionId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl text-left justify-between"
                 >
                    <div className="flex items-center gap-2">
                       <FolderInput size={18} className="text-gray-500" />
                       <span>移至项目</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                 </button>
                 <div className="h-px bg-gray-100 my-1 mx-2" />
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); setActiveMenuSessionId(null); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl text-left"
                 >
                    <Trash2 size={18} />
                    <span>删除</span>
                 </button>
              </>
            );
          })()}
        </div>,
        document.body
      )}
    </>
  );
};

export default Sidebar;
