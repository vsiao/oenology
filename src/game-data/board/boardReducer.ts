import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn } from "../GameState";
import {
    buildStructure,
    gainCoins,
    payCoins,
    trainWorker,
    gainVP,
    plantVineInField,
    updatePlayer,
    pushActivityLog,
} from "../shared/sharedReducers";
import { promptToChooseField, promptForAction, promptToMakeWine, promptToBuildStructure, promptToChooseCard, promptToChooseVineCard, promptToChooseOrderCard, promptToFillOrder } from "../prompts/promptReducers";
import { buyFieldDisabledReason, needGrapesDisabledReason } from "../shared/sharedSelectors";
import { structures } from "../structures";
import { visitorCards } from "../visitors/visitorCards";
import { endTurn, setPendingAction, chooseWakeUp, passToNextSeason, WakeUpChoiceData } from "../shared/turnReducers";
import { drawCards, removeCardsFromHand } from "../shared/cardReducers";
import { harvestField, fillOrder, makeWineFromGrapes } from "../shared/grapeWineReducers";
import { visitor } from "../visitors/visitorReducer";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (state.currentTurn.type) {
        case "papaSetUp":
            return state;

        case "wakeUpOrder": {
            if (action.type === "CHOOSE_ACTION" && action.choice === "WAKE_UP") {
                return endTurn(chooseWakeUp(action.data as WakeUpChoiceData, state));
            }
            return state;
        }
        case "workerPlacement":
            return workerPlacement(state, action);

        case "fallVisitor":
            switch (action.type) {
                case "CHOOSE_ACTION":
                    switch (action.choice) {
                        case "FALL_DRAW_SUMMER":
                            return endTurn(drawCards(state, { summerVisitor: 1 }));
                        case "FALL_DRAW_WINTER":
                            return endTurn(drawCards(state, { winterVisitor: 1 }));
                        default:
                            return state;
                    }
                default:
                    return state;
            }
    }
};

const workerPlacement = (state: GameState, action: GameAction): GameState => {
    const currentTurn = state.currentTurn as WorkerPlacementTurn;
    if (!currentTurn.pendingAction) {
        // Player must either place a worker or pass
        return placeWorkerOrPass(state, action);
    }

    const pendingAction = currentTurn.pendingAction;
    const hasPlacementBonus = Object.keys(state.players).length > 2;

    switch (pendingAction.type) {
        case "buildStructure": {
            if (action.type !== "BUILD_STRUCTURE") {
                return state;
            }
            const structure = structures[action.structureId];
            const bonus = hasPlacementBonus && state.workerPlacements.buildStructure.length === 1;
            return endTurn(
                buildStructure(payCoins(structure.cost - (bonus ? 1 : 0), state), action.structureId)
            );
        }
        case "buyField":
        case "sellField": {
            if (action.type !== "CHOOSE_FIELD") {
                return state;
            }
            const playerId = state.currentTurn.playerId;
            const player = state.players[state.currentTurn.playerId];
            const field = player.fields[action.fieldId];

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
        }
        case "buySell":
            if (action.type !== "CHOOSE_ACTION") {
                return state;
            }
            switch (action.choice) {
                case "BOARD_BUY_FIELD":
                    return promptToChooseField(setPendingAction({ type: "buyField" }, state));
                case "BOARD_SELL_FIELD":
                    return promptToChooseField(setPendingAction({ type: "sellField" }, state));
                case "BOARD_SELL_GRAPES":
                    return endTurn(state); // TODO (+bonus)
                default:
                    return state;
            }

        case "fillOrder":
            switch (action.type) {
                case "CHOOSE_CARD":
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
                case "CHOOSE_WINE":
                    const orderId = pendingAction.orderId!
                    const bonus = hasPlacementBonus && state.workerPlacements.fillOrder.length === 1;
                    return endTurn(fillOrder(orderId, action.wines, state, /* bonusVP */ bonus));
                default:
                    return state;
            }

        case "harvestField":
            if (action.type !== "CHOOSE_FIELD") {
                return state;
            }
            // TODO bonus maybe harvest 2 fields
            return endTurn(harvestField(state, action.fieldId));

        case "makeWine":
            if (action.type !== "MAKE_WINE") {
                return state;
            }
            return endTurn(makeWineFromGrapes(state, action.ingredients));

        case "plantVine":
            switch (action.type) {
                case "CHOOSE_CARD":
                    if (action.card.type !== "vine") {
                        return state;
                    }
                    return promptToChooseField(
                        removeCardsFromHand(
                            [action.card],
                            setPendingAction({ type: "plantVine", vineId: action.card.id }, state)
                        )
                    );
                case "CHOOSE_FIELD":
                    // TODO bonus maybe plant 2 vines
                    return endTurn(plantVineInField(pendingAction.vineId!, action.fieldId, state));
                default:
                    return state;
            }

        case "playVisitor":
            return visitor(state, action);

        case "sellGrapes":
            return state;
    }
};

const placeWorkerOrPass = (state: GameState, action: GameAction): GameState => {
    const hasPlacementBonus = Object.keys(state.players).length > 2;

    switch (action.type) {
        case "PASS":
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
