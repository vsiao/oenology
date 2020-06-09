import { Action } from "redux";
import { GameAction } from "../game-data/gameActions";

export type AppAction =
    | SetPlayerIdAction
    | GameAction & { localOnly?: false };

interface SetPlayerIdAction extends Action<"SET_PLAYER_ID"> {
    playerId: string;
    localOnly: true;
}
export const setPlayerId = (playerId: string): SetPlayerIdAction => {
    return { type: "SET_PLAYER_ID", playerId, localOnly: true };
};
