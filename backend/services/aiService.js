const axios = require('axios');

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const FALLBACK_RESPONSE = {
  effort: 'M (4–8 hours)',
  suggestedDueDate: null,
  reasoning:
    'AI estimate unavailable. This is a medium-effort default suggestion.',
  isFallback: true,
};

/**
 * Calls Gemini API to estimate effort and due date for a task.
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {Promise<{effort: string, suggestedDueDate: string|null, reasoning: string, isFallback: boolean}>}
 */
const getTaskEstimate = async (title, description = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[AI] Gemini API key not configured, returning fallback.');
    return { ...FALLBACK_RESPONSE };
  }

  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are a project management assistant. Given a task title and description, estimate:
1. The effort required using T-shirt sizing: XS (< 1 hour), S (1–2 hours), M (4–8 hours), L (1–2 days), XL (3–5 days)
2. A suggested due date (from today: ${today}), in ISO format YYYY-MM-DD
3. A short one-sentence reasoning (max 20 words)

Task Title: ${title}
Task Description: ${description || '(no description provided)'}

Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{
  "effort": "<size> (<time range>)",
  "suggestedDueDate": "<YYYY-MM-DD>",
  "reasoning": "<one sentence>"
}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        },
      },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const rawText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    // Strip potential markdown fences
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate and sanitize
    const effort = typeof parsed.effort === 'string' ? parsed.effort : 'M (4–8 hours)';
    const reasoning =
      typeof parsed.reasoning === 'string' ? parsed.reasoning : '';

    let suggestedDueDate = null;
    if (parsed.suggestedDueDate && !isNaN(Date.parse(parsed.suggestedDueDate))) {
      suggestedDueDate = parsed.suggestedDueDate;
    }

    return { effort, suggestedDueDate, reasoning, isFallback: false };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        console.error('[AI] Gemini API request timed out.');
      } else if (error.response) {
        console.error(
          `[AI] Gemini API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      } else {
        console.error('[AI] Gemini API network error:', error.message);
      }
    } else {
      console.error('[AI] Error processing Gemini response:', error.message);
    }

    return { ...FALLBACK_RESPONSE };
  }
};

module.exports = { getTaskEstimate };
