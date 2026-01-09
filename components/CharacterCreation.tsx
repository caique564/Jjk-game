
import React, { useState } from 'react';
import { Character, Origin, CANON_TECHNIQUES, Rarity, Grade } from '../types';
import { generateCharacterProfile } from '../services/geminiService';

interface Props {
  onComplete: (char: Character) => void;
}

const CharacterCreation: React.FC<Props> = ({ onComplete }) => {
  const [origin, setOrigin] = useState<Origin>('Humano');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [techniqueObtained, setTechniqueObtained] = useState<{name: string, rarity: Rarity} | null>(null);

  const [char, setChar] = useState<Character>({
    name: '',
    origin: 'Humano',
    appearance: '',
    technique: '',
    techniqueDescription: '',
    grade: 'Grau 4',
    level: 1,
    xp: 0,
    nextLevelXp: 500,
    spins: 5,
    hasRCT: false,
    stats: { forca: 10, energia: 10, qi: 10, sorte: 5 },
    currentHp: 200,
    currentQi: 150,
    currentStamina: 100,
    inventory: [],
    equipment: {},
    abilities: [],
    statusEffects: [],
    profileImageUrl: ''
  });

  const handleSpin = () => {
    setIsSpinning(true);
    setTechniqueObtained(null);
    
    setTimeout(() => {
      const rand = Math.random() * 100;
      let rarity: Rarity = 'Comum';
      if (rand > 99) rarity = 'Grau Especial';
      else if (rand > 95) rarity = 'Lendário';
      else if (rand > 85) rarity = 'Épico';
      else if (rand > 60) rarity = 'Raro';

      const pool = CANON_TECHNIQUES[rarity];
      const selected = pool[Math.floor(Math.random() * pool.length)];
      
      setTechniqueObtained({ name: selected.name, rarity });
      setChar(prev => ({ 
        ...prev, 
        technique: selected.name, 
        techniqueDescription: selected.desc,
        spins: prev.spins - 1 
      }));
      setIsSpinning(false);
    }, 1500);
  };

  const handleGenerateAvatar = async () => {
    if (!char.appearance || !char.name || !char.technique) {
      alert("Defina nome, técnica e aparência primeiro.");
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `JJK anime character, ${char.name}, technique: ${char.technique}, appearance: ${char.appearance}`;
      const url = await generateCharacterProfile(prompt, char.name);
      setChar(prev => ({ ...prev, profileImageUrl: url }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-[3rem] border border-white/10 animate-in zoom-in duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
      <h2 className="text-4xl sm:text-6xl font-bungee text-white text-center mb-8 italic">DESPERTAR DO VAZIO</h2>
      
      {/* Passo 1: Nome e Origem */}
      <div className="space-y-6 mb-12">
        <input 
          className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-2xl font-marker text-purple-400 outline-none focus:border-purple-500 transition-all"
          placeholder="NOME DO RECEPTÁCULO"
          value={char.name}
          onChange={e => setChar({...char, name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setOrigin('Humano')} className={`p-4 rounded-xl border-2 font-bungee transition-all ${char.origin === 'Humano' ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 opacity-40'}`}>FEITICEIRO</button>
          <button onClick={() => setOrigin('Maldição')} className={`p-4 rounded-xl border-2 font-bungee transition-all ${char.origin === 'Maldição' ? 'border-red-600 bg-red-600/10' : 'border-white/5 opacity-40'}`}>MALDIÇÃO</button>
        </div>
      </div>

      {/* Passo 2: Gacha de Técnica */}
      <div className="mb-12 p-8 bg-black/40 rounded-[2rem] border border-white/5 text-center">
        <h3 className="font-bungee text-white/40 text-xs mb-4 uppercase tracking-widest">Técnica Inata</h3>
        {isSpinning ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-t-purple-500 border-white/10 rounded-full animate-spin"></div>
          </div>
        ) : techniqueObtained ? (
          <div className="h-32 flex flex-col items-center justify-center animate-in zoom-in">
            <span className="text-[10px] font-bungee text-purple-500 mb-1">{techniqueObtained.rarity}</span>
            <span className="text-4xl font-marker text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">{techniqueObtained.name}</span>
            <button onClick={handleSpin} disabled={char.spins <= 0} className="mt-4 text-[9px] font-bungee text-white/30 hover:text-white transition-colors underline">TENTAR NOVAMENTE ({char.spins} 🌀)</button>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center">
            <button onClick={handleSpin} className="px-8 py-4 bg-purple-600 text-white font-bungee rounded-xl hover:scale-105 transition-all shadow-lg shadow-purple-900/40">DESPERTAR TÉCNICA (1 🌀)</button>
            <p className="mt-2 text-[9px] text-white/20 font-mono">VOCÊ TEM {char.spins} CHANCES</p>
          </div>
        )}
      </div>

      {/* Passo 3: Avatar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-center">
        <div className="space-y-4">
           <textarea 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl h-40 resize-none focus:border-purple-500 transition-all outline-none"
              placeholder="DESCREVA SUA APARÊNCIA..."
              value={char.appearance}
              onChange={e => setChar({...char, appearance: e.target.value})}
           />
           <button 
              type="button"
              disabled={isGenerating || !char.technique}
              onClick={handleGenerateAvatar}
              className="w-full py-4 bg-white/10 border border-white/10 text-white font-bungee rounded-xl hover:bg-white/20 transition-all disabled:opacity-20"
           >
             {char.profileImageUrl ? 'REFAZER AVATAR' : 'MANIFESTAR FORMA'}
           </button>
        </div>
        <div className="aspect-square bg-black/60 rounded-3xl border-2 border-dashed border-white/10 overflow-hidden relative">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <span className="font-bungee text-xs text-purple-500 animate-pulse text-center">Tecendo fluxo <br/> amaldiçoado...</span>
            </div>
          ) : char.profileImageUrl ? (
            <img src={char.profileImageUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-8xl">🎭</span>
            </div>
          )}
        </div>
      </div>

      <button 
        disabled={!char.profileImageUrl || !char.technique || !char.name}
        onClick={() => onComplete(char)}
        className="w-full py-6 bg-white text-black font-bungee rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-2xl disabled:opacity-20 uppercase tracking-widest"
      >
        Entrar na Fenda
      </button>
    </div>
  );
};

export default CharacterCreation;
