import { PromptAction, isPromptAction } from "./prompts/promptActions";
import { Action } from "redux";
import { PlayerColor, CardsByType } from "./GameState";
import { MamaId, PapaId } from "./mamasAndPapas";
import { UNIMPLEMENTED_CARDS, RHINE_UNIMPLEMENTED_CARDS } from "./visitors/visitorCards";
import { GameOptions } from "../store/AppState";

export type GameAction = (
    | StartGameAction
    | PromptAction
    | UndoAction
    | EndGameAction
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
        case "END_GAME":
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
    mama?: MamaId; // deprecated; see #PreGameShuffle
    papa?: PapaId; // deprecated; see #PreGameShuffle
}
export interface StartGameAction extends Action<"START_GAME"> {
    players: PlayerInit[];
    options?: GameOptions;
    excludeCards?: { [Id in string]?: true };

    // Properties for backwards-compatibility
    shuffledCards?: CardsByType; // #PreGameShuffle
    startingPlayer?: number;
}
export const startGame = (players: PlayerInit[], options: GameOptions): GameAction => {
    return {
        type: "START_GAME",
        options,
        players,
        excludeCards: options.rhineVisitors
            ? RHINE_UNIMPLEMENTED_CARDS
            : UNIMPLEMENTED_CARDS,
    };
};

interface UndoAction extends Action<"UNDO"> {
    playerId: string;
}
export const undo = (playerId: string): GameAction => {
    return { type: "UNDO", playerId };
};

export interface EndGameAction extends Action<"END_GAME"> {
    playerId: string;
}
export const endGame = (playerId: string): GameAction => {
    return { type: "END_GAME", playerId };
};

interface CHEAT_DrawCardAction extends Action<"CHEAT_DRAW_CARD"> {
    id: string;
    playerId: string;
}
export const CHEAT_drawCard = (id: string, playerId: string): GameAction => {
    return { type: "CHEAT_DRAW_CARD", id, playerId, };
};
