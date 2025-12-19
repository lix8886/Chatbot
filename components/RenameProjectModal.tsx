import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
  project: Project | null;
}

const RenameProjectModal: React.FC<RenameProjectModalProps> = ({ isOpen, onClose, onRename, project }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && project && inputRef.current) {
      setName(project.name);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(project.id, name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">重命名项目</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6 text-gray-800 placeholder-gray-400"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameProjectModal;