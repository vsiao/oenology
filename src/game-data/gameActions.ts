import { PromptAction, isPromptAction } from "./prompts/promptActions";
import { Action } from "redux";
import { PlayerColor } from "./GameState";

export type GameAction = (
    | StartGameAction
    | PromptAction
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
    players: PlayerInit[];
}
export const startGame = (players: PlayerInit[]): StartGameAction => {
    return { type: "START_GAME", players, };
};

export interface CHEAT_DrawCardAction extends Action<"CHEAT_DRAW_CARD"> {
    id: string;
    playerId: string;
}
export const CHEAT_drawCard = (id: string, playerId: string): CHEAT_DrawCardAction => {
    return { type: "CHEAT_DRAW_CARD", id, playerId, };
};
