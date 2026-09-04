import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  ExternalLink,
  Loader
} from 'lucide-react';
import { pubmedService } from '../services/pubmedService';

export default function ResearchScreen({ onNavigateBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const searchInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) return;

    setIsLoading(true);
    setError('');
    setHasSearched(true);
    setPapers([]);

    try {
      const results = await pubmedService.searchPapers(query);
      setPapers(results);

      if (results.length === 0) {
        setError('No research papers found for your query.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search PubMed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaperClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      style={{
        paddingTop: `calc(1rem + var(--safe-area-inset-top, 0px))`,
        paddingBottom: `calc(1rem + var(--safe-area-inset-bottom, 0px))`,
        paddingLeft: `calc(1.25rem + var(--safe-area-inset-left, 0px))`,
        paddingRight: `calc(1.25rem + var(--safe-area-inset-right, 0px))`
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-20 pt-1 pb-3 border-b border-white/5">
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:border-purple-400/40 active:scale-95 transition-all shadow-sm"
          aria-label="Back"
        >
          <ChevronLeft size={22} className="-ml-0.5" />
        </button>

        <div className="text-center">
          <h2 className="text-[16px] font-semibold text-white tracking-tight">Research</h2>
          <span className="text-[10px] text-fuchsia-300/80 font-medium">IC1101 Medical Papers</span>
        </div>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="pt-4 pb-4 z-10">
        <div className="flex items-center gap-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medical research..."
            className="flex-1 h-11 rounded-full px-4 text-[14px] font-normal text-white placeholder-gray-400 bg-[rgba(26,26,36,0.6)] border border-purple-400/40 focus:outline-none focus:border-purple-400/70 focus:shadow-[0_0_20px_rgba(178,75,243,0.3)] transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-[#4A00E0] to-[#B24BF3] flex items-center justify-center text-white shadow-[0_0_15px_rgba(178,75,243,0.6)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Search"
          >
            {isLoading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>
      </form>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {!hasSearched ? (
          /* Initial state */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-400/20 flex items-center justify-center text-purple-300">
              <Search size={20} />
            </div>
            <p className="text-sm text-white/70">
              Search for medical research topics like "diabetes treatment" or "cancer immunotherapy"
            </p>
          </div>
        ) : isLoading ? (
          /* Loading state */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Loader size={24} className="animate-spin text-purple-400" />
            <p className="text-sm text-white/70">Searching PubMed...</p>
          </div>
        ) : error ? (
          /* Error state with retry button */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-400/20 flex items-center justify-center text-red-300">
              <Search size={20} />
            </div>
            <p className="text-sm text-white/70">{error}</p>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="mt-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#4A00E0] to-[#B24BF3] text-white text-xs font-medium shadow-[0_0_15px_rgba(178,75,243,0.6)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        ) : papers.length === 0 ? (
          /* No results state */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-400/20 flex items-center justify-center text-purple-300">
              <Search size={20} />
            </div>
            <p className="text-sm text-white/70">No research papers found</p>
          </div>
        ) : (
          /* Results */
          <div className="space-y-3 pb-4">
            {papers.map((paper) => (
              <div
                key={paper.pmid}
                onClick={() => handlePaperClick(paper.url)}
                className="rounded-[20px] p-4 glass-card border border-[#B24BF3]/30 hover:border-[#B24BF3]/60 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md"
              >
                <div className="space-y-2">
                  {/* Title */}
                  <h3 className="text-[14px] font-semibold text-white leading-tight line-clamp-2">
                    {paper.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-[11px] text-white/60 line-clamp-1">
                    {paper.authors}
                  </p>

                  {/* Journal and Date */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-white/50">
                      {paper.journal} · {paper.date}
                    </span>
                    <ExternalLink size={12} className="text-purple-400/60 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
