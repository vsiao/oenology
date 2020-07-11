import { PromptAction, isPromptAction } from "./prompts/promptActions";
import { Action } from "redux";
import { PlayerColor, CardsByType } from "./GameState";
import { MamaId, PapaId } from "./mamasAndPapas";
import { UNIMPLEMENTED_CARDS } from "./visitors/visitorCards";

export type GameAction = (
    | StartGameAction
    | PromptAction
    | UndoAction
    | CHEAT_DrawCardAction
) & {
    // Every action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store.
    _key?: string;
};

export const isGameAction = (action: Action): action is GameAction => {
    switch (action.type) {
        case "START_GAME":
        case "CHEAT_DRAW_CARD":
        case "UNDO":
            return true;
        default:
            return isPromptAction(action);
    }
};

export interface PlayerInit {
    id: string;
    name: string;
    color: PlayerColor;
}
export interface StartGameAction extends Action<"START_GAME"> {
    players: (PlayerInit & {
        mama?: MamaId; // deprecated; see #PreGameShuffle
        papa?: PapaId; // deprecated; see #PreGameShuffle
    })[];
    shuffledCards?: CardsByType; // deprecated; see #PreGameShuffle
    excludeCards?: { [Id in string]?: true };
}
export const startGame = (players: PlayerInit[]): StartGameAction => {
    return { type: "START_GAME", players, excludeCards: UNIMPLEMENTED_CARDS };
};

export interface UndoAction extends Action<"UNDO"> {
    playerId: string;
}
export const undo = (playerId: string): GameAction => {
    return { type: "UNDO", playerId };
};

export interface CHEAT_DrawCardAction extends Action<"CHEAT_DRAW_CARD"> {
    id: string;
    playerId: string;
}
export const CHEAT_drawCard = (id: string, playerId: string): CHEAT_DrawCardAction => {
    return { type: "CHEAT_DRAW_CARD", id, playerId, };
};
