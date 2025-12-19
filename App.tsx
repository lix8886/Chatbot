
import React, { useState, useEffect, useRef } from 'react';
import { PanelLeftOpen, ChevronDown, Check, Zap, Brain, Leaf } from 'lucide-react';
import Sidebar from './components/Sidebar';
import InputArea from './components/InputArea';
import MessageList from './components/MessageList';
import CreateProjectModal from './components/CreateProjectModal';
import RenameProjectModal from './components/RenameProjectModal';
import DeleteProjectModal from './components/DeleteProjectModal';
import RenameSessionModal from './components/RenameSessionModal';
import DeleteSessionModal from './components/DeleteSessionModal';
import MoveToProjectModal from './components/MoveToProjectModal';
import { Message, ChatSession, Project } from './types';
import { streamGeminiResponse, generateChatTitle } from './services/geminiService';
import { 
  loadSessionsFromStore, 
  saveSessionsToStore, 
  loadProjectsFromStore, 
  saveProjectsToStore 
} from './store/chatStore';

const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: '速度最快，适合日常对话', icon: <Zap size={16} className="text-blue-500" /> },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: '最强模型，适合复杂逻辑', icon: <Brain size={16} className="text-purple-500" /> },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', desc: '极速响应，轻量任务', icon: <Leaf size={16} className="text-green-500" /> },
];

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  
  // Modals state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isRenameProjectModalOpen, setIsRenameProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [isRenameSessionModalOpen, setIsRenameSessionModalOpen] = useState(false);
  const [isDeleteSessionModalOpen, setIsDeleteSessionModalOpen] = useState(false);
  const [isMoveToProjectModalOpen, setIsMoveToProjectModalOpen] = useState(false);
  
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
  const [sessionToMove, setSessionToMove] = useState<ChatSession | null>(null);
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);

  // Initialize sessions from the store (localStorage)
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessionsFromStore());
  // Initialize projects
  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStore());
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // Active view
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle click outside model menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    if (isModelMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModelMenuOpen]);

  // Effect to automatically save sessions to store whenever they change
  useEffect(() => {
    saveSessionsToStore(sessions);
  }, [sessions]);

  // Effect to automatically save projects
  useEffect(() => {
    saveProjectsToStore(projects);
  }, [projects]);

  // Sync current messages to sessions state whenever messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prev) => 
        prev.map((session) => 
          session.id === currentSessionId 
            ? { ...session, messages: messages } 
            : session
        )
      );
    }
  }, [messages, currentSessionId]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsGenerating(false);
  };

  const selectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages);
      setIsGenerating(false);
    }
  };

  const handleCreateProject = (name: string) => {
    const newProject: Project = { id: Date.now().toString(), name };
    setProjects(prev => [...prev, newProject]);
  };

  const handleRequestDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) { setProjectToDelete(project); setIsDeleteProjectModalOpen(true); }
  };

  const handleConfirmDeleteProject = () => {
    if (projectToDelete) {
      setSessions(prev => prev.map(s => s.projectId === projectToDelete.id ? { ...s, projectId: undefined } : s));
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleRequestRenameProject = (project: Project) => {
    setProjectToRename(project);
    setIsRenameProjectModalOpen(true);
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const handleRequestRenameSession = (session: ChatSession) => {
    setSessionToRename(session);
    setIsRenameSessionModalOpen(true);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleRequestDeleteSession = (id: string) => {
    setSessionToDeleteId(id);
    setIsDeleteSessionModalOpen(true);
  };

  const handleConfirmDeleteSession = () => {
    if (sessionToDeleteId) {
      setSessions(prev => prev.filter(s => s.id !== sessionToDeleteId));
      if (currentSessionId === sessionToDeleteId) {
        startNewChat();
      }
      setIsDeleteSessionModalOpen(false);
      setSessionToDeleteId(null);
    }
  };

  const handleMoveSessionToProject = (sessionId: string, projectId: string | undefined) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, projectId } : s));
  };

  const handleSendMessage = async (text: string) => {
    let activeSessionId = currentSessionId;
    let isNewSession = false;

    if (!activeSessionId) {
      isNewSession = true;
      activeSessionId = Date.now().toString();
      const newSession: ChatSession = { id: activeSessionId, title: "New Chat", messages: [] };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(activeSessionId);
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    const currentMessages = isNewSession ? [] : messages;
    const newMessages = [...currentMessages, userMessage];
    setMessages(newMessages);
    setIsGenerating(true);

    const aiMessageId = (Date.now() + 1).toString();
    const initialAiMessage: Message = { id: aiMessageId, role: 'model', text: '', timestamp: Date.now() };
    setMessages(prev => [...prev, initialAiMessage]);

    try {
      const historyForApi = newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = await streamGeminiResponse(text, historyForApi, selectedModel.id);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: fullText } : msg));
      }
      if (isNewSession) {
        generateChatTitle(text, selectedModel.id).then(title => {
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title } : s));
        });
      }
    } catch (error) {
      console.error("Failed to generate", error);
      setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: "抱歉，发生了一些错误。请检查您的 API 密钥。" } : msg));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        onNewChat={startNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        projects={projects}
        onCreateProject={() => setIsCreateProjectModalOpen(true)}
        onDeleteProject={handleRequestDeleteProject}
        onRenameProject={handleRequestRenameProject}
        onDeleteSession={handleRequestDeleteSession}
        onRenameSession={handleRequestRenameSession}
        onMoveToProject={(s) => { setSessionToMove(s); setIsMoveToProjectModalOpen(true); }}
      />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-white z-10 h-[64px]">
          <div className="flex items-center gap-2 relative" ref={modelMenuRef}>
            <button 
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-lg font-medium text-gray-700 transition-colors ${isModelMenuOpen ? 'bg-gray-100' : ''}`}
            >
              <span>{selectedModel.name}</span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModelMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 mb-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">切换模型</span>
                </div>
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelMenuOpen(false);
                    }}
                    className={`w-full flex items-start gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selectedModel.id === model.id ? 'bg-gray-50' : ''}`}
                  >
                    <div className="mt-1">
                      {model.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${selectedModel.id === model.id ? 'text-gray-900' : 'text-gray-700'}`}>{model.name}</span>
                        {selectedModel.id === model.id && <Check size={16} className="text-blue-600" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{model.desc}</p>
                    </div>
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-2" />
                <div className="px-4 py-1">
                  <button className="text-xs text-blue-600 hover:underline font-medium">了解模型区别</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
              <h1 className="text-3xl font-medium text-gray-900 mb-8">有什么我可以帮您的吗？</h1>
              <InputArea onSend={handleSendMessage} disabled={isGenerating} isCentered={true} />
              <div className="mt-8 flex gap-2 flex-wrap justify-center max-w-2xl">
                 <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all" onClick={() => handleSendMessage("帮我做一个旅行计划")}>🏝️ 制定旅行计划</button>
                 <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all" onClick={() => handleSendMessage("解释一下量子纠缠")}>⚛️ 解释量子纠缠</button>
                 <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all" onClick={() => handleSendMessage("写一首关于秋天的诗")}>🍂 写一首诗</button>
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              <div className="w-full pb-6 pt-2">
                 <InputArea onSend={handleSendMessage} disabled={isGenerating} />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateProjectModal isOpen={isCreateProjectModalOpen} onClose={() => setIsCreateProjectModalOpen(false)} onCreate={handleCreateProject} />
      <RenameProjectModal isOpen={isRenameProjectModalOpen} onClose={() => setIsRenameProjectModalOpen(false)} onRename={handleRenameProject} project={projectToRename} />
      <DeleteProjectModal isOpen={isDeleteProjectModalOpen} onClose={() => setIsDeleteProjectModalOpen(false)} onConfirm={handleConfirmDeleteProject} projectName={projectToDelete?.name || ''} />
      <RenameSessionModal isOpen={isRenameSessionModalOpen} onClose={() => setIsRenameSessionModalOpen(false)} onRename={handleRenameSession} session={sessionToRename} />
      <DeleteSessionModal isOpen={isDeleteSessionModalOpen} onClose={() => setIsDeleteSessionModalOpen(false)} onConfirm={handleConfirmDeleteSession} />
      <MoveToProjectModal isOpen={isMoveToProjectModalOpen} onClose={() => setIsMoveToProjectModalOpen(false)} onMove={handleMoveSessionToProject} session={sessionToMove} projects={projects} />
    </div>
  );
};

export default App;
