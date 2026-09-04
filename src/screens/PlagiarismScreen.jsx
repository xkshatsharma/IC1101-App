import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Send
} from 'lucide-react';

export default function PlagiarismScreen({ onNavigateToHome }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartAnalysis = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    // Simulate scanning and analysis progress
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        status: 'complete',
        message: 'Analysis complete — report coming soon',
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / 1024).toFixed(1) + ' KB',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 2200);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-y-auto select-none"
      style={{
        paddingTop: `calc(1rem + var(--safe-area-inset-top, 0px))`,
        paddingBottom: `calc(1.5rem + var(--safe-area-inset-bottom, 0px))`,
        paddingLeft: `calc(1.25rem + var(--safe-area-inset-left, 0px))`,
        paddingRight: `calc(1.25rem + var(--safe-area-inset-right, 0px))`
      }}
    >
      
      {/* Hidden file input — no browser UI visible */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Top Bar with Back Arrow */}
      <div className="flex items-center justify-between z-20 pt-1 pb-3 border-b border-white/5">
        <button
          onClick={onNavigateToHome}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-95 transition-all shadow-sm"
          aria-label="Back to Home"
        >
          <ChevronLeft size={22} className="-ml-0.5" />
        </button>

        <div className="text-center">
          <h2 className="text-[17px] font-semibold text-white tracking-tight">Plagiarism Check</h2>
          <span className="text-[10px] text-fuchsia-300/80 font-medium">IC1101 Originality Engine</span>
        </div>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
        
        {!selectedFile ? (
          /* State 1: Clean Upload Card — Compact Drop Zone */
          <div
            onClick={handleUploadClick}
            className="w-[calc(100%-40px)] rounded-[32px] px-6 glass-card border border-[#B24BF3]/35 hover:border-[#B24BF3]/80 cursor-pointer flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(74,0,224,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all group"
            style={{ height: '240px' }}
          >
            {/* Ambient inner soft purple glow */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#4A00E0]/30 via-[#8E2DE2]/40 to-[#E471ED]/30 flex items-center justify-center shadow-[0_0_30px_rgba(178,75,243,0.4)] group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-[#E471ED]" />
            </div>

            {/* Icon → Text spacing: 16px gap, then title & subtitle */}
            <div className="mt-4 space-y-2">
              <h3 className="text-[18px] font-semibold text-white tracking-tight">Upload File</h3>
              <p className="text-[12px] text-white/50">Tap to browse your device</p>
            </div>
          </div>
        ) : !analysisResult ? (
          /* State 2: Selected File Ready to Analyze or Loading */
          <div className="w-full max-w-[340px] space-y-5">
            
            {/* File Info Card */}
            <div className="rounded-[24px] p-5 glass-card border border-[#B24BF3]/40 shadow-lg">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-[#E471ED] flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[14px] font-semibold text-white truncate">{selectedFile.name}</h4>
                  <span className="text-[11px] text-white/50">{(selectedFile.size / 1024).toFixed(1)} KB · Ready</span>
                </div>
              </div>

              {/* Loading Indicator when Analyzing */}
              {isAnalyzing && (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200 font-medium flex items-center space-x-1.5">
                      <Sparkles size={13} className="animate-spin text-[#E471ED]" />
                      <span>Checking your document...</span>
                    </span>
                    <span className="text-white/50">Scanning</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4A00E0] via-[#8E2DE2] to-[#E471ED] rounded-full animate-pulse w-[75%]" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isAnalyzing && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 h-12 rounded-2xl glass-pill text-white/70 hover:text-white flex items-center justify-center space-x-1.5 text-xs font-medium active:scale-95 transition-all"
                >
                  <RotateCcw size={14} />
                  <span>Choose Another</span>
                </button>

                <button
                  onClick={handleStartAnalysis}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#4A00E0] to-[#B24BF3] text-white flex items-center justify-center space-x-2 text-xs font-semibold shadow-[0_0_20px_rgba(178,75,243,0.5)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span>Analyze</span>
                  <Send size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* State 3: Analysis Complete Result */
          <div className="w-full max-w-[340px] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded-[28px] p-6 glass-card border border-[#B24BF3]/50 shadow-[0_10px_40px_rgba(74,0,224,0.3)] text-center space-y-3">
              
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#10B981]/20 to-[#8E2DE2]/20 border border-[#10B981]/40 mx-auto flex items-center justify-center text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h3 className="text-[17px] font-semibold text-white tracking-tight">
                  {analysisResult.message}
                </h3>
                <p className="text-[11.5px] text-white/50 mt-1">
                  Document: {analysisResult.fileName}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                <span>Completed at {analysisResult.timestamp}</span>
                <span className="text-purple-300 font-medium">Originality Scan</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full h-12 rounded-2xl glass-card border border-purple-400/30 text-white flex items-center justify-center space-x-2 text-xs font-semibold hover:border-purple-400/60 active:scale-95 transition-all shadow-sm"
            >
              <RotateCcw size={14} />
              <span>Check Another File</span>
            </button>
          </div>
        )}

      </div>

      {/* Bottom Hint */}
      <div className="z-20 text-center">
        <span className="text-[11px] text-white/40">
          Supported file formats: PDF, DOCX, TXT
        </span>
      </div>
    </div>
  );
}
