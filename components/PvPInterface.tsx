
import React, { useState, useEffect } from 'react';
import { Character, GameMessage } from '../types';
import { arbitratePvP, generateSceneImage } from '../services/geminiService';

interface Props {
  player: Character;
  onExit: () => void;
  updatePlayer: (char: Character) => void;
}

const PvPInterface: React.FC<Props> = ({ player, onExit, updatePlayer }) => {
  const [roomCode, setRoomCode] = useState('');
  const [inLobby, setInLobby] = useState(true);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [playerAction, setPlayerAction] = useState('');
  const [battleHistory, setBattleHistory] = useState<GameMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [battleImage, setBattleImage] = useState<string | undefined>();

  // Simulação de "achar oponente" por código
  const joinRoom = () => {
    if(!roomCode) return;
    setIsThinking(true);
    setTimeout(() => {
        // Mock de oponente baseado em um "Shadow Duelist" (pode ser expandido para backend real)
        const mockOpponent: Character = {
            ...player,
            name: "Sombras de Shibuya",
            origin: "Maldição",
            level: player.level + 1,
            profileImageUrl: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400"
        };
        setOpponent(mockOpponent);
        setInLobby(false);
        setIsThinking(false);
        setBattleHistory([{ role: 'narrator', content: `O Duelo de Expansão começou na sala ${roomCode}! Manifestem sua vontade.` }]);
    }, 2000);
  };

  const handleTurn = async () => {
    if(!playerAction || !opponent) return;
    setIsThinking(true);
    
    // Simula uma ação do oponente baseada na técnica dele
    const oppActions = ["Expansão de Domínio!", "Corte Rápido", "Flash Negro", "Recuar e Curar"];
    const randomOppAction = oppActions[Math.floor(Math.random() * oppActions.length)];

    try {
        const result = await arbitratePvP(player, opponent, playerAction, randomOppAction);
        
        const newImg = await generateSceneImage(`Battle between ${player.technique} and ${opponent.technique}: ${result.narrative}`);
        setBattleImage(newImg);

        setBattleHistory(prev => [
            ...prev,
            { role: 'player', content: playerAction },
            { role: 'opponent', content: randomOppAction },
            { role: 'narrator', content: result.narrative, kokusen: result.kokusen }
        ]);

        // Atualiza status do player (persiste o dano do PvP)
        updatePlayer({
            ...player,
            currentHp: Math.max(0, player.currentHp - result.p1Damage),
            currentQi: Math.max(0, player.currentQi - result.p1QiCost)
        });

        if(result.winner) {
            alert(result.winner === 'P1' ? "VITÓRIA! O Vazio te pertence." : "DERROTA... Sua alma foi consumida.");
            onExit();
        }

    } catch (e) {
        console.error(e);
    } finally {
        setIsThinking(false);
        setPlayerAction('');
    }
  };

  if (inLobby) {
    return (
      <div className="max-w-2xl mx-auto p-12 glass-panel rounded-[3rem] text-center space-y-8 animate-in zoom-in duration-500">
        <h2 className="text-5xl font-bungee text-white italic tracking-tighter">LOBBY DE EXTERMÍNIO</h2>
        <p className="text-xs text-purple-400 font-mono tracking-widest uppercase">Insira o Código da Fenda para Duelar</p>
        
        <input 
            className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-2xl text-center text-3xl font-bungee outline-none focus:border-purple-500 transition-all"
            placeholder="EX: VOID-99"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
        />

        <div className="grid grid-cols-2 gap-4">
            <button onClick={joinRoom} disabled={!roomCode || isThinking} className="py-6 bg-white text-black font-bungee rounded-2xl hover:bg-purple-500 hover:text-white transition-all">ENTRAR NA SALA</button>
            <button onClick={onExit} className="py-6 bg-white/5 text-gray-500 font-bungee rounded-2xl border border-white/10 hover:bg-red-500/20 hover:text-red-500 transition-all">RECUAR</button>
        </div>
        
        {isThinking && <div className="animate-pulse text-purple-500 font-bungee text-xs">BUSCANDO ASSINATURA DE ENERGIA...</div>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-[90vh] glass-panel rounded-[3rem] overflow-hidden shadow-2xl relative">
        {/* Versus Header */}
        <div className="grid grid-cols-3 p-8 bg-black/60 items-center border-b border-white/5">
            <div className="text-left space-y-2">
                <img src={player.profileImageUrl} className="w-20 h-20 rounded-2xl border-2 border-blue-500 mx-auto md:mx-0 object-cover" />
                <h4 className="font-bungee text-white">{player.name}</h4>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden"><div className="h-full bg-red-600" style={{width: `${(player.currentHp/(player.stats.forca*20))*100}%`}}></div></div>
            </div>
            <div className="text-center font-bungee text-6xl text-white italic italic opacity-20">VS</div>
            <div className="text-right space-y-2">
                <img src={opponent?.profileImageUrl} className="w-20 h-20 rounded-2xl border-2 border-red-500 ml-auto object-cover" />
                <h4 className="font-bungee text-white">{opponent?.name}</h4>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden"><div className="h-full bg-red-600 ml-auto" style={{width: '100%'}}></div></div>
            </div>
        </div>

        {/* Battle Feed */}
        <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.05)_0%,_transparent_70%)]">
            {battleImage && <img src={battleImage} className="w-full h-64 object-cover rounded-3xl border border-white/10 shadow-2xl mb-8" />}
            {battleHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-[70%] border ${msg.role === 'narrator' ? 'bg-black/60 border-white/5 italic' : (msg.role === 'player' ? 'bg-blue-600/10 border-blue-500/30' : 'bg-red-600/10 border-red-500/30')}`}>
                        <p className={`text-sm ${msg.role === 'narrator' ? 'text-gray-300' : 'font-bungee text-xs'}`}>{msg.content}</p>
                    </div>
                </div>
            ))}
            {isThinking && <div className="text-center animate-pulse text-purple-500 font-bungee text-[10px]">O JUIZ ESTÁ OBSERVANDO...</div>}
        </div>

        {/* Action Input */}
        <div className="p-8 bg-black/80 border-t border-white/5 flex gap-4">
            <input 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all font-marker text-xl text-purple-400"
                placeholder="Qual seu próximo movimento?"
                value={playerAction}
                onChange={e => setPlayerAction(e.target.value)}
                disabled={isThinking}
            />
            <button onClick={handleTurn} disabled={isThinking || !playerAction} className="px-10 bg-white text-black font-bungee rounded-2xl hover:bg-purple-500 hover:text-white transition-all active:scale-95">GOLPEAR</button>
        </div>
    </div>
  );
};

export default PvPInterface;
