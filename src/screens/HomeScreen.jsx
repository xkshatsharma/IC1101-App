import React, { useState } from 'react';
import {
  Mic,
  Search,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import EarthGlobe from '../components/EarthGlobe';

// ─── Constants ───
const FEATURE_CARD_RADIUS = 24;
const CARD_BG = 'rgba(255,255,255,0.04)';
const CARD_BORDER = 'rgba(178,75,243,0.25)';

// ─── Reusable Card Component ───
function FeatureCard({ icon: Icon, label, onPress, style = {} }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onClick={onPress}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        backgroundColor: CARD_BG,
        borderRadius: FEATURE_CARD_RADIUS,
        border: `1px solid ${CARD_BORDER}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 150ms ease',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        ...style,
      }}
    >
      {/* Icon container — 48px circle, FULLY inside padding */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(178,75,243,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color="#B24BF3" strokeWidth={2} />
      </div>

      {/* Label — inside padding, never clipped */}
      <p style={{
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        margin: 0,
        flexShrink: 1,
        lineHeight: '1.3',
      }}>
        {label}
      </p>
    </div>
  );
}

export default function HomeScreen({
  onNavigateToVoice,
  onNavigateToChat,
  onNavigateToPlagiarism,
  onNavigateToResearch
}) {
  const [isGlobeFullscreen, setIsGlobeFullscreen] = useState(false);

  // When 3D Earth is opened, show only the solid fullscreen globe modal
  if (isGlobeFullscreen) {
    return (
      <EarthGlobe
        isFullscreen={true}
        onClose={() => setIsGlobeFullscreen(false)}
      />
    );
  }

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-y-auto px-5 select-none"
      style={{
        paddingTop: `calc(1.5rem + var(--safe-area-inset-top, 0px))`,
        paddingBottom: `calc(1.5rem + var(--safe-area-inset-bottom, 0px))`,
        paddingLeft: `calc(1.25rem + var(--safe-area-inset-left, 0px))`,
        paddingRight: `calc(1.25rem + var(--safe-area-inset-right, 0px))`
      }}
    >
      
      {/* Top Header Area: Greeting Left + 3D Earth Globe Thumbnail Right */}
      <div className="flex flex-col space-y-5">
        
        {/* Row 1: Good Morning Human + Crisp Rotating 3D Earth Thumbnail */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[17px] font-semibold text-white/90 tracking-tight">
              Good Morning Human
            </span>
          </div>

          {/* Crisp Photorealistic 3D Earth Thumbnail */}
          <EarthGlobe 
            isFullscreen={false}
            onToggleFullscreen={() => setIsGlobeFullscreen(true)}
          />
        </div>

        {/* Row 2: Headline + IC1101 Subtitle */}
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold leading-[1.14] tracking-tight font-display text-white">
            Intelligent Voice<br />Assistance
          </h1>
          <p className="text-[13px] text-purple-300/80 mt-1.5 font-medium tracking-wider uppercase">
            IC1101
          </p>
        </div>

        {/* ─── Grid Layout ─── */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          height: '340px'
        }}>
          {/* Voice Assistant — tall card, LEFT */}
          <FeatureCard
            label="Voice Assistant"
            icon={Mic}
            onPress={() => onNavigateToVoice()}
            style={{ flex: 1 }}
          />

          {/* RIGHT column: Research + Plagiarism stacked */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FeatureCard
              label="Research"
              icon={Search}
              onPress={() => onNavigateToResearch()}
              style={{ flex: 1 }}
            />
            <FeatureCard
              label="Plagiarism Check"
              icon={ShieldCheck}
              onPress={() => onNavigateToPlagiarism()}
              style={{ flex: 1 }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Input Bar: Perfectly Aligned, Fully Rounded Pill with Clean Mic Icon */}
      <div className="pt-5 z-20">
        <div 
          onClick={() => onNavigateToChat()}
          className="w-full h-14 rounded-full glass-card px-4 flex items-center justify-between cursor-pointer border border-white/15 hover:border-purple-400/40 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        >
          {/* Left: Message Icon + Placeholder */}
          <div className="flex items-center space-x-3 text-white/60">
            <MessageSquare size={17} className="text-[#B24BF3] flex-shrink-0" />
            <span className="text-[14px] font-medium text-white/70 group-hover:text-white transition-colors">
              Chat with ASH
            </span>
          </div>

          {/* Right: One Clean, Crisp Centered Microphone Circle Button */}
          <div className="w-10 h-10 rounded-full bg-[#B24BF3] flex items-center justify-center text-white shadow-[0_0_14px_rgba(178,75,243,0.5)] group-hover:scale-105 active:scale-95 transition-transform flex-shrink-0">
            <Mic size={18} className="text-white" />
          </div>
        </div>
      </div>

    </div>
  );
}
