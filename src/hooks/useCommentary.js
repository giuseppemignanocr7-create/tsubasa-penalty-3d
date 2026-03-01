import { useRef, useCallback, useEffect } from 'react';
import { getCommentary, COMMENTARY_POOLS } from '../data/commentaryData';

// ============================================================
// VOCE IMPECCABILE — Gemini Charon + Web Speech fallback
//
// Priorità: Charon (cache) > Charon (fetch live) > Web Speech IT
// La voce c'è SEMPRE. Mai silenzio. Mai mix nello stesso momento.
//
// 1. warmUp() su click utente → crea AudioContext + avvia pre-gen
// 2. speak() → cache hit? play Charon. Altrimenti fetch Charon
//    con timeout 3s. Se fallisce → Web Speech italiana.
// 3. Pre-gen aggressiva di TUTTE le frasi in background.
// 4. Retry automatico su frasi fallite.
// ============================================================

const GEMINI_API_KEY = 'AIzaSyAffG9F10W0bWTlnQMkMjNm6dUdf7mpXIM';
const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const GEMINI_TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_VOICE = 'Charon';
const FETCH_TIMEOUT_MS = 4000;

// Tone → prompt per Gemini
const TONE_PROMPTS = {
  excited:      'Dì con entusiasmo esplosivo da telecronista sportivo italiano, voce maschile, urlando di gioia:',
  tense:        'Dì con tono teso e drammatico da telecronista sportivo italiano, voce maschile, sussurrando quasi:',
  shocked:      'Dì con stupore e incredulità da telecronista sportivo italiano, voce maschile, sorpreso:',
  disappointed: 'Dì con delusione e rammarico da telecronista sportivo italiano, voce maschile:',
  epic:         'Dì con massima epicità da telecronista sportivo leggendario italiano, voce maschile potente, tono eroico:',
  normal:       'Dì con tono professionale da telecronista sportivo italiano, voce maschile chiara e decisa:',
};

// Tone → Web Speech params (fallback)
const WS_TONES = {
  excited:      { rate: 1.15, pitch: 1.3, volume: 1.0 },
  tense:        { rate: 0.9,  pitch: 0.95, volume: 0.85 },
  shocked:      { rate: 1.1,  pitch: 1.2, volume: 1.0 },
  disappointed: { rate: 0.85, pitch: 0.85, volume: 0.8 },
  epic:         { rate: 1.2,  pitch: 1.35, volume: 1.0 },
  normal:       { rate: 1.0,  pitch: 1.1, volume: 0.9 },
};

// ---- Cache globale ----
const _audioCache = new Map();
const _pendingFetches = new Map();
const _failedKeys = new Set();
const MAX_CACHE = 300;

// ---- Web Speech: trova e salva la migliore voce IT ----
let _wsVoice = null;
let _wsSearched = false;
function getItalianVoice() {
  if (_wsSearched) return _wsVoice;
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  _wsSearched = true;
  const it = voices.filter(v => v.lang.startsWith('it'));
  _wsVoice = it.find(v => v.localService) || it[0] || null;
  if (_wsVoice) console.log(`[Voice] Web Speech fallback: ${_wsVoice.name}`);
  return _wsVoice;
}
// Pre-load voices
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener('voiceschanged', () => { _wsSearched = false; _wsVoice = null; getItalianVoice(); });
  getItalianVoice();
}

// ---- Decode Gemini PCM16 base64 → AudioBuffer ----
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

// ---- Fetch con timeout ----
function fetchWithTimeout(url, options, timeoutMs) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)),
  ]);
}

// ---- Fetch singola frase TTS ----
async function fetchTTS(text, tone, audioCtx) {
  const cacheKey = `${tone}::${text}`;
  if (_audioCache.has(cacheKey)) return _audioCache.get(cacheKey);
  if (_pendingFetches.has(cacheKey)) return _pendingFetches.get(cacheKey);

  const prompt = `${TONE_PROMPTS[tone] || TONE_PROMPTS.normal} "${text}"`;

  const promise = fetchWithTimeout(GEMINI_TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } }
      }
    }),
  }, FETCH_TIMEOUT_MS)
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
      _failedKeys.delete(cacheKey);
      _pendingFetches.delete(cacheKey);
      return buffer;
    })
    .catch(err => {
      _pendingFetches.delete(cacheKey);
      _failedKeys.add(cacheKey);
      throw err;
    });

  _pendingFetches.set(cacheKey, promise);
  return promise;
}

