
export enum GameStage {
  START = 'START',
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  PROFILE_GENERATION = 'PROFILE_GENERATION',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  GACHA = 'GACHA',
  PVP_BATTLE = 'PVP_BATTLE'
}

export type Grade = 
  | 'Grau 4' 
  | 'Semi-Grau 3' 
  | 'Grau 3' 
  | 'Semi-Grau 2' 
  | 'Grau 2' 
  | 'Semi-Grau 1' 
  | 'Grau 1' 
  | 'Grau Especial';

export type Rarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Grau Especial';
export type Slot = 'Arma' | 'Vestimenta' | 'Amuleto';
export type Origin = 'Humano' | 'Maldição';

export interface Ability {
  id: string;
  name: string;
  description: string;
  qiCost: number;
  staminaCost: number;
  type: 'Ativa' | 'Passiva';
  effect: string;
  requiredLevel: number;
  isUltimate?: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  slot: Slot;
  bonus: {
    forca?: number;
    energia?: number;
    qi?: number;
    sorte?: number;
  };
  iconUrl?: string;
}

export interface EnemyState {
  name: string;
  currentHp: number;
  maxHp: number;
  currentQi: number;
  maxQi: number;
  currentStamina: number;
  maxStamina: number;
  statusEffects: string[];
  grade: Grade;
}

export interface ActionEvaluation {
  status: 'ACERTO' | 'ERRO' | 'IMPOSSÍVEL' | 'CRÍTICO';
  reason: string;
  damageDealt: number;
  qiCost: number;
  staminaCost: number;
  statusEffect?: string;
  hpRecovered?: number;
  enemyUpdate?: EnemyState; 
}

export interface WorldState {
  currentArc: string;
  currentLocation: string;
  notableDeaths: string[];
  playerReputation: number;
  globalTension: number;
  lastUpdateTimestamp: number;
  dailyBossBeaten: boolean;
  locations: Record<string, any>;
  npcMemories: Record<string, any>;
}

export interface Character {
  name: string;
  origin: Origin;
  appearance: string;
  technique: string;
  techniqueDescription: string;
  grade: Grade;
  level: number;
  xp: number;
  nextLevelXp: number;
  spins: number;
  hasRCT: boolean;
  profileImageUrl?: string;
  stats: {
    forca: number;
    energia: number;
    qi: number;
    sorte: number;
  };
  currentHp: number;
  currentQi: number;
  currentStamina: number;
  inventory: Item[];
  equipment: {
    Arma?: Item;
    Vestimenta?: Item;
    Amuleto?: Item;
  };
  abilities: Ability[];
  statusEffects: string[];
}

export interface GameMessage {
  role: 'narrator' | 'player' | 'opponent';
  content: string;
  imageUrl?: string;
  actionEvaluation?: ActionEvaluation;
  isCombat?: boolean;
  kokusen?: boolean;
  xpGain?: number;
  sources?: { title: string; uri: string; }[];
}

export const CANON_GRADES: Grade[] = [
  'Grau 4', 'Semi-Grau 3', 'Grau 3', 'Semi-Grau 2', 
  'Grau 2', 'Semi-Grau 1', 'Grau 1', 'Grau Especial'
];

export const CANON_TECHNIQUES: Record<Rarity, { name: string, desc: string }[]> = {
  'Comum': [
    { name: 'Corte Simples', desc: 'Técnica de barreira para neutralizar domínios.' },
    { name: 'Reforço de Energia', desc: 'O básico: socos carregados com energia amaldiçoada.' },
    { name: 'Vigor Amaldiçoado', desc: 'Aumento passivo de resistência física.' },
    { name: 'Miráculo', desc: 'Acúmulo de pequenos milagres diários (Haruta).' },
    { name: 'Técnica Inversa (Jiro)', desc: 'Inverte a força dos ataques recebidos.' }
  ],
  'Raro': [
    { name: 'Manipulação de Sangue', desc: 'Controle total do próprio sangue para combate (Kamo/Choso).' },
    { name: 'Fala Amaldiçoada', desc: 'Suas palavras se tornam ordens fatais (Inumaki).' },
    { name: 'Boneca de Palha', desc: 'Ressonância através de pregos e bonecos (Nobara).' },
    { name: 'Manipulação de Ferramentas', desc: 'Voar e controlar vassouras ou armas (Momo).' },
    { name: 'Técnica de Projeção', desc: 'Divide um segundo em 24 quadros (Naobito/Naoya).' }
  ],
  'Épico': [
    { name: 'Ratio Technique', desc: 'Cria um ponto fraco na proporção 7:3 (Nanami).' },
    { name: 'Boogie Woogie', desc: 'Troca de lugar batendo palmas (Todo).' },
    { name: 'Criação', desc: 'Materializa objetos do nada à custa de muita energia (Mai/Yorozu).' },
    { name: 'Disaster Flames', desc: 'Chamas vulcânicas devastadoras (Jogo).' },
    { name: 'Disaster Plants', desc: 'Controle de raízes e flores amaldiçoadas (Hanami).' }
  ],
  'Lendário': [
    { name: 'Dez Sombras', desc: 'Invocação de shikigamis através de sombras (Megumi).' },
    { name: 'Manipulação de Espíritos', desc: 'Absorve e controla maldições derrotadas (Geto/Kenjaku).' },
    { name: 'Star Rage', desc: 'Adiciona massa virtual a si mesma (Yuki Tsukumo).' },
    { name: 'Sky Manipulation', desc: 'Dobra o espaço como se fosse uma superfície (Uro).' },
    { name: 'Granite Blast', desc: 'Disparo massivo de energia pura (Ryu Ishigori).' }
  ],
  'Grau Especial': [
    { name: 'Ilimitado', desc: 'Controle do infinito para defesa e ataque (Gojo).' },
    { name: 'Santuário', desc: 'Cortes invisíveis que fatiam tudo no alcance (Sukuna).' },
    { name: 'Transfiguração Inerte', desc: 'Altera a forma da alma através do toque (Mahito).' },
    { name: 'Cópia', desc: 'Mimetiza técnicas amaldiçoadas de outros (Yuta Okkotsu).' },
    { name: 'Comediante', desc: 'Torna real tudo o que o usuário acha engraçado (Takaba).' }
  ]
};
