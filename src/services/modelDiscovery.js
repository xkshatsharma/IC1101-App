/**
 * Script to discover available AI models
 * Run this to find valid model names for Gemini and Groq
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function discoverModels() {
  console.log('\n🔍 ========== Discovering Available Models ==========\n');

  // Fetch Gemini models
  if (GEMINI_API_KEY) {
    console.log('📡 Fetching Gemini models...');
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
      );
      const data = await response.json();
      console.log('✅ Gemini available models:');
      data.models?.forEach((model) => {
        console.log(`  - ${model.name} (${model.displayName})`);
        if (model.name.includes('generateContent')) {
          console.log(`    ✨ Supports generateContent`);
        }
      });
    } catch (error) {
      console.error('❌ Failed to fetch Gemini models:', error.message);
    }
  } else {
    console.error('❌ Gemini API key not configured');
  }

  console.log('');

  // Fetch Groq models
  if (GROQ_API_KEY) {
    console.log('📡 Fetching Groq models...');
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
      });
      const data = await response.json();
      console.log('✅ Groq available models:');
      data.data?.forEach((model) => {
        console.log(`  - ${model.id}`);
      });
    } catch (error) {
      console.error('❌ Failed to fetch Groq models:', error.message);
    }
  } else {
    console.error('❌ Groq API key not configured');
  }

  console.log('\n================================================\n');
}
