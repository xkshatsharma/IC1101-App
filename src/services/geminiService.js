/**
 * Gemini API Service
 * Handles AI responses for chat via Google Gemini
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = 'You are ASH, an intelligent AI assistant made by IC1101. Be helpful, friendly and concise. Answer in a clean format.';

export const geminiService = {
  /**
   * Get AI response from Gemini API
   * @param {string} userMessage - User's message
   * @returns {Promise<{text: string, hasCard?: boolean, cardData?: object}>}
   */
  async getResponse(userMessage) {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Gemini API error: ${response.status}`
        );
      }

      const data = await response.json();

      // Extract text from response
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error('No response text received from Gemini');
      }

      return {
        text: textContent,
        hasCard: false,
      };
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw error;
    }
  },
};
