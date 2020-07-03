import { PromptAction, isPromptAction } from "./prompts/promptActions";
import { Action } from "redux";
import {
    SummerVisitorId,
    WinterVisitorId,
    summerVisitorCards,
    winterVisitorCards,
} from "./visitors/visitorCards";
import { orderCards, OrderId } from "./orderCards";
import { VineId, vineCards } from "./vineCards";
import { CardsByType, PlayerColor } from "./GameState";
import { MamaId, PapaId, mamaCards, papaCards } from "./mamasAndPapas";

export type GameAction = (
    | StartGameAction
    | PromptAction
    | CHEAT_DrawCardAction
) & {
    // Every action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store.
    published?: true;
};

export const isGameAction = (action: Action): action is GameAction => {
    switch (action.type) {
        case "START_GAME":
        case "CHEAT_DRAW_CARD":
            return true;
        default:
            return isPromptAction(action);
    }
};

export interface PlayerInit {
    id: string;
    name: string;
    color: PlayerColor;
    mama: MamaId;
    papa: PapaId;
}
export interface StartGameAction extends Action<"START_GAME"> {
    players: PlayerInit[];
    shuffledCards: CardsByType;
}
export const startGame = (players: Omit<PlayerInit, "mama" | "papa">[]): StartGameAction => {
    const vineIds = Object.keys(vineCards) as VineId[];
    const summerIds = Object.keys(summerVisitorCards) as SummerVisitorId[];
    const orderIds = Object.keys(orderCards) as OrderId[];
    const winterIds = Object.keys(winterVisitorCards) as WinterVisitorId[];
    const mamaIds = Object.keys(mamaCards) as MamaId[];
    const papaIds = Object.keys(papaCards) as PapaId[];

    inPlaceShuffle(vineIds);
    inPlaceShuffle(summerIds);
    inPlaceShuffle(orderIds);
    inPlaceShuffle(winterIds);
    inPlaceShuffle(mamaIds);
    inPlaceShuffle(papaIds);

    return {
        type: "START_GAME",
        players: players.map((p, i) => ({ ...p, mama: mamaIds[i], papa: papaIds[i] })),
        shuffledCards: {
            vine: vineIds,
            summerVisitor: summerIds,
            order: orderIds,
            winterVisitor: winterIds,
        },
    };
};

const inPlaceShuffle = (cards: unknown[]) => {
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i >= 0; --i) {
        const j = Math.floor(Math.random() * (i + 1)); // 0 <= x <= i
        const tmp = cards[i];
        cards[i] = cards[j];
        cards[j] = tmp;
    }
};

export interface CHEAT_DrawCardAction extends Action<"CHEAT_DRAW_CARD"> {
    id: string;
    playerId: string;
}
export const CHEAT_drawCard = (id: string, playerId: string): CHEAT_DrawCardAction => {
    return { type: "CHEAT_DRAW_CARD", id, playerId, };
};
