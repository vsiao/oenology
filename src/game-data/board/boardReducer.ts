import { GameAction } from "../gameActions";
import GameState from "../GameState";
import { endTurn, gainCoins } from "../shared/sharedReducers";

export const board = (state: GameState, action: GameAction) => {
    switch (action.type) {
        case "PLACE_WORKER":
            switch (action.placement) {
                case "gainCoin":
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 1));
                default:
                    return state;
            }
        default:
            return state;
    }
};
