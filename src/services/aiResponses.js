/**
 * Basic Brain Knowledge Base & Response Engine for ASH by IC1101
 * Sensible, friendly, natural replies with a built-in knowledge base.
 */

// Helper to evaluate simple math expressions safely like "2+2", "15 * 4", etc.
function tryEvaluateMath(text) {
  const sanitized = text.replace(/[^0-9+\-*/().\s]/g, '').trim();
  // Check if it's a valid arithmetic expression
  if (/^[0-9]+(?:\s*[+\-*/]\s*[0-9]+)+$/.test(sanitized)) {
    try {
      // Safe execution using Function
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return `${sanitized} = ${result}`;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function getAIResponse(userPrompt) {
  const raw = (userPrompt || '').trim();
  const lower = raw.toLowerCase().replace(/[?!.,;]/g, '').trim();

  // 1. Math Evaluation Check
  const mathResult = tryEvaluateMath(raw);
  if (mathResult) {
    return {
      text: mathResult,
      hasCard: false
    };
  }

  // 2. Greetings
  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.startsWith('hello ') || lower.startsWith('hi ')) {
    return {
      text: "Hello! It's great to connect with you. How can I help you today?",
      hasCard: false
    };
  }

  if (lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening')) {
    return {
      text: "A very pleasant day to you! How may I assist you right now?",
      hasCard: false
    };
  }

  // 3. How are you
  if (lower.includes('how are you') || lower.includes('how are you doing') || lower.includes('how r u')) {
    return {
      text: "I'm doing well, thank you for asking! I'm ready to assist with your questions, research, or documents.",
      hasCard: false
    };
  }

  // 4. Who are you
  if (lower.includes('who are you') || lower.includes('what is your name') || lower.includes('tell me about yourself')) {
    return {
      text: "I am ASH, an intelligent voice and research assistant created by IC1101. I'm here to assist you with conversational inquiries, document plagiarism checks, deep research synthesis, and voice commands.",
      hasCard: false
    };
  }

  // 5. What can you do / Help
  if (lower.includes('what can you do') || lower === 'help' || lower.includes('what are your features') || lower.includes('what do you do')) {
    return {
      text: "Here is what I can do for you:\n• Conversational AI chat with natural answers\n• Document plagiarism checking (PDF, DOCX, TXT)\n• Deep research synthesis & visual generation\n• Voice listening & speech-to-text via the plasma orb\n• Quick calculations and general knowledge inquiries",
      hasCard: false
    };
  }

  // 6. Gratitude / Thanks
  if (lower.includes('thank') || lower.includes('thanks') || lower === 'thx') {
    return {
      text: "You're very welcome! Let me know if you need help with anything else.",
      hasCard: false
    };
  }

  // 7. Date & Time
  if (lower.includes('what time is it') || lower.includes('current time') || lower.includes('what is the time')) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      text: `The current time is ${timeStr}.`,
      hasCard: false
    };
  }

  if (lower.includes('what day is it') || lower.includes('what is the date') || lower.includes('today date') || lower.includes('todays date')) {
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      text: `Today is ${dateStr}.`,
      hasCard: false
    };
  }

  // 8. General Knowledge Base (15-20 Questions)
  if (lower.includes('capital of france')) {
    return {
      text: "The capital of France is Paris.",
      hasCard: false
    };
  }

  if (lower.includes('capital of india')) {
    return {
      text: "The capital of India is New Delhi.",
      hasCard: false
    };
  }

  if (lower.includes('capital of usa') || lower.includes('capital of the united states')) {
    return {
      text: "The capital of the United States is Washington, D.C.",
      hasCard: false
    };
  }

  if (lower.includes('speed of light')) {
    return {
      text: "The speed of light in a vacuum is approximately 299,792,458 meters per second (about 300,000 km/s or 186,282 miles/s).",
      hasCard: false
    };
  }

  if (lower.includes('what is ic1101') || lower.includes('what is ic 1101') || lower.includes('ic1101')) {
    return {
      text: "IC 1101 is one of the largest known supergiant elliptical galaxies in the observable universe. It spans roughly 6 million light-years in diameter and contains over 100 trillion stars.",
      hasCard: false
    };
  }

  if (lower.includes('who created you') || lower.includes('who built you') || lower.includes('who made you')) {
    return {
      text: "I was developed by IC1101 as an intelligent voice and research assistant.",
      hasCard: false
    };
  }

  if (lower.includes('what is react')) {
    return {
      text: "React is a widely-used open-source JavaScript library developed by Meta for building dynamic, component-based user interfaces.",
      hasCard: false
    };
  }

  if (lower.includes('what is python')) {
    return {
      text: "Python is a high-level, interpreted programming language celebrated for its clear syntax, versatility, and dominance in data science, AI, and web backend engineering.",
      hasCard: false
    };
  }

  if (lower.includes('what is ai') || lower.includes('what is artificial intelligence')) {
    return {
      text: "Artificial Intelligence (AI) is the branch of computer science dedicated to creating systems capable of performing tasks that typically require human cognition, such as visual perception, natural language understanding, reasoning, and learning.",
      hasCard: false
    };
  }

  if (lower.includes('what is machine learning')) {
    return {
      text: "Machine Learning is a subset of AI focused on building algorithms that learn patterns from data and improve their performance over time without being explicitly hardcoded.",
      hasCard: false
    };
  }

  if (lower.includes('quantum computing')) {
    return {
      text: "Quantum computing harnesses quantum mechanical phenomena like superposition and entanglement to compute complex multi-dimensional problems far faster than traditional silicon processors.",
      hasCard: false
    };
  }

  if (lower.includes('largest planet') || lower.includes('biggest planet')) {
    return {
      text: "Jupiter is the largest planet in our solar system, with a mass more than twice that of all other planets combined.",
      hasCard: false
    };
  }

  if (lower.includes('tell me a joke') || lower.includes('joke')) {
    return {
      text: "Why don't scientists trust atoms? Because they make up everything!",
      hasCard: false
    };
  }

  if (lower.includes('how does plagiarism check work') || lower.includes('how plagiarism check works')) {
    return {
      text: "The plagiarism check parses your uploaded document (PDF, DOCX, TXT) and compares the text structure and phrasing against global knowledge bases to ensure authenticity.",
      hasCard: false
    };
  }

  // 9. Visual / Artwork Request (matches the reference card)
  if (lower.includes('gradient') || lower.includes('abstract') || lower.includes('create an image') || lower.includes('generate image')) {
    return {
      text: "Here is the visual artwork generated based on your prompt, blending deep purple, violet, and electric pink hues with atmospheric lighting.",
      hasCard: true,
      cardData: {
        title: "Abstract Smooth Gradient",
        subtitle: "Today | 21 Jan, 2026",
        badge: "Image created",
        gradient: "linear-gradient(135deg, #180538 0%, #4A00E0 35%, #8E2DE2 70%, #E471ED 100%)"
      }
    };
  }

  // 10. Polite Fallback (No robotic filler)
  return {
    text: "I'm still learning. Try asking me something else!",
    hasCard: false
  };
}
