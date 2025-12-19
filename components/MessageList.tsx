import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change (e.g., streaming)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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