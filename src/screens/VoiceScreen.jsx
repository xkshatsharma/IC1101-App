import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  RotateCw,
  Mic,
  Keyboard,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import PlasmaOrb from '../components/PlasmaOrb';
import { speechService } from '../services/speech';

export default function VoiceScreen({
  initialPrompt = '',
  onNavigateToHome,
  onNavigateToChat
}) {
  const [promptText, setPromptText] = useState(initialPrompt);
  const [isListening, setIsListening] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const inputRef = useRef(null);

  // If an initial prompt was passed from HomeScreen, show it
  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
    }
  }, [initialPrompt]);

  // Start speech recognition when listening is activated
  useEffect(() => {
    let timer;
    if (isListening) {
      const success = speechService.startListening({
        onResult: (text) => {
          setPromptText(text);
          // Automatically submit after a brief pause
          timer = setTimeout(() => {
            if (text.trim().length > 0) {
              handleSubmitPrompt(text);
            }
          }, 1200);
        },
        onInterim: (interim) => {
          setPromptText(interim);
        },
        onError: (err) => {
          console.log('Voice input notice:', err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      if (!success) {
        setIsListening(false);
      }
    }

    return () => {
      speechService.stopListening();
      if (timer) clearTimeout(timer);
    };
  }, [isListening]);

  // Fallback simulator for preview if microphone hardware is unavailable
  // REMOVED: No auto-generation of prompts

  // Functional refresh handler
  const handleRefresh = () => {
    setIsCalibrating(true);
    setPromptText('');
    setTypedInput('');
    setIsListening(false);
    speechService.stopListening();

    // Show feedback toast
    setToastMessage('Session recalibrated & reset');
    setTimeout(() => setToastMessage(''), 2500);

    setTimeout(() => {
      setIsCalibrating(false);
    }, 800);
  };

  // Submit prompt and smoothly navigate to Screen 3 (Chat)
  const handleSubmitPrompt = (textToSend) => {
    const finalMsg = textToSend || promptText || "Hello ASH";
    speechService.stopListening();
    setIsListening(false);
    onNavigateToChat(finalMsg);
  };

  const handleMicPress = () => {
    // Only toggle listening - do NOT auto-submit
    // User must explicitly send via the mic button or keyboard
    setIsListening(!isListening);
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none"
      style={{
        paddingTop: `calc(1.5rem + var(--safe-area-inset-top, 0px))`,
        paddingBottom: `calc(1.75rem + var(--safe-area-inset-bottom, 0px))`,
        paddingLeft: `calc(1.25rem + var(--safe-area-inset-left, 0px))`,
        paddingRight: `calc(1.25rem + var(--safe-area-inset-right, 0px))`
      }}
    >

      {/* Top Header Bar (No fake status bars) */}
      <div className="flex items-center justify-between z-20 pt-1">
        {/* Back Arrow (Returns to Screen 1) */}
        <button
          onClick={onNavigateToHome}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-95 transition-all shadow-sm"
          aria-label="Back to Home"
        >
          <ChevronLeft size={22} className="-ml-0.5" />
        </button>

        {/* ASH 1.0 | Beta Pill */}
        <div className="glass-pill px-3.5 py-1 rounded-full flex items-center space-x-1.5 border border-purple-500/20 shadow-[0_0_15px_rgba(142,45,226,0.15)]">
          <span className="text-[12px] font-semibold text-white tracking-wide">ASH 1.0</span>
          <span className="text-[10px] text-white/30">|</span>
          <span className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider bg-fuchsia-500/20 px-1.5 py-0.5 rounded-full">
            Beta
          </span>
        </div>

        {/* Functional Refresh Button */}
        <button
          onClick={handleRefresh}
          className={`w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-90 transition-all ${isCalibrating ? 'rotate-180 text-fuchsia-300 scale-110' : ''
            }`}
          title="Reset & Recalibrate Session"
          aria-label="Refresh Session"
        >
          <RotateCw size={17} className={isCalibrating ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Recalibration Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#1A1429]/90 border border-purple-400/40 text-purple-200 text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Centerpiece: Glowing Purple Energy Orb (~160px) */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-3 z-10">
        <PlasmaOrb
          size={168}
          isListening={isListening}
          isCalibrating={isCalibrating}
          onClick={handleMicPress}
        />

        {/* Dynamic User's Typed / Heard Prompt Display */}
        <div className="w-full max-w-[320px] min-h-[70px] mt-6 px-2 text-center flex items-center justify-center">
          {promptText ? (
            <p className="text-[14px] leading-relaxed text-white/90 font-normal line-clamp-3 transition-opacity duration-300">
              "{promptText}"
            </p>
          ) : (
            <p className="text-[13px] text-white/40 italic font-normal">
              {isListening ? "Listening to your voice..." : "Tap the orb or mic to speak..."}
            </p>
          )}
        </div>

        {/* "I'm Listening" Label with Sound Wave Indicator */}
        <div className="mt-3 flex items-center space-x-2">
          {isListening ? (
            <div className="flex items-center space-x-1 h-3">
              <span className="w-1 h-2 bg-fuchsia-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
              <span className="w-1 h-3 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-5 bg-purple-300 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              <span className="w-1 h-2 bg-fuchsia-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
            </div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-[#B24BF3] animate-ping" />
          )}

          <span className="text-[13px] font-medium text-white/60 tracking-tight">
            {isListening ? "I'm Listening" : promptText ? "Prompt Ready" : "ASH Voice Ready"}
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full flex items-center justify-between px-2 pt-2 z-20">

        {/* Left Spacer to maintain centering */}
        <div className="w-12 h-12" />

        {/* Center: Large Glowing Purple Mic Button (~68px) with Pulsing Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Glow Rings */}
          <div className={`absolute w-20 h-20 rounded-full bg-[#B24BF3]/25 blur-lg ${isListening ? 'animate-ping' : 'animate-pulse'}`} />
          <div className={`absolute w-24 h-24 rounded-full border border-[#B24BF3]/30 ${isListening ? 'scale-110 opacity-80' : 'opacity-40'} transition-all duration-500`} />

          {/* Main Action Button */}
          <button
            onClick={handleMicPress}
            className={`relative z-10 w-[66px] h-[66px] rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-[0_0_28px_rgba(178,75,243,0.7)] ${isListening
              ? 'bg-gradient-to-tr from-[#E471ED] to-[#B24BF3] scale-105'
              : 'bg-gradient-to-tr from-[#4A00E0] via-[#8E2DE2] to-[#B24BF3] hover:scale-105 active:scale-95'
              }`}
            aria-label="Toggle Microphone or Submit"
          >
            {promptText && !isListening ? (
              <Send size={24} className="translate-x-0.5 text-white" />
            ) : (
              <Mic size={26} className="text-white" />
            )}
          </button>
        </div>

        {/* Right: Keyboard Toggle Icon */}
        <button
          onClick={() => {
            setKeyboardOpen(true);
            setTimeout(() => inputRef.current?.focus(), 150);
          }}
          className="w-12 h-12 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-95 transition-all"
          aria-label="Type Prompt"
        >
          <Keyboard size={20} />
        </button>
      </div>

      {/* Keyboard Interactive Typing Drawer Modal */}
      {keyboardOpen && (
        <div className="absolute inset-x-3 bottom-4 z-50 rounded-[28px] glass-panel p-4 border border-[#B24BF3]/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="text-xs font-semibold text-purple-300 flex items-center space-x-1.5">
              <Sparkles size={13} />
              <span>Input Prompt for ASH</span>
            </span>
            <button
              onClick={() => setKeyboardOpen(false)}
              className="text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <textarea
            ref={inputRef}
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type your question or request..."
            rows={3}
            className="w-full bg-black/40 text-white placeholder-white/30 text-sm rounded-xl p-3 border border-white/10 focus:outline-none focus:border-[#B24BF3] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typedInput.trim()) {
                  handleSubmitPrompt(typedInput.trim());
                  setKeyboardOpen(false);
                }
              }
            }}
          />

          <div className="flex items-center justify-end mt-3 pt-1">
            <button
              onClick={() => {
                if (typedInput.trim()) {
                  handleSubmitPrompt(typedInput.trim());
                  setKeyboardOpen(false);
                }
              }}
              disabled={!typedInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#B24BF3] text-white text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-40 hover:opacity-95 active:scale-95 transition-all shadow-[0_0_15px_rgba(178,75,243,0.4)]"
            >
              <span>Send to Chat</span>
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
