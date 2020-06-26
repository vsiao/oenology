import { Action } from "redux";
import { GameAction } from "../game-data/gameActions";
import { User } from "./AppState";

export type AppAction =
    | SetCurrentUserIdAction
    | GameStatusAction
    | UpdateUserAction
    | JoinGameAction
    | GameAction;

interface SetCurrentUserIdAction extends Action<"SET_CURRENT_USER_ID"> {
    userId: string;
}
export const setCurrentUserId = (userId: string): AppAction => {
    return { type: "SET_CURRENT_USER_ID", userId };
};

export interface JoinGameAction extends Action<"JOIN_GAME"> {
    gameId: string;
}
export const joinGame = (gameId: string): AppAction => {
    return { type: "JOIN_GAME", gameId };
};

export interface GameStatusAction extends Action<"GAME_STATUS"> {
    status: string;
}
export const gameStatus = (status: string): AppAction => {
    return { type: "GAME_STATUS", status };
};

export interface UpdateUserAction extends Action<"UPDATE_USER"> {
    user: User;
}
export const setUser = (user: User): AppAction => {
    return { type: "UPDATE_USER", user };
};
