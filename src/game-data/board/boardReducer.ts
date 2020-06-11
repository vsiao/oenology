import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn } from "../GameState";
import { endTurn, gainCoins, drawCards, payCoins } from "../shared/sharedReducers";
import { promptToChooseField, promptForAction } from "../prompts/promptReducers";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "FALL_DRAW_SUMMER":
                    return endTurn(drawCards(state, state.currentTurn.playerId, { summerVisitor: 1 }));
                case "FALL_DRAW_WINTER":
                    return endTurn(drawCards(state, state.currentTurn.playerId, { winterVisitor: 1 }));
                case "BUY_FIELD":
                    return promptToChooseField({
                        ...state,
                        currentTurn: {
                            ...state.currentTurn as WorkerPlacementTurn,
                            pendingAction: { type: "buyField" },
                        },
                    });
                case "SELL_FIELD":
                    return promptToChooseField({
                        ...state,
                        currentTurn: {
                            ...state.currentTurn as WorkerPlacementTurn,
                            pendingAction: { type: "sellField" },
                        },
                    });
                case "SELL_GRAPES":
                    return state;
                default:
                    return state;
            }
        case "CHOOSE_FIELD": {
            const currentTurn = state.currentTurn as WorkerPlacementTurn;
            switch (currentTurn.pendingAction!.type) {
                case "buyField":
                case "sellField":
                    const player = state.players[currentTurn.playerId];
                    const field = player.fields[action.fieldId];
                    return endTurn((field.sold ? payCoins : gainCoins)(
                        {
                            ...state,
                            players: {
                                ...state.players,
                                [currentTurn.playerId]: {
                                    ...player,
                                    fields: {
                                        ...player.fields,
                                        [action.fieldId]: {
                                            ...player.fields[action.fieldId],
                                            sold: !field.sold,
                                        },
                                    },
                                },
                            },
                        },
                        currentTurn.playerId,
                        field.value
                    ));
                case "harvest":
                    return state;
                default:
                    return state;
            }
        }
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

        case "PLACE_WORKER": {
            const currentTurn = state.currentTurn as WorkerPlacementTurn;
            switch (action.placement) {
                case "buildStructure":
                    return state;
                case "buySell":
                    return promptForAction({
                        ...state,
                        currentTurn: {
                            ...currentTurn,
                            pendingAction: { type: "buySell" },
                        },
                    }, [
                        { id: "SELL_GRAPES", label: "Sell grape(s)" },
                        { id: "BUY_FIELD", label: "Buy a field" },
                        { id: "SELL_FIELD", label: "Sell a field" },
                    ]);
                case "drawOrder":
                    return endTurn(drawCards(state, state.currentTurn.playerId, {
                        order: 1
                    }));
                case "drawVine":
                    return endTurn(drawCards(state, state.currentTurn.playerId, {
                        vine: 1
                    }));
                case "fillOrder":
                    return state;
                case "gainCoin":
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 1));
                case "giveTour":
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 2));
                case "harvestField":
                    return promptToChooseField({
                        ...state,
                        currentTurn: {
                            ...currentTurn,
                            pendingAction: { type: "harvest" }
                        },
                    });
                case "makeWine":
                    return state;
                case "plantVine":
                    return state;
                case "playSummerVisitor":
                case "playWinterVisitor":
                    return {
                        ...state,
                        currentTurn: {
                            ...currentTurn,
                            pendingAction: { type: "playVisitor" },
                        },
                    };
                case "trainWorker":
                    return state;
                case "yoke":
                    return state;
                default:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const exhaustivenessCheck: never = action.placement;
                    return state;
            }
        }
        default:
            return state;
    }
};
