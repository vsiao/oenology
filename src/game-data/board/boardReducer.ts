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
import {
    promptForAction,
    promptToBuildStructure,
    promptToChooseField,
    promptToChooseOrderCard,
    promptToChooseVineCard,
    promptToChooseVisitor,
    promptToFillOrder,
    promptToMakeWine,
    promptToPlant,
    promptToHarvest,
} from "../prompts/promptReducers";
import { buyFieldDisabledReason, needGrapesDisabledReason, plantVinesDisabledReason, harvestFieldDisabledReason, moneyDisabledReason } from "../shared/sharedSelectors";
import { structures } from "../structures";
import { endTurn, setPendingAction, chooseWakeUp, passToNextSeason, WakeUpChoiceData } from "../shared/turnReducers";
import { drawCards, discardCards } from "../shared/cardReducers";
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
                        case "FALL_DRAW_BOTH":
                            return endTurn(drawCards(state, { summerVisitor: 1, winterVisitor: 1 }));
                        case "FALL_DRAW_SUMMER":
                            return endTurn(drawCards(state, { summerVisitor: 1 }));
                        case "FALL_DRAW_SUMMER_2":
                            return endTurn(drawCards(state, { summerVisitor: 2 }));
                        case "FALL_DRAW_WINTER":
                            return endTurn(drawCards(state, { winterVisitor: 1 }));
                        case "FALL_DRAW_WINTER_2":
                            return endTurn(drawCards(state, { winterVisitor: 2 }));
                        default:
                            return state;
                    }
                default:
                    return state;
            }

        case "endOfYearDiscard":
            switch (action.type) {
                case "CHOOSE_CARDS":
                    return endTurn(discardCards(action.cards!, state));
                default:
                    return state;
            }
    }
};

const workerPlacement = (state: GameState, action: GameAction): GameState => {
    const currentTurn = state.currentTurn as WorkerPlacementTurn;
    if (!currentTurn.pendingAction) {
        // Player must either place a worker or pass
        return placeWorker(state, action);
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
                    return promptToChooseField(
                        setPendingAction({ type: "buyField" }, state),
                        field => {
                            if (!field.sold) {
                                return "You already own this field.";
                            }
                            return moneyDisabledReason(state, field.value);
                        }
                    );
                case "BOARD_SELL_FIELD":
                    return promptToChooseField(
                        setPendingAction({ type: "sellField" }, state),
                        field => {
                            if (field.sold) {
                                return "You already sold this field.";
                            }
                            return field.vines.length > 0
                                ? "You can't sell a field with vines on it."
                                : undefined;
                        }
                    );
                case "BOARD_SELL_GRAPES":
                    return endTurn(state); // TODO (+bonus)
                default:
                    return state;
            }

        case "fillOrder":
            switch (action.type) {
                case "CHOOSE_CARDS":
                    const card = action.cards![0];
                    if (card.type !== "order") {
                        return state;
                    }
                    return promptToFillOrder(state, card.id);
                case "CHOOSE_WINE":
                    const bonus = hasPlacementBonus && state.workerPlacements.fillOrder.length === 1;
                    return endTurn(fillOrder(action.wines, state, /* bonusVP */ bonus));
                default:
                    return state;
            }

        case "harvestField":
            if (action.type !== "CHOOSE_FIELD") {
                return state;
            }
            state = harvestField(state, action.fieldId)

            const bonus = hasPlacementBonus &&
                !pendingAction.bonusActivated &&
                state.workerPlacements.harvestField.length === 1 &&
                harvestFieldDisabledReason(state) === undefined;

            if (bonus) {
                return promptToHarvest(
                    setPendingAction({ ...pendingAction, bonusActivated: true }, state)
                );
            }
            return endTurn(state);

        case "makeWine":
            if (action.type !== "MAKE_WINE") {
                return state;
            }
            return endTurn(makeWineFromGrapes(state, action.ingredients));

        case "plantVine":
            switch (action.type) {
                case "CHOOSE_CARDS":
                    if (!action.cards) {
                        // Passed on a bonus vine placement
                        return endTurn(state);
                    }
                    const card = action.cards[0];
                    if (card.type !== "vine") {
                        return state;
                    }
                    return promptToPlant(state, card.id);

                case "CHOOSE_FIELD":
                    state = plantVineInField(action.fieldId, state);

                    const bonus = hasPlacementBonus &&
                        !pendingAction.bonusActivated &&
                        state.workerPlacements.plantVine.length === 1 &&
                        plantVinesDisabledReason(state) === undefined;

                    if (bonus) {
                        return promptToChooseVineCard(
                            setPendingAction({ type: "plantVine", bonusActivated: true }, state),
                            { optional: true }
                        );
                    }
                    return endTurn(state);
                default:
                    return state;
            }

        case "playVisitor":
            return visitor(state, action);

        case "sellGrapes":
            return state;
    }
};

const placeWorker = (state: GameState, action: GameAction): GameState => {
    const hasPlacementBonus = Object.keys(state.players).length > 2;

    switch (action.type) {
        case "PLACE_WORKER": {
            if (!action.placement) {
                return passToNextSeason(state);
            }
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
                    const bonus = hasPlacementBonus && state.workerPlacements.buildStructure.length === 1;
                    return promptToBuildStructure(
                        setPendingAction({ type: "buildStructure" }, state),
                        bonus ? { kind: "discount", amount: 1 } : undefined
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
                                    .every(fields => fields.sold || fields.vines.length > 0)
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
                    return promptToHarvest(setPendingAction({ type: "harvestField" }, state));
                case "makeWine": {
                    const bonus = hasPlacementBonus && state.workerPlacements.makeWine.length === 1;
                    return promptToMakeWine(
                        setPendingAction({ type: "makeWine" }, state),
                        /* upToN */ bonus ? 3 : 2
                    );
                }
                case "plantVine":
                    return promptToChooseVineCard(setPendingAction({ type: "plantVine" }, state));
                case "playSummerVisitor": {
                    const canPlayAdditionalVisitor = hasPlacementBonus &&
                        state.workerPlacements.playSummerVisitor.length === 1;
                    return promptToChooseVisitor(
                        "summer",
                        setPendingAction({ type: "playVisitor", canPlayAdditionalVisitor }, state)
                    );
                }
                case "playWinterVisitor": {
                    const canPlayAdditionalVisitor = hasPlacementBonus &&
                        state.workerPlacements.playWinterVisitor.length === 1;
                    return promptToChooseVisitor(
                        "winter",
                        setPendingAction({ type: "playVisitor", canPlayAdditionalVisitor }, state)
                    );
                }
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
