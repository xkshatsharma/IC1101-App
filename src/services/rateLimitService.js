/**
 * Rate Limiting Service
 * Tracks daily message limits per user to prevent API abuse
 */

const RATE_LIMIT_KEY = 'ic1101_chat_limit';
const MESSAGES_PER_DAY = 30;

export const rateLimitService = {
  /**
   * Check if user has exceeded daily message limit
   */
  isLimitExceeded() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);

    if (!stored) {
      this.resetLimit();
      return false;
    }

    const data = JSON.parse(stored);

    // Reset if it's a new day
    if (data.date !== today) {
      this.resetLimit();
      return false;
    }

    const remaining = MESSAGES_PER_DAY - data.count;
    console.log(`📊 Chat rate limit: ${remaining}/${MESSAGES_PER_DAY} messages remaining today`);

    return data.count >= MESSAGES_PER_DAY;
  },

  /**
   * Increment message counter
   */
  incrementCounter() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);

    if (!stored) {
      localStorage.setItem(
        RATE_LIMIT_KEY,
        JSON.stringify({ date: today, count: 1 })
      );
      return;
    }

    const data = JSON.parse(stored);

    // Reset if it's a new day
    if (data.date !== today) {
      localStorage.setItem(
        RATE_LIMIT_KEY,
        JSON.stringify({ date: today, count: 1 })
      );
      return;
    }

    data.count++;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  },

  /**
   * Reset limit (called on new day or manual reset)
   */
  resetLimit() {
    const today = new Date().toDateString();
    localStorage.setItem(
      RATE_LIMIT_KEY,
      JSON.stringify({ date: today, count: 0 })
    );
  },

  /**
   * Get remaining messages for today
   */
  getRemainingMessages() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);

    if (!stored) {
      return MESSAGES_PER_DAY;
    }

    const data = JSON.parse(stored);

    // Reset if it's a new day
    if (data.date !== today) {
      return MESSAGES_PER_DAY;
    }

    return Math.max(0, MESSAGES_PER_DAY - data.count);
  },
};
