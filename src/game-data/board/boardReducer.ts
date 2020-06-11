import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn } from "../GameState";
import { endTurn, gainCoins, drawCards } from "../shared/sharedReducers";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "PASS":
            if (state.currentTurn.type !== "workerPlacement") {
                throw new Error("Unexpected state: can only pass a worker placement turn");
            }
            // First, mark current player as passed
            const wakeUpOrder = state.wakeUpOrder.map(pos => {
                if (!pos || pos.playerId !== state.currentTurn.playerId) {
                    return pos;
                }
                return { ...pos, passed: true };
            }) as GameState["wakeUpOrder"];

            return endTurn({ ...state, wakeUpOrder });

        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "FALL_DRAW_SUMMER":
                    return endTurn(drawCards(state, state.currentTurn.playerId, { summerVisitor: 1 }));
                case "FALL_DRAW_WINTER":
                    return endTurn(drawCards(state, state.currentTurn.playerId, { winterVisitor: 1 }));
                default:
                    return state;
            }
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
