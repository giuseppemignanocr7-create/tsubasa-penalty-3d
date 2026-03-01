import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import Peer from 'peerjs';

const OnlineContext = createContext(null);

const ROOM_PREFIX = 'tsubasa-penalty-';

export function OnlineProvider({ children }) {
  const [mode, setMode] = useState('local'); // 'local' | 'online'
  const [role, setRole] = useState(null); // 'host' | 'guest'
  const [roomCode, setRoomCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [peerError, setPeerError] = useState(null);
  const [myPlayer, setMyPlayer] = useState(null); // 'holly' | 'benji'
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const onMessageRef = useRef(null);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const cleanup = useCallback(() => {
    if (connRef.current) { try { connRef.current.close(); } catch (_) {} connRef.current = null; }
    if (peerRef.current) { try { peerRef.current.destroy(); } catch (_) {} peerRef.current = null; }
    setConnected(false);
    setPeerError(null);
  }, []);

  const sendMessage = useCallback((type, data) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(JSON.stringify({ type, data, timestamp: Date.now() }));
    }
  }, []);

  const onMessage = useCallback((handler) => {
    onMessageRef.current = handler;
  }, []);

  const setupConnection = useCallback((conn) => {
    connRef.current = conn;
    conn.on('open', () => {
      setConnected(true);
      setPeerError(null);
    });
    conn.on('data', (raw) => {
      try {
        const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (onMessageRef.current) onMessageRef.current(msg);
      } catch (_) {}
    });
    conn.on('close', () => {
      setConnected(false);
    });
    conn.on('error', (err) => {
      setPeerError(err.message || 'Errore connessione');
    });
  }, []);

  const hostGame = useCallback(() => {
    cleanup();
    const code = generateRoomCode();
    setRoomCode(code);
    setRole('host');
    setMyPlayer('holly');
    setMode('online');

    const peer = new Peer(ROOM_PREFIX + code, {
      debug: 0,
    });
    peerRef.current = peer;

    peer.on('open', () => {
      setRoomCode(code);
    });
    peer.on('connection', (conn) => {
      setupConnection(conn);
    });
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        setPeerError('Codice stanza già in uso, riprova');
      } else {
        setPeerError(err.message || 'Errore PeerJS');
      }
    });
  }, [cleanup, setupConnection]);

  const joinGame = useCallback((code) => {
    cleanup();
    setRoomCode(code.toUpperCase());
    setRole('guest');
    setMyPlayer('benji');
    setMode('online');

    const peer = new Peer(undefined, { debug: 0 });
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(ROOM_PREFIX + code.toUpperCase());
      setupConnection(conn);
    });
    peer.on('error', (err) => {
      setPeerError(err.message || 'Errore connessione');
    });
  }, [cleanup, setupConnection]);

  const goLocal = useCallback(() => {
    cleanup();
    setMode('local');
    setRole(null);
    setMyPlayer(null);
    setRoomCode('');
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  const value = {
    mode, role, roomCode, connected, peerError, myPlayer,
    hostGame, joinGame, goLocal, sendMessage, onMessage, cleanup,
  };

  return (
    <OnlineContext.Provider value={value}>
      {children}
    </OnlineContext.Provider>
  );
}

export function useOnline() {
  const ctx = useContext(OnlineContext);
  if (!ctx) throw new Error('useOnline must be used within OnlineProvider');
  return ctx;
}
