import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn } from "../GameState";
import { endTurn, gainCoins } from "../shared/sharedReducers";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "PLACE_WORKER":
            switch (action.placement) {
                case "gainCoin":
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 1));
                case "playSummerVisitor":
                case "playWinterVisitor":
                    const currentTurn = state.currentTurn as WorkerPlacementTurn;
                    return {
                        ...state,
                        currentTurn: {
                            ...currentTurn,
                            pendingAction: {
                                type: action.placement,
                            },
                        },
                    };
                default:
                    return state;
            }
        default:
            return state;
    }
};
