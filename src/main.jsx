import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './game/GameProvider';
import { OnlineProvider } from './game/OnlineProvider';
import './styles/global.css';
import './styles/animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OnlineProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </OnlineProvider>
  </React.StrictMode>
);
