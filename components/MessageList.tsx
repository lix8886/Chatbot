
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCw, SlidersHorizontal, Check } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  onRegenerate: (id: string) => void;
  onRate: (id: string, rating: 'liked' | 'disliked' | undefined) => void;
  isGenerating: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onRegenerate, onRate, isGenerating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to bottom when messages change (e.g., streaming)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-4 group">
            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-gray-100' : 'bg-transparent border border-gray-200'
            }`}>
              {msg.role === 'user' ? (
                 <User size={16} className="text-gray-600" />
              ) : (
                 <Bot size={16} className="text-blue-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 py-1">
              <div className="font-medium text-sm text-gray-900 mb-1">
                {msg.role === 'user' ? 'You' : 'Gemini'}
              </div>
              
              {msg.role === 'model' && !msg.text ? (
                <div className="flex items-center gap-1 h-6 pl-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              ) : (
                <div className="text-gray-800 leading-7 prose prose-sm max-w-none break-words">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}

              {/* Action Toolbar for Model Messages */}
              {msg.role === 'model' && msg.text && (
                <div className="flex items-center gap-1 mt-2 -ml-2">
                  <button 
                    onClick={() => handleCopy(msg.id, msg.text)} 
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                    title="复制"
                  >
                    {copiedId === msg.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => onRate(msg.id, msg.rating === 'liked' ? undefined : 'liked')} 
                    className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors ${msg.rating === 'liked' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`} 
                    title="好评"
                  >
                    <ThumbsUp size={16} fill={msg.rating === 'liked' ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => onRate(msg.id, msg.rating === 'disliked' ? undefined : 'disliked')} 
                    className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors ${msg.rating === 'disliked' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`} 
                    title="差评"
                  >
                    <ThumbsDown size={16} fill={msg.rating === 'disliked' ? "currentColor" : "none"} />
                  </button>
                  <button 
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                    title="修改回复 (演示)"
                    onClick={() => alert("修改回复功能暂未开放")}
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                  <button 
                    onClick={() => onRegenerate(msg.id)} 
                    disabled={isGenerating}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    title="重新生成"
                  >
                    <RotateCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Invisible element to scroll to */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};

export default MessageList;
