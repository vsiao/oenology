import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn } from "../GameState";
import { endTurn, gainCoins, drawCards } from "../shared/sharedReducers";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "PLACE_WORKER":
            switch (action.placement) {
                case "drawOrder":
                    return endTurn(drawCards(state, state.currentTurn.playerId, {
                        order: 1
                    }));
                case "drawVine":
                    return endTurn(drawCards(state, state.currentTurn.playerId, {
                        vine: 1
                    }));
                case "gainCoin":
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 1));
                case "giveTour":
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 2));
                case "playSummerVisitor":
                case "playWinterVisitor":
                    const currentTurn = state.currentTurn as WorkerPlacementTurn;
                    return {
                        ...state,
                        currentTurn: {
                            ...currentTurn,
                            pendingAction: {
                                type: "playVisitor",
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
