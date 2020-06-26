import { Action } from "redux";
import { GameAction } from "../game-data/gameActions";

export type AppAction =
    | SetPlayerIdAction
    | JoinGameAction
    | GameAction & { localOnly?: false };

interface SetPlayerIdAction extends Action<"SET_PLAYER_ID"> {
    playerId: string;
    localOnly: true;
}
export const setPlayerId = (playerId: string): SetPlayerIdAction => {
    return { type: "SET_PLAYER_ID", playerId, localOnly: true };
};

export interface JoinGameAction extends Action<"JOIN_GAME"> {
    gameId: string;
    localOnly: true;
}
export const joinGame = (gameId: string): JoinGameAction => {
    return { type: "JOIN_GAME", gameId, localOnly: true };
};
