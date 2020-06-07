import React from 'react';
import OenologyGame from './game-views/OenologyGame';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        oenology
      </header>
      <OenologyGame currentPlayerId={"viny"} />
    </div>
  );
}

export default App;
