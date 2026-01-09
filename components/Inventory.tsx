
import React, { useState } from 'react';
import { Character, Item, CANON_TECHNIQUES, Rarity } from '../types';

interface Props {
  character: Character;
  updateCharacter: (char: Character) => void;
  onClose: () => void;
}

const Inventory: React.FC<Props> = ({ character, updateCharacter, onClose }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'gacha'>('items');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{name: string, rarity: Rarity} | null>(null);

  const handlePull = () => {
    if (character.spins <= 0 || isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
        const rand = Math.random() * 100;
        let rarity: Rarity = 'Comum';
        if (rand > 99) rarity = 'Grau Especial';
        else if (rand > 95) rarity = 'Lendário';
        else if (rand > 85) rarity = 'Épico';
        else if (rand > 60) rarity = 'Raro';

        const pool = CANON_TECHNIQUES[rarity];
        const selected = pool[Math.floor(Math.random() * pool.length)];

        setResult({ name: selected.name, rarity });
        setIsSpinning(false);
        updateCharacter({
            ...character,
            spins: character.spins - 1,
            technique: selected.name,
            techniqueDescription: selected.desc
        });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="max-w-4xl w-full glass-panel p-6 sm:p-10 rounded-[3rem] border border-white/10 h-[85vh] flex flex-col relative overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex gap-6">
                <button onClick={() => setActiveTab('items')} className={`text-2xl font-bungee transition-all ${activeTab === 'items' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}>Mochila</button>
                <button onClick={() => setActiveTab('gacha')} className={`text-2xl font-bungee transition-all ${activeTab === 'gacha' ? 'text-purple-500' : 'text-white/20 hover:text-white/40'}`}>Despertar</button>
            </div>
            <button onClick={onClose} className="text-2xl opacity-50 hover:opacity-100 font-bungee">×</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeTab === 'items' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {character.inventory.map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4 items-center">
                            <div className="w-16 h-16 bg-black rounded-xl border border-white/5 overflow-hidden">
                                <img src={item.iconUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bungee text-[10px] text-purple-400">{item.name}</h4>
                                <p className="text-[9px] text-white/40 line-clamp-1">{item.description}</p>
                            </div>
                        </div>
                    ))}
                    {character.inventory.length === 0 && (
                        <div className="col-span-full h-40 flex flex-col items-center justify-center opacity-10">
                            <span className="text-4xl mb-2">🌫️</span>
                            <span className="font-bungee text-xs">Vazio</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
                    <div className="relative">
                        <div className={`w-40 h-40 rounded-full border-4 border-dashed border-purple-500/20 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                            {isSpinning ? (
                                <span className="text-4xl">🌀</span>
                            ) : result ? (
                                <div className="animate-in zoom-in text-center">
                                    <span className="block text-[8px] font-bungee text-purple-500">{result.rarity}</span>
                                    <span className="text-2xl font-marker">{result.name}</span>
                                </div>
                            ) : (
                                <span className="text-6xl opacity-10 font-bungee">?</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 w-full max-w-sm">
                        <button 
                            onClick={handlePull}
                            disabled={character.spins <= 0 || isSpinning}
                            className="w-full py-5 bg-purple-600 text-white font-bungee rounded-2xl hover:scale-105 transition-all shadow-xl disabled:opacity-20"
                        >
                            Spin ({character.spins} 🌀)
                        </button>
                        <p className="text-[9px] font-mono text-white/30 uppercase">Atenção: Trocar de técnica substitui a atual permanentemente.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
