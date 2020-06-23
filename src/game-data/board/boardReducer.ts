import { GameAction } from "../gameActions";
import GameState from "../GameState";
import {
    buildStructure,
    drawCards,
    endTurn,
    gainCoins,
    harvestField,
    makeWineFromGrapes,
    payCoins,
    removeCardsFromHand,
    setPendingAction,
    trainWorker,
    passToNextSeason,
    chooseWakeUpIndex,
    gainVP,
    promptToDrawWakeUpVisitor,
    plantVineInField,
    updatePlayer,
    pushActivityLog,
    fillOrder,
} from "../shared/sharedReducers";
import { promptToChooseField, promptForAction, promptToMakeWine, promptToBuildStructure, promptToChooseCard, promptToChooseVineCard, promptToChooseOrderCard, promptToFillOrder } from "../prompts/promptReducers";
import { buyFieldDisabledReason, needGrapesDisabledReason } from "../shared/sharedSelectors";
import { structures } from "../structures";
import { visitorCards } from "../visitors/visitorCards";

export const board = (state: GameState, action: GameAction): GameState => {
    const hasPlacementBonus = Object.keys(state.players).length > 2;

    switch (action.type) {
        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "FALL_DRAW_SUMMER":
                    return endTurn(drawCards(state, { summerVisitor: 1 }));
                case "FALL_DRAW_WINTER":
                    return endTurn(drawCards(state, { winterVisitor: 1 }));
                case "BOARD_BUY_FIELD":
                    return promptToChooseField(setPendingAction({ type: "buyField" }, state));
                case "BOARD_SELL_FIELD":
                    return promptToChooseField(setPendingAction({ type: "sellField" }, state));
                case "BOARD_SELL_GRAPES":
                    return endTurn(state); // TODO (+bonus)
                case "WAKE_UP_1":
                    return chooseWakeUpIndex(0, state);
                case "WAKE_UP_2":
                    return chooseWakeUpIndex(1, drawCards(state, { vine: 1 }));
                case "WAKE_UP_3":
                    return chooseWakeUpIndex(2, drawCards(state, { order: 1 }));
                case "WAKE_UP_4":
                    return chooseWakeUpIndex(3, gainCoins(1, state));
                case "WAKE_UP_5":
                    return promptToDrawWakeUpVisitor(state);
                case "WAKE_UP_DRAW_SUMMER":
                    return chooseWakeUpIndex(4, drawCards(state, { summerVisitor: 1 }));
                case "WAKE_UP_DRAW_WINTER":
                    return chooseWakeUpIndex(4, drawCards(state, { winterVisitor: 1 }));
                case "WAKE_UP_6":
                    return chooseWakeUpIndex(5, gainVP(1, state));
                case "WAKE_UP_7":
                    const player = state.players[state.currentTurn.playerId];
                    return chooseWakeUpIndex(
                        6,
                        updatePlayer(state, player.id, {
                            workers: [
                                ...player.workers,
                                { type: "normal", available: true, isTemp: true }
                            ],
                        })
                    );
                default:
                    return state;
            }
        case "CHOOSE_FIELD": {
            if (
                state.currentTurn.type !== "workerPlacement" ||
                state.currentTurn.pendingAction === null ||
                state.currentTurn.pendingAction.type === "playVisitor"
            ) {
                return state;
            }
            const playerId = state.currentTurn.playerId;
            const player = state.players[playerId];
            const field = player.fields[action.fieldId];
            const pendingAction = state.currentTurn.pendingAction!;

            switch (pendingAction.type) {
                case "buyField":
                case "sellField":
                    const bonus = hasPlacementBonus && state.workerPlacements.buySell.length === 1;
                    state = updatePlayer(bonus ? gainVP(1, state) : state, player.id, {
                        fields: {
                            ...player.fields,
                            [field.id]: { ...field, sold: !field.sold },
                        },
                    });
                    return endTurn(
                        field.sold
                            ? pushActivityLog(
                                  { type: "buySellField", buy: true, playerId },
                                  payCoins(field.value, state)
                              )
                            : gainCoins(
                                  field.value,
                                  pushActivityLog(
                                      { type: "buySellField", buy: false, playerId },
                                      state
                                  )
                              )
                    );
                case "plantVine":
                    // TODO bonus maybe plant 2 vines
                    return endTurn(plantVineInField(pendingAction.vineId!, action.fieldId, state));
                case "harvestField":
                    // TODO bonus maybe harvest 2 fields
                    return endTurn(harvestField(state, field.id));
                default:
                    return state;
            }
        }
        case "CHOOSE_CARD":
            if (state.currentTurn.type !== "workerPlacement") {
                return state;
            }
            switch (state.currentTurn.pendingAction?.type) {
                case "plantVine":
                    if (action.card.type !== "vine") {
                        return state;
                    }
                    return promptToChooseField(
                        removeCardsFromHand(
                            [action.card],
                            setPendingAction({ type: "plantVine", vineId: action.card.id }, state)
                        )
                    );
                case "playVisitor":
                    if (
                        action.card.type !== "visitor" ||
                        state.currentTurn.pendingAction?.visitorId !== undefined
                    ) {
                        return state;
                    }
                    // Further card-specific logic is handled by the `visitor` reducer.
                    return pushActivityLog(
                        { type: "visitor", playerId: state.currentTurn.playerId, visitorId: action.card.id },
                        removeCardsFromHand(
                            [action.card],
                            setPendingAction(
                                { ...state.currentTurn.pendingAction, visitorId: action.card.id },
                                state
                            )
                        )
                    );
                case "fillOrder":
                    if (action.card.type !== "order") {
                        return state;
                    }
                    return promptToFillOrder(
                        removeCardsFromHand(
                            [action.card],
                            setPendingAction({ type: "fillOrder", orderId: action.card.id }, state)
                        ),
                        [action.card.id]
                    );
                default:
                    return state;
            }
        case "CHOOSE_WINE": {
            if (
                state.currentTurn.type !== "workerPlacement" ||
                state.currentTurn.pendingAction?.type !== "fillOrder"
            ) {
                return state;
            }
            const orderId = state.currentTurn.pendingAction.orderId!
            const bonus = hasPlacementBonus && state.workerPlacements.fillOrder.length === 1;
            return endTurn(fillOrder(orderId, action.wines, state, /* bonusVP */ bonus));
        }
        case "MAKE_WINE":
            if (
                state.currentTurn.type !== "workerPlacement" ||
                state.currentTurn.pendingAction?.type !== "makeWine"
            ) {
                return state;
            }
            return endTurn(makeWineFromGrapes(state, action.ingredients));

        case "BUILD_STRUCTURE": {
            if (
                state.currentTurn.type !== "workerPlacement" ||
                state.currentTurn.pendingAction?.type !== "buildStructure"
            ) {
                return state;
            }
            const structure = structures[action.structureId];
            const bonus = hasPlacementBonus && state.workerPlacements.buildStructure.length === 1;
            return endTurn(
                buildStructure(payCoins(structure.cost - (bonus ? 1 : 0), state), action.structureId)
            );
        }
        case "PASS":
            if (state.currentTurn.type !== "workerPlacement") {
                throw new Error("Unexpected state: can only pass a worker placement turn");
            }
            return passToNextSeason(state);

        case "PLACE_WORKER": {
            const player = state.players[state.currentTurn.playerId];
            const workerIndex = player.workers.reduce(
                (previousValue, worker, currentIndex) =>
                    worker.available && worker.type === action.workerType
                        ? currentIndex
                        : previousValue,
                null as number | null
            );
            if (workerIndex === null) {
                throw new Error("Unexpected state: no available workers");
            }
            state = {
                ...updatePlayer(state, player.id, {
                    workers: player.workers.map(
                        (w, i) => i === workerIndex ? { ...w, available: false } : w
                    ),
                }),
                workerPlacements: {
                    ...state.workerPlacements,
                    [action.placement]: [...state.workerPlacements[action.placement], {
                        type: action.workerType,
                        playerId: state.currentTurn.playerId,
                        color: player.color,
                        isTemp: player.workers[workerIndex].isTemp,
                    }],
                },
            };

            switch (action.placement) {
                case "buildStructure":
                    return promptToBuildStructure(
                        setPendingAction({ type: "buildStructure" }, state)
                    );
                case "buySell":
                    return promptForAction(setPendingAction({ type: "buySell" }, state), {
                        choices: [
                            {
                                id: "BOARD_SELL_GRAPES",
                                label: "Sell grape(s)",
                                disabledReason: needGrapesDisabledReason(state),
                            },
                            {
                                id: "BOARD_BUY_FIELD",
                                label: "Buy a field",
                                disabledReason: buyFieldDisabledReason(state),
                            },
                            {
                                id: "BOARD_SELL_FIELD",
                                label: "Sell a field",
                                disabledReason: Object.values(state.players[player.id].fields)
                                    .every(fields => fields.sold)
                                    ? "You don't have any fields to sell."
                                    : undefined,
                            },
                        ],
                    });
                case "drawOrder": {
                    const bonus = hasPlacementBonus && state.workerPlacements.drawOrder.length === 1;
                    return endTurn(drawCards(state, { order: bonus ? 2 : 1 }));
                }
                case "drawVine": {
                    const bonus = hasPlacementBonus && state.workerPlacements.drawVine.length === 1;
                    return endTurn(drawCards(state, { vine: bonus ? 2 : 1 }));
                }
                case "fillOrder":
                    return promptToChooseOrderCard(setPendingAction({ type: "fillOrder" }, state));
                case "gainCoin":
                    return endTurn(gainCoins(1, state));
                case "giveTour": {
                    const bonus = hasPlacementBonus && state.workerPlacements.giveTour.length === 1;
                    return endTurn(gainCoins(bonus ? 3 : 2, state));
                }
                case "harvestField":
                    return promptToChooseField(setPendingAction({ type: "harvestField" }, state));
                case "makeWine": {
                    const bonus = hasPlacementBonus && state.workerPlacements.makeWine.length === 1;
                    return promptToMakeWine(
                        setPendingAction({ type: "makeWine" }, state),
                        /* upToN */ bonus ? 3 : 2
                    );
                }
                case "plantVine":
                    return promptToChooseVineCard(setPendingAction({ type: "plantVine" }, state));
                case "playSummerVisitor":
                case "playWinterVisitor":
                    return promptToChooseCard(setPendingAction({ type: "playVisitor" }, state), {
                        title: "Choose a visitor",
                        cards: state.players[state.currentTurn.playerId].cardsInHand
                            .filter(card => card.type === "visitor" &&
                                visitorCards[card.id].season ===
                                (action.placement === "playSummerVisitor" ? "summer" : "winter"))
                    });
                case "trainWorker": {
                    const bonus = hasPlacementBonus && state.workerPlacements.trainWorker.length === 1;
                    return endTurn(trainWorker(payCoins(bonus ? 3 : 4, state)));
                }
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
