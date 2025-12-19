import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ isOpen, onClose, onConfirm, projectName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-red-600">
             <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={24} />
             </div>
             <h2 className="text-lg font-semibold text-gray-900">删除项目？</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          您确定要删除项目 <span className="font-semibold text-gray-900">"{projectName}"</span> 吗？<br/>
          此操作无法撤销，项目中的所有内容将被永久移除。
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;