
import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameMessage, WorldState, ActionEvaluation, Grade, CANON_GRADES } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sanitizeForPrompt = (obj: any) => {
  if (!obj) return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  const removeLargeFields = (target: any) => {
    if (typeof target !== 'object' || target === null) return;
    if (Array.isArray(target)) {
      target.forEach(removeLargeFields);
    } else {
      for (const key in target) {
        if (key === 'imageUrl' || key === 'profileImageUrl' || key === 'iconUrl') {
          target[key] = "[OMITTED]";
        } else if (typeof target[key] === 'object') {
          removeLargeFields(target[key]);
        }
      }
    }
  };
  removeLargeFields(clone);
  return clone;
};

export const generateSceneImage = async (prompt: string) => {
  const model = 'gemini-2.5-flash-image';
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: `High budget JJK anime style, dynamic lighting, supernatural: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
};

export const generateCharacterProfile = async (appearance: string, name: string) => {
  const model = 'gemini-2.5-flash-image';
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: `Official JJK anime character profile sheet, ${name}: ${appearance}` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
};

export const generateNarrative = async (
  character: Character,
  history: GameMessage[],
  userInput: string,
  worldState: WorldState
) => {
  const model = 'gemini-3-flash-preview';

  const safeHistory = sanitizeForPrompt(history.slice(-5));
  const safeCharacter = sanitizeForPrompt(character);
  const safeWorld = sanitizeForPrompt(worldState);

  const systemInstruction = `
    Você é o NARRADOR TÁTICO de Jujutsu Kaisen. 
    LORE RÍGIDA:
    1. HIERARQUIA DE GRAUS (Decrescente): Grau 4 (mais fraco) < Semi-3 < Grau 3 < Semi-2 < Grau 2 < Semi-1 < Grau 1 < Grau Especial (mais forte).
    2. TÉCNICAS: Use exclusivamente técnicas canônicas do mangá/anime (Limitless, Ten Shadows, etc.).
    3. PROGRESSÃO: Se o jogador é Grau 4 e enfrenta um Grau 1, a morte é quase certa. Bloqueie Expansão de Domínio até o Grau 1.
    4. TONALIDADE: Irônico, sombrio e técnico.

    JSON OBRIGATÓRIO:
    {
      "narrative": "...",
      "imagePrompt": "...",
      "actionEvaluation": {
        "status": "ACERTO" | "ERRO" | "IMPOSSÍVEL",
        "reason": "...",
        "damageDealt": n, "qiCost": n, "staminaCost": n,
        "enemyUpdate": { ... }
      },
      "kokusen": boolean,
      "xpGain": n,
      "hpChange": n
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { 
      parts: [
        { text: `MUNDO: ${JSON.stringify(safeWorld)}` },
        { text: `PLAYER: ${JSON.stringify(safeCharacter)}` },
        { text: `ULTIMOS EVENTOS: ${JSON.stringify(safeHistory)}` },
        { text: `AÇÃO: ${userInput}` }
      ] 
    },
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return { ...data, sources: [] };
  } catch (e) {
    return { narrative: "Erro no fluxo de energia.", actionEvaluation: { status: "ERRO" }, sources: [] };
  }
};

export const arbitratePvP = async (p1: Character, p2: Character, a1: string, a2: string) => {
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: `Duelo JJK: P1(${p1.name}, ${p1.grade}, ${p1.technique}) vs P2(${p2.name}, ${p2.grade}, ${p2.technique}). Ações: ${a1} e ${a2}.` }] },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};
