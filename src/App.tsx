import './App.css'
import GameCanvas from './GameCanvas'
import Welcome from './Welcome'
import { useState } from 'react'

function App() {
  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null);
  return tiktokUsername === null ? (
    <Welcome onStart={setTiktokUsername} />
  ) : (
      <GameCanvas username={tiktokUsername} onError={() => setTiktokUsername(null)} />
    );
}

export default App
