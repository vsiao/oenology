import { Action } from "redux";

export type LocalAction =
    | SetPlayerIdAction;

interface SetPlayerIdAction extends Action<"SET_PLAYER_ID"> {
    playerId: string;
    localOnly: true;
}
export const setPlayerId = (playerId: string): LocalAction => {
    return { type: "SET_PLAYER_ID", playerId, localOnly: true };
};
