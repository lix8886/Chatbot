import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Mic, 
  AudioLines, 
  Paperclip, 
  Image as ImageIcon, 
  Lightbulb, 
  Telescope, 
  ShoppingBag, 
  MoreHorizontal, 
  BookOpen, 
  Globe, 
  PenTool, 
  ChevronRight,
  MicOff
} from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isCentered?: boolean;
}

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; hasSubmenu?: boolean }> = ({ icon, label, hasSubmenu }) => (
  <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 text-gray-700 text-sm transition-colors text-left">
    <div className="flex items-center gap-3">
      <span className="text-gray-600">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    {hasSubmenu && <ChevronRight size={16} className="text-gray-400" />}
  </button>
);

const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled, isCentered }) => {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize logic for textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset to calculate true scrollHeight
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on stop
        }
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别功能。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;

    const previousInput = input;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');

      const separator = (previousInput && !previousInput.match(/\s$/)) ? ' ' : '';
      setInput(previousInput + separator + transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setIsListening(false);
        return;
      }
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className={`w-full max-w-3xl mx-auto px-4 ${isCentered ? '' : 'mb-4'}`}>
      <div className={`relative flex items-end gap-2 bg-[#f4f4f4] rounded-[28px] px-4 py-2.5 shadow-sm transition-all ${isListening ? 'ring-2 ring-red-100 bg-white' : 'focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200'}`}>
        
        {/* Plus Button & Menu */}
        <div className="relative flex-shrink-0 mb-0.5">
          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="absolute bottom-14 left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <MenuItem icon={<Paperclip size={20} />} label="添加照片和文件" />
              <div className="h-px bg-gray-100 my-1 mx-4" />
              <MenuItem icon={<ImageIcon size={20} />} label="创建图片" />
              <MenuItem icon={<Lightbulb size={20} />} label="思考" />
              <MenuItem icon={<Telescope size={20} />} label="深度研究" />
              <MenuItem icon={<ShoppingBag size={20} />} label="智能购物" />
              
              <div className="relative group">
                <MenuItem icon={<MoreHorizontal size={20} />} label="更多" hasSubmenu />
                <div className="hidden group-hover:block absolute left-full bottom-0 ml-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <MenuItem icon={<BookOpen size={20} />} label="研究与学习" />
                  <MenuItem icon={<Globe size={20} />} label="网页搜索" />
                  <MenuItem icon={<PenTool size={20} />} label="画布" />
                </div>
              </div>
            </div>
          )}
          
          <button 
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 text-gray-500 hover:bg-gray-200 rounded-full transition-all duration-200 ${isMenuOpen ? 'bg-gray-200 rotate-90 text-gray-900' : ''}`}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "正在聆听..." : "询问任何问题"}
          disabled={disabled}
          className="flex-1 max-h-[200px] bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-2.5 px-1 text-gray-800 placeholder-gray-500 leading-normal text-base break-words"
          rows={1}
        />

        {/* Right Actions */}
        <div className="flex items-center gap-1 mb-1">
          {(input.length === 0 || isListening) && (
             <button 
               onClick={handleMicClick}
               className={`p-2.5 rounded-full transition-colors ${
                 isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-md' 
                  : 'text-gray-500 hover:bg-gray-200'
               }`}
               title={isListening ? "停止录音" : "语音输入"}
             >
               {isListening ? <div className="w-5 h-5 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-sm" /></div> : <Mic size={20} />}
             </button>
          )}
          
          {!isListening && (
            input.length > 0 ? (
               <button 
                  onClick={handleSend}
                  disabled={disabled}
                  className="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
               >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm font-bold">↑</span>
                  </div>
               </button>
            ) : (
              <button className="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center">
                 <AudioLines size={20} />
              </button>
            )
          )}
        </div>
      </div>
      <div className="text-center mt-2 text-[11px] text-gray-400">
        Gemini 可能会犯错。请核查重要信息。
      </div>
    </div>
  );
};

export default InputArea;