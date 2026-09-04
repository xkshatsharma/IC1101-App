/**
 * PubMed API Service
 * Handles medical research paper searches via NCBI E-utilities
 */

const PUBMED_API_KEY = import.meta.env.VITE_PUBMED_API_KEY;
const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export const pubmedService = {
  /**
   * Search PubMed for research papers
   * @param {string} query - Search term (e.g., "diabetes treatment")
   * @returns {Promise<Array>} Array of paper objects with title, authors, journal, date, pmid
   */
  async searchPapers(query) {
    try {
      if (!PUBMED_API_KEY) {
        console.error('❌ PubMed API key not configured in .env.local');
        throw new Error('PubMed API key not configured');
      }

      console.log('🔍 Searching PubMed for:', query);
      console.log('🔑 API Key loaded:', PUBMED_API_KEY ? `${PUBMED_API_KEY.substring(0, 10)}...` : 'MISSING');

      // Step 1: Search for papers with JSON format
      const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=10&api_key=${PUBMED_API_KEY}`;

      console.log('📡 Search URL:', searchUrl);

      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('❌ PubMed search error:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          body: errorText.substring(0, 500)
        });
        throw new Error(`PubMed search failed: ${searchResponse.status} ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      console.log('✅ Search response:', searchData);

      const pmids = searchData.esearchresult?.idlist || [];
      console.log('📄 Found paper IDs:', pmids);

      if (pmids.length === 0) {
        console.log('⚠️ No papers found for query:', query);
        return [];
      }

      // Step 2: Fetch summaries for the papers with JSON format
      const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json&api_key=${PUBMED_API_KEY}`;

      console.log('📡 Summary URL:', summaryUrl);

      const summaryResponse = await fetch(summaryUrl);

      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        console.error('❌ PubMed summary error:', {
          status: summaryResponse.status,
          statusText: summaryResponse.statusText,
          body: errorText.substring(0, 500)
        });
        throw new Error(`PubMed summary failed: ${summaryResponse.status} ${summaryResponse.statusText}`);
      }

      const summaryData = await summaryResponse.json();
      console.log('✅ Summary response:', summaryData);

      const papers = [];

      // Extract paper information
      pmids.forEach((pmid) => {
        const doc = summaryData.result?.[pmid];
        if (doc) {
          const authors = doc.authors
            ? doc.authors.map((a) => a.name).slice(0, 3).join(', ') + (doc.authors.length > 3 ? ' et al.' : '')
            : 'Unknown authors';

          papers.push({
            pmid,
            title: doc.title || 'Untitled',
            authors,
            journal: doc.source || 'Unknown journal',
            date: doc.pubdate || 'Unknown date',
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          });
        }
      });

      console.log('✅ Parsed papers:', papers.length, papers);
      return papers;
    } catch (error) {
      console.error('❌ PubMed API error:', {
        message: error.message,
        stack: error.stack,
        query: query
      });
      throw error;
    }
  },
};
