import { Action } from "redux";
import { GameAction } from "../game-data/gameActions";
import { User } from "./AppState";
import GameState from "../game-data/GameState";

export type AppAction =
    | SetCurrentUserIdAction
    | SetCurrentUserNameAction
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

export interface JoinGameAction extends Action<"JOIN_GAME"> {
    gameId: string;
}
export const joinGame = (gameId: string): AppAction => {
    return { type: "JOIN_GAME", gameId };
};

interface GameStatusAction extends Action<"GAME_STATUS"> {
    status: string;
}
export const gameStatus = (status: string): AppAction => {
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
