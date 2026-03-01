import { useRef, useCallback, useEffect } from 'react';

const audioCtxRef = { current: null };
let crowdAmbient = null;

function getAudioCtx() {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtxRef.current;
}

function playProceduralSound(type) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    switch (type) {
      case 'kick':
      case 'kick-light':
      case 'kick-medium':
      case 'kick-power': {
        const power = type === 'kick-power' ? 1.0 : type === 'kick-medium' ? 0.6 : 0.3;
        // Layer 1: Noise burst (leather impact)
        const noiseDur = 0.05 + power * 0.07;
        const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * noiseDur, ctx.sampleRate);
        const noiseData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 600 + power * 1400;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5 + power * 0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDur);
        noiseSrc.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
        noiseSrc.start(now);
        // Layer 2: Sine thud (low body)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120 + power * 80, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.35, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(oscGain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'goal-net': {
        // Net rustle: filtered noise burst
        const dur = 0.3;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(now);
        break;
      }
      case 'crowd-roar': {
        const dur = 2.0;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 0.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
        gain.gain.linearRampToValueAtTime(0.15, now + dur * 0.5);
        gain.gain.linearRampToValueAtTime(0, now + dur);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(now);
        break;
      }
      case 'save-catch':
      case 'save-tip': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 100;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'post-hit': {
        const harmonics = [440, 880, 1320, 1760];
        harmonics.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.frequency.value = freq;
          osc.type = 'sine';
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.4 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
        });
        break;
      }
      case 'crossbar-hit': {
        const harmonics = [523, 1046, 1568];
        harmonics.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.frequency.value = freq;
          osc.type = 'sine';
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.35 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.0);
        });
        break;
      }
      case 'miss-whoosh': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'whistle-short':
      case 'whistle-long': {
        const dur = type === 'whistle-long' ? 0.8 : 0.4;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 800;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
        gain.gain.setValueAtTime(0.5, now + dur - 0.08);
        gain.gain.linearRampToValueAtTime(0, now + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
        break;
      }
      case 'perfect-shot':
      case 'dramatic-impact': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'crowd-ambient-start': {
        if (crowdAmbient) return;
        const dur = 8;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const mod = Math.sin(i / ctx.sampleRate * 0.3) * 0.5 + 0.5;
          data[i] = (Math.random() * 2 - 1) * mod * 0.3;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.3;
        const gain = ctx.createGain();
        gain.gain.value = 0.08;
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(now);
        crowdAmbient = { source: src, gain };
        break;
      }
      case 'crowd-ambient-stop': {
        if (crowdAmbient) {
          try { crowdAmbient.source.stop(); } catch (_) {}
          crowdAmbient = null;
        }
        break;
      }
      default: break;
    }
  } catch (e) {
    /* graceful degradation */
  }
}

export function useSound() {
  const howlsRef = useRef({});

  const play = useCallback((soundName) => {
    playProceduralSound(soundName);
  }, []);

  const stopAll = useCallback(() => {
    Object.values(howlsRef.current).forEach((h) => { try { h.stop(); } catch (_) {} });
    playProceduralSound('crowd-ambient-stop');
  }, []);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  return { play, stopAll };
}
