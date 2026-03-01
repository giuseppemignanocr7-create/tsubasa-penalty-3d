import { useRef, useCallback, useEffect } from 'react';
import { getCommentary, COMMENTARY_POOLS } from '../data/commentaryData';

// ============================================================
// GEMINI TTS — Voce Charon ESCLUSIVA
// Strategia: pre-genera TUTTE le frasi in background all'avvio.
// Se l'audio è in cache → play istantaneo.
// Se non è ancora in cache → solo sottotitolo (niente Web Speech).
// ZERO mix di voci. Sempre e solo Charon.
// ============================================================
const GEMINI_API_KEY = 'AIzaSyAffG9F10W0bWTlnQMkMjNm6dUdf7mpXIM';
const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const GEMINI_TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_VOICE = 'Charon';

// Tone → directorial prompt per Gemini TTS (telecronista italiano)
const TONE_PROMPTS = {
  excited:      'Dì con entusiasmo esplosivo da telecronista sportivo italiano, voce maschile, urlando di gioia:',
  tense:        'Dì con tono teso e drammatico da telecronista sportivo italiano, voce maschile, sussurrando quasi:',
  shocked:      'Dì con stupore e incredulità da telecronista sportivo italiano, voce maschile, sorpreso:',
  disappointed: 'Dì con delusione e rammarico da telecronista sportivo italiano, voce maschile:',
  epic:         'Dì con massima epicità da telecronista sportivo leggendario italiano, voce maschile potente, tono eroico:',
  normal:       'Dì con tono professionale da telecronista sportivo italiano, voce maschile chiara e decisa:',
};

// ---- Audio cache globale (persiste tra re-render) ----
const _audioCache = new Map();
const _pendingFetches = new Map();
const MAX_CACHE = 300;

// Decode Gemini PCM16 base64 → AudioBuffer
function decodeGeminiPCM(base64Data, audioCtx) {
  const binaryStr = atob(base64Data);
  const len = binaryStr.length;
  const pcm16 = new Int16Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    pcm16[i / 2] = binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8);
  }
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768;
  }
  const buffer = audioCtx.createBuffer(1, float32.length, 24000);
  buffer.getChannelData(0).set(float32);
  return buffer;
}

// Fetch singola frase TTS (con dedup per evitare doppie richieste)
async function fetchTTS(text, tone, audioCtx) {
  const cacheKey = `${tone}::${text}`;
  if (_audioCache.has(cacheKey)) return _audioCache.get(cacheKey);
  if (_pendingFetches.has(cacheKey)) return _pendingFetches.get(cacheKey);

  const prompt = `${TONE_PROMPTS[tone] || TONE_PROMPTS.normal} "${text}"`;

  const promise = fetch(GEMINI_TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: GEMINI_VOICE }
          }
        }
      }
    }),
  })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(json => {
      const data = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) throw new Error('No audio data');
      const buffer = decodeGeminiPCM(data, audioCtx);
      if (_audioCache.size >= MAX_CACHE) {
        const firstKey = _audioCache.keys().next().value;
        _audioCache.delete(firstKey);
      }
      _audioCache.set(cacheKey, buffer);
      _pendingFetches.delete(cacheKey);
      return buffer;
    })
    .catch(err => {
      _pendingFetches.delete(cacheKey);
      throw err;
    });

  _pendingFetches.set(cacheKey, promise);
  return promise;
}

// Pre-genera batch (throttled, background, non-blocking)
async function pregenBatch(phrases, audioCtx) {
  for (const { text, tone } of phrases) {
    const cacheKey = `${tone}::${text}`;
    if (_audioCache.has(cacheKey) || _pendingFetches.has(cacheKey)) continue;
    try {
      await fetchTTS(text, tone, audioCtx);
    } catch (_) { /* skip failures silently */ }
    // Throttle 200ms tra richieste per non saturare l'API
    await new Promise(r => setTimeout(r, 200));
  }
}

// Raccoglie TUTTE le frasi da pre-generare
function getAllPhrases() {
  const phrases = [];
  const addAll = (pool, tone) => {
    if (!pool) return;
    const arr = Array.isArray(pool) ? pool : Object.values(pool).flat();
    arr.forEach(text => phrases.push({ text, tone }));
  };
  addAll(COMMENTARY_POOLS.MATCH_INTRO, 'normal');
  addAll(COMMENTARY_POOLS.PRE_SHOT, 'tense');
  addAll(COMMENTARY_POOLS.KEEPER_READY, 'tense');
  addAll(COMMENTARY_POOLS.RESULT?.goal, 'excited');
  addAll(COMMENTARY_POOLS.RESULT?.goal_touched, 'excited');
  addAll(COMMENTARY_POOLS.RESULT?.save, 'shocked');
  addAll(COMMENTARY_POOLS.RESULT?.keeper_tip, 'shocked');
  addAll(COMMENTARY_POOLS.RESULT?.crossbar, 'shocked');
  addAll(COMMENTARY_POOLS.RESULT?.post, 'shocked');
  addAll(COMMENTARY_POOLS.RESULT?.over_bar, 'disappointed');
  addAll(COMMENTARY_POOLS.RESULT?.wide_left, 'disappointed');
  addAll(COMMENTARY_POOLS.RESULT?.wide_right, 'disappointed');
  addAll(COMMENTARY_POOLS.TENSION, 'tense');
  addAll(COMMENTARY_POOLS.MOMENTUM, 'excited');
  addAll(COMMENTARY_POOLS.PRESSURE, 'tense');
  addAll(COMMENTARY_POOLS.ROUND_END, 'normal');
  addAll(COMMENTARY_POOLS.MATCH_WIN, 'epic');
  addAll(COMMENTARY_POOLS.MATCH_DRAW, 'normal');
  return phrases;
}

