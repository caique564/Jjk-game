
import React, { useState, useEffect } from 'react';
import { GameStage, Character } from './types';
import CharacterCreation from './components/CharacterCreation';
import GameInterface from './components/GameInterface';
import PvPInterface from './components/PvPInterface';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.START);
  const [character, setCharacter] = useState<Character | undefined>();
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jg_character');
    if (saved) setHasSave(true);
  }, []);

  const handleCharComplete = (char: Character) => {
    // A imagem já vem gerada do componente CharacterCreation
    setCharacter(char);
    // Salva o personagem
    localStorage.setItem('jg_character', JSON.stringify(char));
    setStage(GameStage.PLAYING);
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 flex flex-col items-center justify-center">
      {stage === GameStage.START && (
        <div className="text-center space-y-8 sm:space-y-12 max-w-2xl animate-in fade-in duration-700 p-4">
          <h1 className="text-5xl sm:text-7xl font-bungee text-white drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]">
            JUJUTSU <br/> <span className="text-purple-500">ALÉM DO VAZIO</span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-400 font-marker">Onde seu destino desvia do canon e o mundo nunca dorme.</p>
          <div className="flex flex-col gap-4 items-center">
            <button onClick={() => setStage(GameStage.CHARACTER_CREATION)} className="w-full sm:w-64 py-5 sm:py-6 bg-white text-black font-bungee rounded-2xl hover:scale-105 transition-all shadow-xl">NOVA JORNADA</button>
            {hasSave && <button onClick={() => { setCharacter(JSON.parse(localStorage.getItem('jg_character')!)); setStage(GameStage.PLAYING); }} className="w-full sm:w-64 py-4 bg-purple-900/20 text-purple-400 font-bungee rounded-2xl border border-purple-500/20">CARREGAR DESTINO</button>}
          </div>
        </div>
      )}

      {stage === GameStage.CHARACTER_CREATION && <CharacterCreation onComplete={handleCharComplete} />}

      {stage === GameStage.PLAYING && character && (
        <GameInterface character={character} updateCharacter={setCharacter} onPvP={() => setStage(GameStage.PVP_BATTLE)} />
      )}

      {stage === GameStage.PVP_BATTLE && character && (
        <PvPInterface player={character} onExit={() => setStage(GameStage.PLAYING)} updatePlayer={setCharacter} />
      )}
    </div>
  );
};

export default App;
