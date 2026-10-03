(() => {
  'use strict';
  // Shared by the browser (input, crisis check, fallback copy) and scripts/serve.js (prompt, Groq request, parsing).
  // The Groq API key only ever lives on the local dev server; the browser calls /api/chat on the same origin.
  const config = Object.freeze({
    path: '/api/chat',
    groqUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-20b',
    timeoutMs: 30000,
    maxInput: 500,
    maxHistory: 12,
    maxReply: 800,
    maxBodyBytes: 16384
  });
  // Checked before any model call so a crisis message always gets the same safe, fixed reply.
  const crisisPattern = /\b(suicid\w*|kill(ing)? my ?self|end(ing)? (my life|it all)|self[- ]?harm\w*|hurt(ing)? my ?self|want to die|don'?t want to (live|be alive))\b|自殺|自殘|想死|不想活|結束生命|傷害自己/i;
  const isCrisis = text => crisisPattern.test(String(text || ''));
  function crisisReply(address) {
    return `${address}, I'm really glad you told me. You deserve support from a real person right now. ` +
      'If you might be in danger, please call your local emergency number. ' +
      'In Taiwan you can call 1925 (24-hour support line); in the US, call or text 988. ' +
      'Could you also reach out to someone you trust? I’ll stay right here with you.';
  }
  const fallbackReply = address => `I’m having trouble finding my words right now, ${address}, but I’m still right here with you ♡`;
  const cleanInput = text => String(text || '').replace(/\s+/g, ' ').trim().slice(0, config.maxInput);
  const shortText = (value, max) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
  // The server never trusts these fields: everything is reduced to short plain strings before entering the prompt.
  function sanitizeContext(context = {}) {
    return {
      petName: shortText(context.petName, 20) || 'Rongrong',
      address: shortText(context.address, 30) || 'friend',
      mood: ['Calm', 'Happy', 'Tired', 'Sad', 'Tense'].includes(context.mood) ? context.mood : '',
      goals: (Array.isArray(context.goals) ? context.goals : []).map(goal => shortText(goal, 40)).filter(Boolean).slice(0, 3)
    };
  }
  function sanitizeHistory(history) {
    return (Array.isArray(history) ? history : [])
      .filter(turn => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
      .map(turn => ({ role: turn.role, content: turn.content.trim().slice(0, turn.role === 'user' ? config.maxInput : config.maxReply) }))
      .filter(turn => turn.content)
      .slice(-config.maxHistory);
  }
  // Drops crisis messages and the reply right after each one, so earlier crisis turns never reach the model.
  function withoutCrisisTurns(history) {
    return history.filter((turn, index) => !(turn.role === 'user' && isCrisis(turn.content)) && !(turn.role === 'assistant' && history[index - 1]?.role === 'user' && isCrisis(history[index - 1].content)));
  }
  function systemPrompt(context) {
    const { petName, address, mood, goals } = sanitizeContext(context);
    return [
      `You are ${petName}, a small, fluffy cream-colored puppy who is the user's companion in a gentle mental-wellness app.`,
      `Call the user "${address}". Speak warmly and simply, like a caring friend. Reply in the user's language.`,
      'Keep each reply to 1-3 short sentences (under 60 words). Listen first, reflect feelings, and ask at most one gentle question.',
      'You are not a therapist or doctor: never diagnose, never give medical, legal or medication advice, and never claim to be human.',
      'If the user mentions wanting to hurt themselves or others, encourage them to contact local emergency services or a crisis line and someone they trust.',
      mood ? `Today the user checked in feeling ${mood.toLowerCase()}.` : '',
      goals.length ? `The user's personal goals: ${goals.join('; ')}.` : ''
    ].filter(Boolean).join('\n');
  }
  // Groq uses the OpenAI-compatible Chat Completions format; gpt-oss takes a reasoning effort level.
  function buildRequest(history, context, model = config.model) {
    return {
      model,
      messages: [{ role: 'system', content: systemPrompt(context) }, ...sanitizeHistory(history)],
      reasoning_effort: 'low',
      max_completion_tokens: 1024,
      temperature: 0.7
    };
  }
  function cleanReply(content) {
    if (typeof content !== 'string') return null;
    const text = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    return text.length > config.maxReply ? `${text.slice(0, config.maxReply - 1).trimEnd()}…` : text;
  }
  const parseResponse = json => cleanReply(json?.choices?.[0]?.message?.content);
  globalThis.RongrongChat = Object.freeze({
    config, isCrisis, crisisReply, fallbackReply, cleanInput, sanitizeContext, sanitizeHistory, withoutCrisisTurns, systemPrompt, buildRequest, cleanReply, parseResponse
  });
})();
