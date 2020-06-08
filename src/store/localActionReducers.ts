import GameState from "../game-data/GameState";
import { AppAction } from "./actionTypes";

export const local = (state: GameState, action: AppAction) => {
    switch (action.type) {
        case "SET_PLAYER_ID":
            return {
                ...state,
                playerId: action.playerId,
            };
        default:
            return state;
    }
};