// ============================================================
// HOOK
// ============================================================
export function useCommentary() {
  const enabledRef = useRef(true);
  const speakingRef = useRef(false);
  const currentTextRef = useRef('');
  const listenersRef = useRef(new Set());
  const audioCtxRef = useRef(null);
  const currentSourceRef = useRef(null);
  const pregenStartedRef = useRef(false);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const notifyText = useCallback((text) => {
    currentTextRef.current = text;
    listenersRef.current.forEach(fn => fn(text));
  }, []);

  // Avvia pre-generazione di TUTTE le frasi (una volta sola)
  const startPregen = useCallback(() => {
    if (pregenStartedRef.current) return;
    pregenStartedRef.current = true;
    const ctx = getAudioCtx();
    const phrases = getAllPhrases();
    console.log(`[Charon] Pre-generazione di ${phrases.length} frasi in background...`);
    pregenBatch(phrases, ctx).then(() => {
      console.log(`[Charon] Pre-gen completata. ${_audioCache.size} frasi in cache.`);
    });
  }, [getAudioCtx]);

  // Play AudioBuffer istantaneo
  const playBuffer = useCallback((buffer) => {
    const ctx = getAudioCtx();
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (_) {}
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      speakingRef.current = false;
      currentSourceRef.current = null;
    };
    currentSourceRef.current = source;
    speakingRef.current = true;
    source.start();
  }, [getAudioCtx]);

  // Stop audio corrente
  const stopAll = useCallback(() => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (_) {}
      currentSourceRef.current = null;
    }
    speakingRef.current = false;
  }, []);

  // Core speak — SOLO Gemini Charon. Se non in cache → solo sottotitolo.
  const speak = useCallback((text, options = {}) => {
    if (!enabledRef.current || !text) return;

    const tone = options.tone || 'normal';

    // Avvia pre-gen al primo speak
    startPregen();

    // Stop audio corrente — mai mix
    stopAll();

    // Sottotitolo sempre visibile
    notifyText(text);
    const clearMs = Math.max(4000, text.length * 70);
    setTimeout(() => {
      if (currentTextRef.current === text) notifyText('');
    }, clearMs);

    const cacheKey = `${tone}::${text}`;

    // Se in cache → play istantaneo con Charon
    if (_audioCache.has(cacheKey)) {
      playBuffer(_audioCache.get(cacheKey));
      return;
    }

    // Se non in cache → fetch in background per la prossima volta
    // NESSUN fallback Web Speech — solo sottotitolo
    const ctx = getAudioCtx();
    fetchTTS(text, tone, ctx).then(buffer => {
      // Se il testo è ancora quello corrente, riproducilo appena pronto
      if (currentTextRef.current === text && enabledRef.current) {
        playBuffer(buffer);
      }
    }).catch(() => {
      // Fetch fallito — resta solo il sottotitolo
    });
  }, [notifyText, playBuffer, stopAll, startPregen, getAudioCtx]);

  // Helper methods
  const matchIntro = useCallback(() => {
    const text = getCommentary('MATCH_INTRO');
    speak(text, { tone: 'normal' });
  }, [speak]);

  const preShot = useCallback((shooterId) => {
    const text = getCommentary('PRE_SHOT', shooterId);
    speak(text, { tone: 'tense' });
  }, [speak]);

  const keeperReady = useCallback((keeperId) => {
    const text = getCommentary('KEEPER_READY', keeperId);
    speak(text, { tone: 'tense' });
  }, [speak]);

  const shotResult = useCallback((result) => {
    const text = getCommentary('RESULT', result);
    const tone = result === 'goal' ? 'excited' : 'shocked';
    speak(text, { tone });
  }, [speak]);

  const tensionMoment = useCallback(() => {
    const text = getCommentary('TENSION');
    speak(text, { tone: 'tense' });
  }, [speak]);

  const momentumComment = useCallback(() => {
    const text = getCommentary('MOMENTUM');
    speak(text, { tone: 'excited' });
  }, [speak]);

  const pressureComment = useCallback(() => {
    const text = getCommentary('PRESSURE');
    speak(text, { tone: 'tense' });
  }, [speak]);

  const roundEnd = useCallback(() => {
    const text = getCommentary('ROUND_END');
    speak(text, { tone: 'normal' });
  }, [speak]);

  const matchWin = useCallback(() => {
    const text = getCommentary('MATCH_WIN');
    speak(text, { tone: 'epic' });
  }, [speak]);

  const stop = useCallback(() => {
    stopAll();
    notifyText('');
  }, [stopAll, notifyText]);

  const setEnabled = useCallback((v) => {
    enabledRef.current = v;
    if (!v) stop();
  }, [stop]);

  // Subscribe per CommentaryOverlay
  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return {
    speak,
    matchIntro,
    preShot,
    keeperReady,
    shotResult,
    tensionMoment,
    momentumComment,
    pressureComment,
    roundEnd,
    matchWin,
    stop,
    subscribe,
    currentText: currentTextRef,
    enabledRef,
    setEnabled,
  };
}
