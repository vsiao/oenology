import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn } from "../GameState";
import { endTurn, gainCoins, drawCards, payCoins, trainWorker, harvestField } from "../shared/sharedReducers";
import { promptToChooseField, promptForAction } from "../prompts/promptReducers";
import { hasNonEmptyCrushPad, buyFieldDisabledReason } from "../shared/sharedSelectors";
import { VineId } from "../vineCards";

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
                    return endTurn(state); // TODO
                default:
                    return state;
            }
        case "CHOOSE_FIELD": {
            const currentTurn = state.currentTurn as WorkerPlacementTurn;
            const player = state.players[currentTurn.playerId];
            const field = player.fields[action.fieldId];
            const pendingAction = currentTurn.pendingAction!;

            switch (pendingAction.type) {
                case "buyField":
                case "sellField":
                    return endTurn((field.sold ? payCoins : gainCoins)(
                        {
                            ...state,
                            players: {
                                ...state.players,
                                [player.id]: {
                                    ...player,
                                    fields: {
                                        ...player.fields,
                                        [field.id]: { ...field, sold: !field.sold },
                                    },
                                },
                            },
                        },
                        currentTurn.playerId,
                        field.value
                    ));
                case "plantVine":
                    const vines: VineId[] = [...field.vines, pendingAction.vineId!];
                    return endTurn({
                        ...state,
                        players: {
                            ...state.players,
                            [player.id]: {
                                ...player,
                                fields: {
                                    ...player.fields,
                                    [field.id]: { ...field, vines },
                                },
                            },
                        },
                    });
                case "harvestField":
                    return endTurn(harvestField(state, field.id));
                default:
                    return state;
            }
        }
        case "CHOOSE_VINE":
            const currentTurn = state.currentTurn as WorkerPlacementTurn;
            return promptToChooseField({
                ...state,
                currentTurn: {
                    ...currentTurn,
                    pendingAction: { type: "plantVine", vineId: action.vineId },
                },
            });

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

            // Then perform normal endTurn procedure, which may transition to the next season
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
                        {
                            id: "SELL_GRAPES",
                            label: "Sell grape(s)",
                            disabledReason: hasNonEmptyCrushPad(state)
                                ? undefined
                                : "You don't have any grapes!",
                        },
                        {
                            id: "BUY_FIELD",
                            label: "Buy a field",
                            disabledReason: buyFieldDisabledReason(state),
                        },
                        {
                            id: "SELL_FIELD",
                            label: "Sell a field",
                            disabledReason: Object.values(state.players[currentTurn.playerId].fields)
                                .every(fields => fields.sold)
                                ? "You don't have any fields to sell."
                                : undefined,
                        },
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
                            pendingAction: { type: "harvestField" }
                        },
                    });
                case "makeWine":
                    return state;
                case "plantVine":
                    return {
                        ...state,
                        currentTurn: {
                            ...currentTurn,
                            pendingAction: { type: "plantVine" },
                        },
                    };
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
                    return endTurn(trainWorker(state, state.currentTurn.playerId, 4));
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
