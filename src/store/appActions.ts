import { Action } from "redux";
import { GameAction } from "../game-data/gameActions";
import { User, GameStatus, GameOptions } from "./AppState";
import GameState, { PlayerColor } from "../game-data/GameState";

export type AppAction =
    | SetCurrentUserIdAction
    | SetCurrentUserNameAction
    | SetGameOptionAction
    | SetPlayerColorAction
    | GameOptionsAction
    | GameStatusAction
    | HydrateGameAction
    | UpdateUserAction
    | JoinGameAction
    | GameAction;

interface SetCurrentUserIdAction extends Action<"SET_CURRENT_USER_ID"> {
    userId: string;
}
export const setCurrentUserId = (userId: string): AppAction => {
    return { type: "SET_CURRENT_USER_ID", userId };
};

export interface SetCurrentUserNameAction extends Action<"SET_CURRENT_USER_NAME"> {
    name: string;
}
export const setCurrentUserName = (name: string): AppAction => {
    return { type: "SET_CURRENT_USER_NAME", name };
};

export interface SetGameOptionAction extends Action<"SET_GAME_OPTION"> {
    option: string;
    value: string | boolean | number;
}
export const setGameOption = (option: string, value: string | number | boolean): AppAction => {
    return { type: "SET_GAME_OPTION", option, value };
};

export interface SetPlayerColorAction extends Action<"SET_PLAYER_COLOR"> {
    color: PlayerColor;
}
export const setPlayerColor = (color: PlayerColor): AppAction => {
    return { type: "SET_PLAYER_COLOR", color };
};

export interface JoinGameAction extends Action<"JOIN_GAME"> {
    gameId: string;
    playerOverride: string | null;
}
export const joinGame = (gameId: string, playerOverride: string | null): AppAction => {
    return { type: "JOIN_GAME", gameId, playerOverride };
};

interface GameOptionsAction extends Action<"GAME_OPTIONS"> {
    options: GameOptions;
}
export const gameOptions = (options: GameOptions): AppAction => {
    return { type: "GAME_OPTIONS", options };
};

interface GameStatusAction extends Action<"GAME_STATUS"> {
    status: GameStatus | null;
}
export const gameStatus = (status: GameStatus | null): AppAction => {
    return { type: "GAME_STATUS", status };
};

interface HydrateGameAction extends Action<"HYDRATE_GAME"> {
    state: GameState;
}
export const hydrateGame = (state: GameState): AppAction => {
    return { type: "HYDRATE_GAME", state };
};

interface UpdateUserAction extends Action<"UPDATE_USER"> {
    user: User;
}
export const setUser = (user: User): AppAction => {
    return { type: "UPDATE_USER", user };
};
