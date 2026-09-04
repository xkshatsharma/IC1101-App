import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Mic,
  Send,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatService } from '../services/chatService';
import { rateLimitService } from '../services/rateLimitService';

export default function ChatScreen({
  initialMessage = '',
  onNavigateBack,
  onNavigateToVoice
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Clean AI reply: remove thinking blocks, reasoning prefixes, etc.
   */
  const cleanReply = (text) => {
    if (!text) return text;

    let cleaned = text;

    // Remove thinking/reasoning blocks enclosed in tags or obvious markers
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    cleaned = cleaned.replace(/\[thinking\][\s\S]*?\[\/thinking\]/gi, '');
    cleaned = cleaned.replace(/```thinking[\s\S]*?```/gi, '');

    // Remove leading text matching common reasoning patterns
    const reasoningPatterns = [
      /^[\s\n]*here's\s+(?:a\s+)?(?:my\s+)?(?:thinking|reasoning|approach)[\s\S]*?(?:\n\n|$)/i,
      /^[\s\n]*(?:thinking|reasoning|analysis)[\s\S]*?(?:\n\n|$)/i,
      /^[\s\n]*let me\s+(?:think|reason)[\s\S]*?(?:\n\n|$)/i,
      /^[\s\n]*blocks\s+INCLUDING[\s\S]*?(?:\n\n|$)/i,
    ];

    for (const pattern of reasoningPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Remove first paragraph before first blank line (common thinking marker)
    const firstBlankLineMatch = cleaned.match(/^[^\n]*\n\s*\n/);
    if (firstBlankLineMatch) {
      const firstPara = firstBlankLineMatch[0];
      // Only remove if it looks like internal processing (has code-like syntax or is very short)
      if (firstPara.includes('regex') || firstPara.includes('```') || firstPara.includes('//') || firstPara.length < 50) {
        cleaned = cleaned.substring(firstPara.length);
      }
    }

    // Trim leading/trailing whitespace and newlines
    cleaned = cleaned.trim();

    return cleaned;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Handle initial message coming from HomeScreen or VoiceScreen
  useEffect(() => {
    if (initialMessage) {
      const userMsgId = 'user-' + Date.now();
      const initialUserMsg = {
        id: userMsgId,
        sender: 'user',
        text: initialMessage,
        timestamp: 'Just now'
      };

      setMessages([initialUserMsg]);
      triggerAIResponse(initialMessage);
    }
  }, [initialMessage]);

  // Trigger AI response via unified chat service (Gemini with Groq fallback)
  const triggerAIResponse = async (userPrompt) => {
    setIsThinking(true);

    try {
      const response = await chatService.sendMessage(userPrompt);
      const aiMsgId = 'ai-' + Date.now();

      // Clean the reply before displaying
      const cleanedText = cleanReply(response.text);

      const aiMsg = {
        id: aiMsgId,
        sender: 'ai',
        text: cleanedText,
        provider: response.provider || 'ASH',
        hasCard: false,
        cardData: null,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    } catch (error) {
      setIsThinking(false);
      const errorMsg = {
        id: 'error-' + Date.now(),
        sender: 'ai',
        text: 'Both engines are resting. Please try again in a bit.',
        provider: 'ASH',
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMsg]);
      console.error('Chat error:', error.message);
    }
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    // Check rate limit
    if (rateLimitService.isLimitExceeded()) {
      const limitMsg = {
        id: 'limit-' + Date.now(),
        sender: 'ai',
        text: "You've reached today's chat limit (30 messages). Come back tomorrow to continue chatting!",
        provider: 'ASH',
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, limitMsg]);
      return;
    }

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    rateLimitService.incrementCounter();
    triggerAIResponse(text);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none"
      style={{
        paddingTop: `calc(1.5rem + var(--safe-area-inset-top, 0px))`,
        paddingBottom: `calc(1rem + var(--safe-area-inset-bottom, 0px))`,
        paddingLeft: `calc(1rem + var(--safe-area-inset-left, 0px))`,
        paddingRight: `calc(1rem + var(--safe-area-inset-right, 0px))`
      }}
    >
      
      {/* Top Header Bar (No fake status bars) */}
      <div className="flex items-center justify-between z-20 pt-1 pb-2 border-b border-white/5">
        {/* Back Arrow */}
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-95 transition-all shadow-sm"
          aria-label="Back"
        >
          <ChevronLeft size={22} className="-ml-0.5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-[16px] font-semibold text-white tracking-tight">ASH Chat</h2>
          <span className="text-[10px] text-fuchsia-300/80 font-medium">IC1101 Intelligence</span>
        </div>

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-95 transition-all"
            aria-label="Options"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-44 rounded-2xl glass-panel p-2 z-50 border border-purple-400/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setMessages([]);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                Clear Chat
              </button>
              <button
                onClick={() => {
                  triggerAIResponse("Who are you?");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-purple-300 hover:text-purple-200 hover:bg-white/10 rounded-xl transition-colors"
              >
                Ask "Who are you?"
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Thread Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-400/20 flex items-center justify-center text-purple-300">
              <Sparkles size={20} />
            </div>
            <p className="text-sm text-white/70">
              Say hello, ask a question, or request assistance.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            {msg.sender === 'user' ? (
              /* User Message: Purple Gradient Bubble on the Right */
              <div className="max-w-[84%] rounded-[22px] rounded-br-[4px] px-4 py-3 bg-gradient-to-r from-[#4A00E0] via-[#8E2DE2] to-[#B24BF3] text-white shadow-[0_4px_20px_rgba(142,45,226,0.35)]">
                <p className="text-[14px] leading-relaxed font-normal">{msg.text}</p>
              </div>
            ) : (
              /* AI Response: Dark Translucent Bubble on the Left */
              <div className="max-w-[92%] flex items-start space-x-2.5">
                {/* Mini Plasma Orb Avatar */}
                <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-[#4A00E0] via-[#8E2DE2] to-[#E471ED] flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(178,75,243,0.5)]">
                  <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                    <Sparkles size={12} className="text-[#E471ED]" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {/* AI Text Bubble with Markdown */}
                  <div className="rounded-[22px] rounded-tl-[4px] px-4 py-3 glass-panel border border-[#B24BF3]/25 text-white/90 shadow-md max-w-[85%]">
                    <div className="text-[14px] leading-[1.5]">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-[18px] font-bold text-white mt-3 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-[16px] font-bold text-white mt-2.5 mb-1.5" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-[15px] font-semibold text-white mt-2 mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-white/80" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="text-white/90" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#B24BF3] pl-3 my-2 italic text-white/70" {...props} />,
                          code: ({node, inline, ...props}) => inline
                            ? <code className="bg-black/30 px-1.5 py-0.5 rounded text-[12px] font-mono text-purple-300" {...props} />
                            : <code className="block bg-black/40 p-2 rounded-lg my-2 text-[12px] font-mono text-green-300 overflow-x-auto" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Rich Generated Card (if triggered) */}
                  {msg.hasCard && msg.cardData && (
                    <div className="rounded-[24px] overflow-hidden glass-card border border-[#B24BF3]/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-[#B24BF3]/60 group">
                      <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                          {msg.cardData.badge}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                      </div>

                      <div className="px-3">
                        <div 
                          className="relative w-full h-[155px] rounded-[18px] overflow-hidden flex items-center justify-center shadow-inner"
                          style={{ background: msg.cardData.gradient }}
                        >
                          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#E471ED]/40 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#4A00E0]/60 blur-xl" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          
                          <div className="relative z-10 text-center">
                            <Sparkles size={28} className="text-white/80 mx-auto mb-1 animate-pulse" />
                            <span className="text-[11px] font-medium text-white/70 tracking-wide uppercase">
                              Neural Render 4K
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-[13.5px] font-semibold text-white tracking-tight">
                            {msg.cardData.title}
                          </h4>
                          <span className="text-[11px] text-white/45 font-medium">
                            {msg.cardData.subtitle}
                          </span>
                        </div>

                        <button 
                          onClick={() => handleCopy(msg.id, msg.cardData.title)}
                          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8E2DE2] to-[#B24BF3] flex items-center justify-center text-white shadow-[0_0_12px_rgba(178,75,243,0.5)] hover:scale-105 active:scale-95 transition-transform"
                          title="Copy title"
                        >
                          {copiedId === msg.id ? <Check size={14} /> : <ArrowUpRight size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Action Bar (Copy) */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-[11px] text-white/40 hover:text-fuchsia-300 flex items-center space-x-1 transition-colors"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Provider Badge — subtle and small */}
                    {msg.provider && (
                      <span className="text-[10px] text-white/50 font-medium">
                        ASH · {msg.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* AI Thinking/Working Indicator */}
        {isThinking && (
          <div className="flex items-center space-x-2.5 pt-1">
            <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-[#4A00E0] via-[#8E2DE2] to-[#E471ED] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                <Sparkles size={12} className="text-[#E471ED] animate-spin" />
              </div>
            </div>

            <div className="rounded-[20px] rounded-tl-[4px] px-4 py-2.5 glass-panel border border-purple-500/20 flex items-center space-x-2">
              <span className="text-[12px] text-purple-200/70 font-medium">ASH is thinking</span>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.3s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Field + Purple Mic / Send Button */}
      <div className="pt-2 z-20">
        <div className="w-full h-[52px] rounded-full pl-4 pr-1.5 flex items-center justify-between border border-purple-400/40 focus-within:border-purple-400/70 focus-within:shadow-[0_0_20px_rgba(178,75,243,0.3)] transition-all" style={{ background: 'rgba(26, 26, 36, 0.6)' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask anything..."
            className="flex-1 text-white placeholder-gray-400 text-[14px] font-normal focus:outline-none pr-2"
          />

          {inputValue.trim() ? (
            <button
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4A00E0] to-[#B24BF3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(178,75,243,0.6)] hover:scale-105 active:scale-95 transition-transform"
              aria-label="Send message"
            >
              <Send size={16} className="translate-x-0.5" />
            </button>
          ) : (
            <button
              onClick={onNavigateToVoice}
              className="w-10 h-10 rounded-full bg-[#B24BF3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(178,75,243,0.6)] hover:scale-105 active:scale-95 transition-transform"
              aria-label="Voice input"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
