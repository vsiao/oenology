import { PromptAction, isPromptAction, GrapeSpec } from "./prompts/promptActions";
import { Action } from "redux";
import { PlayerColor, CardsByType } from "./GameState";
import { MamaId, PapaId } from "./mamasAndPapas";
import { UNIMPLEMENTED_CARDS, RHINE_UNIMPLEMENTED_CARDS } from "./visitors/visitorCards";
import { GameOptions } from "../store/AppState";

export type GameAction = (
    | StartGameAction
    | PromptAction
    | UndoAction
    | CHEAT_DrawCardAction
    | CHEAT_GainGrapeAction
) & {
    // Every action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store. The existence of the `_key` property
    // implies that this action was received from firebase.
    _key?: string;

    // Server timestamp of when this action was written to firebase.
    ts?: number;
};

export const isGameAction = (action: Action): action is GameAction => {
    switch (action.type) {
        case "START_GAME":
        case "CHEAT_DRAW_CARD":
        case "CHEAT_GAIN_GRAPE":
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

interface CHEAT_DrawCardAction extends Action<"CHEAT_DRAW_CARD"> {
    id: string;
    playerId: string;
}
export const CHEAT_drawCard = (id: string, playerId: string): GameAction => {
    return { type: "CHEAT_DRAW_CARD", id, playerId, };
};

interface CHEAT_GainGrapeAction extends Action<"CHEAT_GAIN_GRAPE"> {
    grape: GrapeSpec;
    playerId: string;
}
export const CHEAT_gainGrape = (grape: GrapeSpec, playerId: string): GameAction => {
    return { type: "CHEAT_GAIN_GRAPE", grape, playerId };
};
