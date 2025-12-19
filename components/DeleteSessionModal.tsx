
import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-red-600">
             <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 size={24} />
             </div>
             <h2 className="text-lg font-semibold text-gray-900">删除聊天？</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          这将从您的历史记录中删除该聊天内容。此操作无法撤销。
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSessionModal;
