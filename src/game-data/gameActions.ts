import { PromptAction, isPromptAction } from "./prompts/promptActions";
import { Action } from "redux";
import { PlayerColor, CardsByType, WorkerType, WorkerPlacement } from "./GameState";
import { MamaId, PapaId } from "./mamasAndPapas";
import { UNIMPLEMENTED_CARDS, RHINE_UNIMPLEMENTED_CARDS } from "./visitors/visitorCards";
import { GameOptions } from "../store/AppState";

export type PublishedGameAction = (
    | StartGameAction
    | PromptAction
    | PlaceWorkerAction
    | UndoAction
    | GameActionChanged
    | ApplyCheatCodeAction
) & {
    // Every published action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store. The existence of the `_key` property
    // implies that this action was received from firebase.
    _key?: string;

    // Server timestamp of when this action was written to firebase.
    ts?: number;
};

// Local actions only write state on the current client.
export type LocalGameAction =
    | SetWorkerTypeAction
    | PlacePendingWorkerAction;

export type GameAction = PublishedGameAction | LocalGameAction

export const isPublishedGameAction = (action: Action): action is PublishedGameAction => {
    switch (action.type) {
        case "START_GAME":
        case "GAME_ACTION_CHANGED":
        case "APPLY_CHEAT_CODE":
        case "UNDO":
            return true;
        default:
            return isPromptAction(action);
    }
};

export const isLocalGameAction = (action: Action): action is LocalGameAction => {
    switch (action.type) {
        case "SET_WORKER_TYPE":
        case "PLACE_PENDING_WORKER":
            return true;
        default:
            return false;
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

export interface GameActionChanged extends Action<"GAME_ACTION_CHANGED"> {
    key: string;
    // Occasionally, firebase will correct client timestamps, which
    // affects our calculation of turn timers.
    ts: number;
}
export const gameActionChanged = (key: string, ts: number): GameAction => {
    return { type: "GAME_ACTION_CHANGED", key, ts, _key: key, };
};

interface ApplyCheatCodeAction extends Action<"APPLY_CHEAT_CODE"> {
    code: string;
    playerId: string;
}
export const applyCheatCode = (code: string, playerId: string): GameAction => {
    return { type: "APPLY_CHEAT_CODE", code, playerId, };
};

interface SetWorkerTypeAction extends Action<"SET_WORKER_TYPE"> {
    workerType: WorkerType;
}
export const setWorkerType = (workerType: WorkerType): GameAction => {
    return { type: "SET_WORKER_TYPE", workerType };
};

interface PlacePendingWorkerAction extends Action<"PLACE_PENDING_WORKER"> {
    placement?: [WorkerPlacement, number | null];
}
export const placePendingWorker = (placement?: [WorkerPlacement, number | null]): GameAction => {
    return {
        type: "PLACE_PENDING_WORKER",
        placement,
    };
};

interface PlaceWorkerAction extends Action<"PLACE_WORKER"> {
    workerType: WorkerType;
    placement: WorkerPlacement | null; // null means pass
    idx: number | null;
    playerId: string;
}
export const placeWorker = (
    workerType: WorkerType,
    placement: WorkerPlacement | null,
    idx: number | null,
    playerId: string,
): PlaceWorkerAction => {
    return { type: "PLACE_WORKER", placement, idx, workerType, playerId };
};
