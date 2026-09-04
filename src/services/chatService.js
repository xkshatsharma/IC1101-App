/**
 * Unified Chat Service with Dual-Provider Fallback
 * Primary: Google Gemini (configurable model)
 * Fallback: Groq Llama (configurable model)
 * Automatically switches on rate limits, quota exceeded, or API errors
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Configurable model names — update these if API model names change
const GEMINI_MODEL = 'gemini-2.5-flash'; // Latest free Gemini model with generateContent support
let GROQ_MODEL = null; // Will be discovered on first use

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

const SYSTEM_PROMPT = 'You are ASH, an intelligent AI assistant made by IC1101. Be helpful, friendly and concise. Answer in a clean format.';

// Debug: Log environment at startup
console.log('🔧 Chat Service Initialization:');
console.log('  GEMINI_MODEL:', GEMINI_MODEL);
console.log('  GROQ_MODEL:', 'Will discover on first use');
console.log('  GEMINI_API_KEY:', GEMINI_API_KEY ? `Loaded (${GEMINI_API_KEY.substring(0, 10)}...)` : '❌ MISSING or undefined');
console.log('  GROQ_API_KEY:', GROQ_API_KEY ? `Loaded (${GROQ_API_KEY.substring(0, 10)}...)` : '❌ MISSING or undefined');

/**
 * Discover available Groq models (lazy loading on first use)
 */
async function discoverGroqModel() {
  if (GROQ_MODEL) {
    console.log('📦 Using cached Groq model:', GROQ_MODEL);
    return GROQ_MODEL;
  }

  if (!GROQ_API_KEY) {
    console.error('❌ Groq API key not configured');
    throw new Error('Groq API key missing');
  }

  console.log('🔍 Discovering Groq models...');

  try {
    const response = await fetch(GROQ_MODELS_URL, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Groq models: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];
    const modelIds = models.map(m => m.id);

    console.log('✅ Groq available models:', modelIds);

    // Exclude non-chat models (guards, embeddings, whisper, tts, vision)
    const excludePatterns = ['guard', 'embed', 'whisper', 'tts', 'vision'];
    const chatModels = modelIds.filter(id =>
      !excludePatterns.some(pattern => id.toLowerCase().includes(pattern))
    );

    console.log('🗣️ Groq chat-capable models (filtered):', chatModels);

    // Prefer models with "instruct" in name, then pick first available
    const instructModel = chatModels.find(id => id.toLowerCase().includes('instruct'));
    const selectedModel = instructModel || chatModels[0];

    if (!selectedModel) {
      console.error('❌ No suitable chat model found in Groq models list');
      throw new Error('No chat model available in Groq');
    }

    GROQ_MODEL = selectedModel;
    console.log('✨ Using Groq model:', GROQ_MODEL);

    return GROQ_MODEL;
  } catch (error) {
    console.error('❌ Failed to discover Groq model:', error.message);
    throw error;
  }
}

/**
 * Try Gemini API
 */
async function tryGemini(userMessage) {
  if (!GEMINI_API_KEY) {
    console.warn('❌ Gemini API key not configured, skipping to Groq');
    throw new Error('Gemini API key missing');
  }

  console.log('🚀 Trying Gemini...');
  console.log('  Model:', GEMINI_MODEL);

  const geminiEndpoint = `${GEMINI_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  console.log('  Endpoint:', geminiEndpoint.substring(0, 100) + '...');

  try {
    const requestBody = {
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
    };

    console.log('  Request body preview:', JSON.stringify(requestBody).substring(0, 100) + '...');

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('  Response status:', response.status, response.statusText);

    // Check for rate limit or quota errors
    if (response.status === 429) {
      console.warn('⚠️ Gemini rate limited (429), falling back to Groq...');
      throw new Error('Gemini rate limited');
    }

    if (response.status === 403) {
      const data = await response.json().catch(() => ({}));
      console.log('  403 Response:', JSON.stringify(data).substring(0, 300));
      if (data.error?.message?.includes('quota')) {
        console.warn('⚠️ Gemini quota exceeded, falling back to Groq...');
        throw new Error('Gemini quota exceeded');
      }
    }

    if (response.status === 404) {
      const errorText = await response.text();
      console.error('❌ Gemini 404 Not Found:', {
        model: GEMINI_MODEL,
        endpoint: geminiEndpoint.substring(0, 150),
        responseBody: errorText.substring(0, 300),
      });
      throw new Error(`Gemini model not found: ${GEMINI_MODEL}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      });
      throw new Error(`Gemini error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('  Response preview:', JSON.stringify(data).substring(0, 200) + '...');

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('❌ No text in Gemini response. Full response:', JSON.stringify(data));
      throw new Error('No response text from Gemini');
    }

    console.log('✅ Gemini response received:', textContent.substring(0, 50) + '...');
    return {
      text: textContent,
      provider: 'Gemini',
    };
  } catch (error) {
    console.error('❌ Gemini failed:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Try Groq API
 */
async function tryGroq(userMessage) {
  if (!GROQ_API_KEY) {
    console.error('❌ Groq API key not configured');
    throw new Error('Groq API key missing');
  }

  // Discover model on first use
  const model = await discoverGroqModel();

  console.log('🚀 Trying Groq...');
  console.log('  Model:', model);
  console.log('  URL:', GROQ_URL);

  try {
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };

    console.log('  Request model:', requestBody.model);
    console.log('  Request max_tokens:', requestBody.max_tokens);
    console.log('  Request body preview:', JSON.stringify(requestBody).substring(0, 100) + '...');

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('  Response status:', response.status, response.statusText);

    if (response.status === 429) {
      console.error('❌ Groq rate limited (429)');
      throw new Error('Groq rate limited');
    }

    if (response.status === 404) {
      const errorText = await response.text();
      console.error('❌ Groq 404 Not Found:', {
        model: model,
        responseBody: errorText.substring(0, 300),
      });
      throw new Error(`Groq model not found: ${model}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      });
      throw new Error(`Groq error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('  Response preview:', JSON.stringify(data).substring(0, 200) + '...');

    const textContent = data.choices?.[0]?.message?.content;

    if (!textContent) {
      console.error('❌ No text in Groq response. Full response:', JSON.stringify(data));
      throw new Error('No response text from Groq');
    }

    console.log('✅ Groq response received:', textContent.substring(0, 50) + '...');
    return {
      text: textContent,
      provider: 'Groq',
    };
  } catch (error) {
    console.error('❌ Groq failed:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Unified message service with automatic fallback
 * Try Gemini first, fall back to Groq on error
 */
export const chatService = {
  async sendMessage(userMessage) {
    console.log('\n💬 ========== New Chat Message ==========');
    console.log('Message:', userMessage);

    // Try Gemini first
    try {
      const result = await tryGemini(userMessage);
      console.log('✅ Chat completed via Gemini\n');
      return result;
    } catch (geminiError) {
      console.log('⚡ Gemini failed, attempting Groq fallback...');
    }

    // Try Groq as fallback
    try {
      const result = await tryGroq(userMessage);
      console.log('✅ Chat completed via Groq fallback\n');
      return result;
    } catch (groqError) {
      console.error('💥 Both providers failed');
      throw new Error('Both engines failed');
    }
  },
};
