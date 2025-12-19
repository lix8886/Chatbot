
import React from 'react';
import { X, Folder, Globe } from 'lucide-react';
import { Project, ChatSession } from '../types';

interface MoveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (sessionId: string, projectId: string | undefined) => void;
  session: ChatSession | null;
  projects: Project[];
}

const MoveToProjectModal: React.FC<MoveToProjectModalProps> = ({ isOpen, onClose, onMove, session, projects }) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">移至项目</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">选择目标项目</p>
          
          <button 
            onClick={() => { onMove(session.id, undefined); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left group ${!session.projectId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <div className={`p-2 rounded-lg ${!session.projectId ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
               <Globe size={18} />
            </div>
            <div className="flex-1">
                <div className="font-medium">无项目 (常规记录)</div>
                <div className="text-xs opacity-70">将会话从项目中移出</div>
            </div>
          </button>

          {projects.map(project => (
            <button 
              key={project.id}
              onClick={() => { onMove(session.id, project.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left group ${session.projectId === project.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <div className={`p-2 rounded-lg ${session.projectId === project.id ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                 <Folder size={18} />
              </div>
              <div className="flex-1">
                  <div className="font-medium truncate">{project.name}</div>
              </div>
            </button>
          ))}

          {projects.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              暂无可选项目，请先创建项目。
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToProjectModal;
