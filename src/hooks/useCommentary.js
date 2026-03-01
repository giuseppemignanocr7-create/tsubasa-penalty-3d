import { useRef, useCallback, useEffect } from 'react';
import { getCommentary } from '../data/commentaryData';

// ============================================================
// TELECRONACA — Solo Web Speech API
// Una voce italiana, sempre funzionante, zero latenza.
// Toni calibrati per ogni fase di gioco.
// ============================================================

// Tone → parametri voce per ogni emozione
// rate: 0.7-1.3 (velocità), pitch: 0.5-2.0 (tono), volume: 0-1
const TONES = {
  excited:      { rate: 1.12, pitch: 1.25, volume: 1.0 },   // GOL! urlato, veloce
  tense:        { rate: 0.92, pitch: 0.90, volume: 0.85 },   // pre-rigore, lento e basso
  shocked:      { rate: 1.05, pitch: 1.15, volume: 1.0 },    // parata, sorpreso
  disappointed: { rate: 0.85, pitch: 0.80, volume: 0.75 },   // errore, lento e triste
  epic:         { rate: 1.15, pitch: 1.30, volume: 1.0 },    // vittoria finale, massima energia
  normal:       { rate: 1.00, pitch: 1.05, volume: 0.90 },   // narrazione standard
};

// ---- Voce italiana: cerca e salva la migliore ----
let _voice = null;
let _voiceReady = false;

function findBestVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  _voiceReady = true;
  const it = voices.filter(v => v.lang.startsWith('it'));
  // Preferisci voce locale (qualità migliore, meno robotica)
  _voice = it.find(v => v.localService) || it[0] || null;
  if (_voice) console.log(`[Voice] Usando: ${_voice.name} (${_voice.lang}, local=${_voice.localService})`);
  return _voice;
}

// Carica voci subito e al cambio
if ('speechSynthesis' in window) {
  findBestVoice();
  speechSynthesis.addEventListener('voiceschanged', () => { _voiceReady = false; _voice = null; findBestVoice(); });
}

// ============================================================
// HOOK
// ============================================================
export function useCommentary() {
  const enabledRef = useRef(true);
  const speakingRef = useRef(false);
  const currentTextRef = useRef('');
  const listenersRef = useRef(new Set());

  const notifyText = useCallback((text) => {
    currentTextRef.current = text;
    listenersRef.current.forEach(fn => fn(text));
  }, []);

  // Stop qualsiasi voce in corso
  const stopAll = useCallback(() => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  // warmUp — chiamato su click utente per sbloccare audio mobile
  const warmUp = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    // Forza caricamento voci
    if (!_voiceReady) findBestVoice();
    // Su iOS/mobile, un utterance vuoto sblocca la sintesi
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
    console.log('[Voice] warmUp OK');
  }, []);

  // ---- Core speak ----
  const speak = useCallback((text, options = {}) => {
    if (!enabledRef.current || !text) return;
    if (!('speechSynthesis' in window)) {
      // Solo sottotitolo se non c'è Web Speech
      notifyText(text);
      setTimeout(() => { if (currentTextRef.current === text) notifyText(''); }, 3500);
      return;
    }

    const tone = TONES[options.tone] || TONES.normal;

    // Stop voce precedente — mai overlap
    speechSynthesis.cancel();

    // Sottotitolo
    notifyText(text);
    const clearMs = Math.max(4000, text.length * 65);
    setTimeout(() => { if (currentTextRef.current === text) notifyText(''); }, clearMs);

    // Crea utterance
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = tone.rate;
    u.pitch = tone.pitch;
    u.volume = tone.volume;

    // Usa la voce italiana migliore trovata
    if (!_voiceReady) findBestVoice();
    if (_voice) u.voice = _voice;

    u.onstart = () => { speakingRef.current = true; };
    u.onend = () => { speakingRef.current = false; };
    u.onerror = () => { speakingRef.current = false; };

    speechSynthesis.speak(u);
  }, [notifyText]);

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
