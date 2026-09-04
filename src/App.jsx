import React, { useState } from 'react';
import PWAInstaller from './components/PWAInstaller';
import HomeScreen from './screens/HomeScreen';
import VoiceScreen from './screens/VoiceScreen';
import ChatScreen from './screens/ChatScreen';
import ResearchScreen from './screens/ResearchScreen';
import PlagiarismScreen from './screens/PlagiarismScreen';

export default function App() {
  // Screens: 'home', 'voice', 'chat', 'research', 'plagiarism'
  // Must open directly on 'home'
  const [currentScreen, setCurrentScreen] = useState('home');
  const [direction, setDirection] = useState('forward'); // 'forward' | 'back'
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  // Navigate to Voice Screen
  const handleNavigateToVoice = (prefilledPrompt = '') => {
    setDirection('forward');
    setSelectedPrompt(prefilledPrompt);
    setCurrentScreen('voice');
  };

  // Navigate to Chat Screen
  const handleNavigateToChat = (initialMsg = '') => {
    setDirection('forward');
    setChatInitialMessage(initialMsg);
    setCurrentScreen('chat');
  };

  // Navigate to Plagiarism Screen
  const handleNavigateToPlagiarism = () => {
    setDirection('forward');
    setCurrentScreen('plagiarism');
  };

  // Navigate to Research Screen
  const handleNavigateToResearch = (initialMsg = '') => {
    setDirection('forward');
    setChatInitialMessage(initialMsg);
    setCurrentScreen('research');
  };

  // Navigate Back to Home
  const handleNavigateBack = () => {
    setDirection('back');
    setCurrentScreen('home');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050508] flex flex-col overflow-hidden text-white">
      {/* Background Ambient Purple Glow */}
      <div className="ambient-glow-layer pointer-events-none">
        <div className="glow-orb-top" />
        <div className="glow-orb-bottom" />
        <div className="noise-overlay" />
      </div>

      <PWAInstaller />
      <div
        key={currentScreen}
        className={`relative z-10 w-full h-full flex flex-col flex-1 overflow-hidden ${
          direction === 'forward' ? 'screen-slide-right' : 'screen-slide-left'
        }`}
      >
        {/* SCREEN 1: Home */}
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigateToVoice={handleNavigateToVoice}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToResearch={handleNavigateToResearch}
            onNavigateToPlagiarism={handleNavigateToPlagiarism}
          />
        )}

        {/* SCREEN 2: Voice / Listening */}
        {currentScreen === 'voice' && (
          <VoiceScreen
            initialPrompt={selectedPrompt}
            onNavigateToHome={handleNavigateBack}
            onNavigateToChat={handleNavigateToChat}
          />
        )}

        {/* SCREEN 3: Chat */}
        {currentScreen === 'chat' && (
          <ChatScreen
            initialMessage={chatInitialMessage}
            onNavigateBack={handleNavigateBack}
            onNavigateToVoice={() => handleNavigateToVoice()}
          />
        )}

        {/* SCREEN 4: Research */}
        {currentScreen === 'research' && (
          <ResearchScreen
            onNavigateBack={handleNavigateBack}
          />
        )}

        {/* SCREEN 5: Dedicated Plagiarism Check */}
        {currentScreen === 'plagiarism' && (
          <PlagiarismScreen
            onNavigateToHome={handleNavigateBack}
          />
        )}
      </div>
    </div>
  );
}