// ---- Pre-gen batch con retry ----
async function pregenBatch(phrases, audioCtx) {
  // Pass 1: fetch tutto
  for (const { text, tone } of phrases) {
    const cacheKey = `${tone}::${text}`;
    if (_audioCache.has(cacheKey) || _pendingFetches.has(cacheKey)) continue;
    try { await fetchTTS(text, tone, audioCtx); } catch (_) {}
    await new Promise(r => setTimeout(r, 150));
  }
  // Pass 2: retry falliti
  const failed = phrases.filter(({ text, tone }) => _failedKeys.has(`${tone}::${text}`));
  if (failed.length > 0) {
    console.log(`[Voice] Retry ${failed.length} frasi fallite...`);
    await new Promise(r => setTimeout(r, 2000));
    for (const { text, tone } of failed) {
      const ck = `${tone}::${text}`;
      if (_audioCache.has(ck)) continue;
      try { await fetchTTS(text, tone, audioCtx); } catch (_) {}
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

// ---- Raccoglie tutte le frasi ----
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
  const speakIdRef = useRef(0);

  // ---- AudioContext (creato su user gesture) ----
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const ensureAudioCtxRunning = useCallback(async () => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [getAudioCtx]);

  const notifyText = useCallback((text) => {
    currentTextRef.current = text;
    listenersRef.current.forEach(fn => fn(text));
  }, []);

  // ---- Pre-gen ----
  const startPregen = useCallback(() => {
    if (pregenStartedRef.current) return;
    pregenStartedRef.current = true;
    const ctx = getAudioCtx();
    const phrases = getAllPhrases();
    console.log(`[Voice] Pre-gen: ${phrases.length} frasi...`);
    pregenBatch(phrases, ctx).then(() => {
      console.log(`[Voice] Pre-gen OK. Cache: ${_audioCache.size}/${phrases.length}`);
    });
  }, [getAudioCtx]);

  // ---- warmUp: DEVE essere su click utente ----
  const warmUp = useCallback(async () => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    console.log(`[Voice] warmUp — AudioContext: ${ctx.state}`);
    startPregen();
  }, [getAudioCtx, startPregen]);

  // ---- Stop tutto ----
  const stopAll = useCallback(() => {
    // Stop Charon AudioBuffer
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (_) {}
      currentSourceRef.current = null;
    }
    // Stop Web Speech
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  // ---- Play Charon AudioBuffer ----
  const playBuffer = useCallback(async (buffer, id) => {
    if (id !== speakIdRef.current) return; // stale
    const ctx = await ensureAudioCtxRunning();
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (_) {}
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => { speakingRef.current = false; currentSourceRef.current = null; };
    currentSourceRef.current = source;
    speakingRef.current = true;
    source.start();
  }, [ensureAudioCtxRunning]);

  // ---- Play Web Speech (fallback garantito) ----
  const playWebSpeech = useCallback((text, tone, id) => {
    if (id !== speakIdRef.current) return; // stale
    if (!('speechSynthesis' in window)) return;
    // Stop qualsiasi audio in corso
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (_) {}
      currentSourceRef.current = null;
    }
    speechSynthesis.cancel();
    const params = WS_TONES[tone] || WS_TONES.normal;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = params.rate;
    u.pitch = params.pitch;
    u.volume = params.volume;
    const voice = getItalianVoice();
    if (voice) u.voice = voice;
    u.onstart = () => { speakingRef.current = true; };
    u.onend = () => { speakingRef.current = false; };
    u.onerror = () => { speakingRef.current = false; };
    speechSynthesis.speak(u);
  }, []);

  // ---- Core speak ----
  const speak = useCallback((text, options = {}) => {
    if (!enabledRef.current || !text) return;

    const tone = options.tone || 'normal';
    const id = ++speakIdRef.current;

    startPregen();
    stopAll();

    // Sottotitolo
    notifyText(text);
    const clearMs = Math.max(4000, text.length * 70);
    setTimeout(() => { if (currentTextRef.current === text) notifyText(''); }, clearMs);

    const cacheKey = `${tone}::${text}`;

    // 1. Cache HIT → Charon istantaneo
    if (_audioCache.has(cacheKey)) {
      playBuffer(_audioCache.get(cacheKey), id);
      return;
    }

    // 2. Cache MISS → fetch Charon con timeout. Se fallisce → Web Speech.
    const ctx = getAudioCtx();
    fetchTTS(text, tone, ctx)
      .then(buffer => {
        if (id === speakIdRef.current) {
          playBuffer(buffer, id);
        }
      })
      .catch(() => {
        // Charon fallito → Web Speech come garanzia
        if (id === speakIdRef.current) {
          console.log(`[Voice] Charon miss → Web Speech fallback`);
          playWebSpeech(text, tone, id);
        }
      });
  }, [notifyText, playBuffer, playWebSpeech, stopAll, startPregen, getAudioCtx]);

  // ---- Helper methods ----
  const matchIntro = useCallback(() => {
    speak(getCommentary('MATCH_INTRO'), { tone: 'normal' });
  }, [speak]);

  const preShot = useCallback((shooterId) => {
    speak(getCommentary('PRE_SHOT', shooterId), { tone: 'tense' });
  }, [speak]);

  const keeperReady = useCallback((keeperId) => {
    speak(getCommentary('KEEPER_READY', keeperId), { tone: 'tense' });
  }, [speak]);

  const shotResult = useCallback((result) => {
    speak(getCommentary('RESULT', result), { tone: result === 'goal' ? 'excited' : 'shocked' });
  }, [speak]);

  const tensionMoment = useCallback(() => {
    speak(getCommentary('TENSION'), { tone: 'tense' });
  }, [speak]);

  const momentumComment = useCallback(() => {
    speak(getCommentary('MOMENTUM'), { tone: 'excited' });
  }, [speak]);

  const pressureComment = useCallback(() => {
    speak(getCommentary('PRESSURE'), { tone: 'tense' });
  }, [speak]);

  const roundEnd = useCallback(() => {
    speak(getCommentary('ROUND_END'), { tone: 'normal' });
  }, [speak]);

  const matchWin = useCallback(() => {
    speak(getCommentary('MATCH_WIN'), { tone: 'epic' });
  }, [speak]);

  const stop = useCallback(() => {
    speakIdRef.current++;
    stopAll();
    notifyText('');
  }, [stopAll, notifyText]);

  const setEnabled = useCallback((v) => {
    enabledRef.current = v;
    if (!v) stop();
  }, [stop]);

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  useEffect(() => { return () => { stop(); }; }, [stop]);

  return {
    speak, warmUp,
    matchIntro, preShot, keeperReady, shotResult,
    tensionMoment, momentumComment, pressureComment,
    roundEnd, matchWin, stop, subscribe,
    currentText: currentTextRef, enabledRef, setEnabled,
  };
}
