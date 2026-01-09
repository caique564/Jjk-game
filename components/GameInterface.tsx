
import React, { useState, useEffect, useRef } from 'react';
import { Character, GameMessage, WorldState, ActionEvaluation, EnemyState, GameStage } from '../types';
import { generateNarrative, generateSceneImage } from '../services/geminiService';
import Inventory from './Inventory';
import GachaInterface from './GachaInterface';

interface Props {
  character: Character;
  updateCharacter: (char: Character) => void;
  onPvP: () => void; // Fix: Added missing prop definition
}

const EnhancedBar = ({ value, max, color, label, isTurnBar = false }: any) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full relative">
      <div className="flex justify-between items-end mb-0.5">
        <span className="text-[7px] font-bungee text-white/40 uppercase">{label}</span>
        {!isTurnBar && <span className="text-[9px] font-mono text-white/70">{Math.floor(value)}/{max}</span>}
      </div>
      <div className={`bar-container ${isTurnBar ? 'h-1' : 'h-2'}`}>
        <div className={`bar-fill ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const GameInterface: React.FC<Props> = ({ character, updateCharacter, onPvP }) => {
  const [history, setHistory] = useState<GameMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [activeEnemy, setActiveEnemy] = useState<EnemyState | null>(null);
  const [worldState, setWorldState] = useState<WorldState>({
      currentArc: "O Despertar",
      currentLocation: "Tokyo - Escola Técnica",
      notableDeaths: [],
      playerReputation: 0,
      globalTension: 20,
      lastUpdateTimestamp: Date.now(),
      dailyBossBeaten: false,
      locations: {},
      npcMemories: {}
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length === 0) handleAction("Iniciar Jornada como " + character.grade);
    
    // Check Daily Boss (08:00 BRT is UTC-3)
    const checkDailyBoss = () => {
        const now = new Date();
        const brtHours = now.getUTCHours() - 3;
        if (brtHours === 8 && !worldState.dailyBossBeaten) {
            handleAction("EVENTO: O Boss Diário de Grau Especial surgiu!");
        }
    };
    const timer = setInterval(checkDailyBoss, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isThinking]);

  const handleAction = async (action: string) => {
    if (isThinking) return;
    setIsThinking(true);
    if (action.length > 0 && !action.startsWith("EVENTO")) {
        setHistory(prev => [...prev, { role: 'player', content: action }]);
    }

    try {
      const response = await generateNarrative(character, history, action, worldState);
      const evalData = response.actionEvaluation;

      // Update character based on AI arbitration
      let newChar = { ...character };
      if (evalData) {
          newChar.currentHp = Math.max(0, Math.min(newChar.stats.forca * 20, newChar.currentHp + (response.hpChange || 0)));
          newChar.currentQi = Math.max(0, newChar.currentQi - (evalData.qiCost || 0));
          newChar.xp += (response.xpGain || 0);
          
          if (evalData.enemyUpdate) setActiveEnemy(evalData.enemyUpdate);
          else if (evalData.status === 'ACERTO' && !evalData.enemyUpdate) setActiveEnemy(null);

          // Level Up Logic
          if (newChar.xp >= newChar.nextLevelXp) {
              newChar.level += 1;
              newChar.xp -= newChar.nextLevelXp;
              newChar.nextLevelXp = Math.floor(newChar.nextLevelXp * 1.5);
              newChar.stats.forca += 2;
              newChar.stats.energia += 2;
          }

          // Special Logic: Daily Boss Drop
          if (action.startsWith("EVENTO") && evalData.status === 'ACERTO' && !evalData.enemyUpdate) {
              newChar.spins += Math.floor(Math.random() * 4) + 2;
              setWorldState(prev => ({ ...prev, dailyBossBeaten: true }));
          }
      }

      const imageUrl = response.imagePrompt ? await generateSceneImage(response.imagePrompt) : undefined;
      
      setHistory(prev => [...prev, { 
        role: 'narrator', 
        content: response.narrative, 
        imageUrl,
        kokusen: response.kokusen,
        actionEvaluation: evalData,
        sources: response.sources // Fix: Store sources from grounding
      }]);
      updateCharacter(newChar);
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[95vh] w-full max-w-6xl mx-auto glass-panel rounded-[2rem] overflow-hidden relative border border-white/10 shadow-2xl">
      
      {/* HUD HEADER */}
      <div className="p-4 sm:p-6 bg-black/90 border-b border-white/10 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 flex items-center gap-4 w-full">
            <img src={character.profileImageUrl} className="w-12 h-12 rounded-xl border border-purple-500" />
            <div className="flex-1 space-y-2">
                <EnhancedBar value={character.currentHp} max={character.stats.forca * 20} color="bg-red-600" label="VITA" />
                <EnhancedBar value={character.currentQi} max={character.stats.energia * 15} color="bg-blue-600" label="ENERGIA" />
            </div>
        </div>

        <div className="md:col-span-2 text-center">
            <div className="text-[10px] font-bungee text-purple-500">LVL {character.level}</div>
            <div className="text-[8px] font-mono text-white/40 uppercase">{character.grade}</div>
        </div>

        <div className="md:col-span-5 w-full">
            {activeEnemy ? (
                <div className="flex flex-row-reverse items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-950/20 border border-red-500/50 flex items-center justify-center text-2xl">👹</div>
                    <div className="flex-1 space-y-2">
                        <EnhancedBar value={activeEnemy.currentHp} max={activeEnemy.maxHp} color="bg-red-900" label={activeEnemy.name} />
                        <div className="text-[7px] font-mono text-red-500 uppercase">{activeEnemy.grade}</div>
                    </div>
                </div>
            ) : (
                <div className="h-10 border border-dashed border-white/10 rounded-xl flex items-center justify-center opacity-30">
                    <span className="text-[8px] font-bungee">AMBIENTE SEGURO</span>
                </div>
            )}
        </div>
      </div>

      {/* FEED */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-black/20">
        {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} animate-message`}>
                <div className={`max-w-[85%] p-6 rounded-3xl border ${msg.role === 'player' ? 'bg-white/5 border-white/10 font-marker text-2xl text-purple-400' : 'bg-white/[0.03] border-white/5 text-gray-200'}`}>
                    {msg.imageUrl && <img src={msg.imageUrl} className="w-full rounded-2xl mb-4 shadow-lg border border-white/5" />}
                    <div className="text-lg leading-relaxed">{msg.content}</div>
                    {msg.kokusen && (
                        <div className="mt-4 p-4 bg-red-600/20 border border-red-600 rounded-xl text-center animate-pulse">
                            <span className="font-bungee text-red-500">⚡ FLASH NEGRO ⚡</span>
                        </div>
                    )}
                    {/* Fix: Rendering search grounding links as required by guidelines */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        {msg.sources.map((s, idx) => (
                          <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-purple-500/20 px-2 py-1 rounded-md text-purple-300 hover:bg-purple-500/40 transition-colors">
                            🔗 {s.title}
                          </a>
                        ))}
                      </div>
                    )}
                </div>
            </div>
        ))}
        {isThinking && <div className="text-center font-bungee text-[8px] text-purple-500 animate-pulse uppercase">Analisando fluxo amaldiçoado...</div>}
      </div>

      {/* INPUT */}
      <div className="p-6 bg-black/80 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex gap-4">
            <button title="Inventário" onClick={() => setShowInventory(true)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">🎒</button>
            <button title="Gacha" onClick={() => setShowGacha(true)} className="p-4 bg-purple-600/20 rounded-2xl hover:bg-purple-600/40 transition-all border border-purple-500/30 flex items-center gap-2">
                <span className="text-xl">🌀</span>
                <span className="font-bungee text-xs text-purple-400">{character.spins}</span>
            </button>
            {/* Fix: Added button to switch to PVP stage */}
            <button title="Modo PVP" onClick={onPvP} className="p-4 bg-red-600/20 rounded-2xl hover:bg-red-600/40 transition-all border border-red-500/30">⚔️</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); handleAction(input); }} className="flex-1 flex gap-4 w-full">
            <input 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-inter focus:border-purple-500 outline-none"
                placeholder="Declare sua intenção..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isThinking}
            />
            <button 
                disabled={isThinking || !input.trim()}
                className="px-10 py-4 bg-white text-black font-bungee rounded-2xl hover:bg-purple-500 hover:text-white transition-all active:scale-95 disabled:opacity-20"
            >
                ENVIAR
            </button>
        </form>
      </div>

      {showInventory && <Inventory character={character} updateCharacter={updateCharacter} onClose={() => setShowInventory(false)} />}
      {showGacha && <GachaInterface character={character} updateCharacter={updateCharacter} onClose={() => setShowGacha(false)} />}
    </div>
  );
};

export default GameInterface;