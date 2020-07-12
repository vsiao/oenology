import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn, StructureState } from "../GameState";
import {
    buildStructure,
    gainCoins,
    payCoins,
    trainWorker,
    gainVP,
    plantVineInField,
    updatePlayer,
    pushActivityLog,
    markStructureUsed,
    uprootVineFromField,
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
    promptToUproot,
    promptToChooseGrape
} from "../prompts/promptReducers";
import { buyFieldDisabledReason, needGrapesDisabledReason, plantVinesDisabledReason, moneyDisabledReason } from "../shared/sharedSelectors";
import { structures } from "../structures";
import { endTurn, setPendingAction, chooseWakeUp, passToNextSeason, WakeUpChoiceData, chooseMamaPapa } from "../shared/turnReducers";
import { drawCards, discardCards } from "../shared/cardReducers";
import { fillOrder, makeWineFromGrapes, harvestFields, discardGrapes } from "../shared/grapeWineReducers";
import { visitor } from "../visitors/visitorReducer";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (state.currentTurn.type) {
        case "mamaPapa":
            if (action.type === "CHOOSE_ACTION") {
                return endTurn(chooseMamaPapa(action.choice, action._key!, state));
            }
            return state;

        case "wakeUpOrder": {
            if (action.type === "CHOOSE_ACTION" && action.choice === "WAKE_UP") {
                return endTurn(chooseWakeUp(action.data as WakeUpChoiceData, action._key!, state));
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
                            return endTurn(drawCards(state, action._key!, {
                                summerVisitor: 1,
                                winterVisitor: 1
                            }));
                        case "FALL_DRAW_SUMMER":
                            return endTurn(drawCards(state, action._key!, { summerVisitor: 1 }));
                        case "FALL_DRAW_SUMMER_2":
                            return endTurn(drawCards(state, action._key!, { summerVisitor: 2 }));
                        case "FALL_DRAW_WINTER":
                            return endTurn(drawCards(state, action._key!, { winterVisitor: 1 }));
                        case "FALL_DRAW_WINTER_2":
                            return endTurn(drawCards(state, action._key!, { winterVisitor: 2 }));
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

    switch (pendingAction.type) {
        case "buildStructure": {
            if (action.type !== "BUILD_STRUCTURE") {
                return state;
            }
            const structure = structures[action.structureId];
            return endTurn(
                buildStructure(
                    payCoins(structure.cost - (pendingAction.hasBonus ? 1 : 0), state),
                    action.structureId
                )
            );
        }
        case "buyField":
        case "sellField": {
            if (action.type !== "CHOOSE_FIELD") {
                return state;
            }
            const playerId = state.currentTurn.playerId;
            const player = state.players[state.currentTurn.playerId];
            const field = player.fields[action.fields[0]];

            state = updatePlayer(pendingAction.hasBonus ? gainVP(1, state) : state, player.id, {
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
        case "sellGrapes":
            if (action.type !== "CHOOSE_GRAPE") {
                return state;
            }
            const playerId = state.currentTurn.playerId;
            const sellValue = action.grapes.reduce((sum, g) => sum += Math.ceil(g.value / 3), 0);

            return endTurn(gainCoins(
                sellValue,
                pushActivityLog(
                    { type: "sellGrapes", grapes: action.grapes, playerId },
                    discardGrapes(pendingAction.hasBonus ? gainVP(1, state) : state, action.grapes)
                )));

        case "buySell":
            if (action.type !== "CHOOSE_ACTION") {
                return state;
            }
            switch (action.choice) {
                case "BOARD_BUY_FIELD":
                    return promptToChooseField(
                        setPendingAction({ type: "buyField", hasBonus: pendingAction.hasBonus }, state),
                        field => {
                            if (!field.sold) {
                                return "You already own this field.";
                            }
                            return moneyDisabledReason(state, field.value);
                        }
                    );
                case "BOARD_SELL_FIELD":
                    return promptToChooseField(
                        setPendingAction({ type: "sellField", hasBonus: pendingAction.hasBonus }, state),
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
                    return promptToChooseGrape(
                        setPendingAction({ type: "sellGrapes", hasBonus: pendingAction.hasBonus }, state)
                    );
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
                    return endTurn(fillOrder(action.wines, state, /* bonusVP */ pendingAction.hasBonus));
                default:
                    return state;
            }

        case "harvestField":
            if (action.type !== "CHOOSE_FIELD") {
                return state;
            }
            return endTurn(harvestFields(state, action.fields));

        case "uproot":
            if (action.type !== "CHOOSE_VINE") {
                return state;
            }
            return endTurn(uprootVineFromField(action.vines[0], state));

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
                    state = plantVineInField(action.fields[0], state);

                    if (pendingAction.hasBonus && plantVinesDisabledReason(state) === undefined) {
                        return promptToChooseVineCard(
                            setPendingAction({ type: "plantVine", hasBonus: false }, state),
                            { optional: true }
                        );
                    }
                    return endTurn(state);
                default:
                    return state;
            }

        case "playVisitor":
            return visitor(state, action);
    }
};

const placeWorker = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "PLACE_WORKER": {
            state = { ...state, lastPlaceWorkerActionKey: action._key };
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
            state = pushActivityLog({ type: "placeWorker", playerId: player.id, }, state);
            const placements = state.workerPlacements[action.placement].slice();
            let placementIdx = placements.findIndex(w => w === null);
            if (placementIdx < 0) {
                placementIdx = placements.length;
            }
            const hasBonus = state.tableOrder.length > 2 && placementIdx === 0;
            placements[placementIdx] = {
                type: action.workerType,
                playerId: state.currentTurn.playerId,
                color: player.color,
                isTemp: player.workers[workerIndex].isTemp,
            };
            state = {
                ...updatePlayer(state, player.id, {
                    workers: player.workers.map(
                        (w, i) => i === workerIndex ? { ...w, available: false } : w
                    ),
                }),
                workerPlacements: {
                    ...state.workerPlacements,
                    [action.placement]: placements,
                },
            };

            switch (action.placement) {
                case "buildStructure":
                    return promptToBuildStructure(
                        setPendingAction({ type: "buildStructure", hasBonus }, state),
                        hasBonus ? { kind: "discount", amount: 1 } : undefined
                    );
                case "buySell":
                    return promptForAction(setPendingAction({ type: "buySell", hasBonus }, state), {
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
                    return endTurn(drawCards(state, action._key!, { order: hasBonus ? 2 : 1 }));
                }
                case "drawVine": {
                    return endTurn(drawCards(state, action._key!, { vine: hasBonus ? 2 : 1 }));
                }
                case "fillOrder":
                    return promptToChooseOrderCard(setPendingAction({ type: "fillOrder", hasBonus }, state));
                case "gainCoin":
                    return endTurn(gainCoins(1, state));
                case "giveTour": {
                    const tastingBonus = player.structures["tastingRoom"] === StructureState.Built &&
                        Object.values(player.cellar).some(cellar => cellar.some(t => !!t));
                    return endTurn(gainCoins(hasBonus ? 3 : 2, tastingBonus ? markStructureUsed("tastingRoom", gainVP(1, state)) : state));
                }
                case "harvestField": {
                    return promptToHarvest(
                        setPendingAction({ type: "harvestField", hasBonus }, state),
                        hasBonus ? 2 : 1
                    );
                }
                case "makeWine": {
                    return promptToMakeWine(
                        setPendingAction({ type: "makeWine", hasBonus }, state),
                        /* upToN */ hasBonus ? 3 : 2
                    );
                }
                case "plantVine":
                    return promptToChooseVineCard(
                        setPendingAction({ type: "plantVine", hasBonus }, state)
                    );
                case "playSummerVisitor": {
                    return promptToChooseVisitor(
                        "summer",
                        setPendingAction({ type: "playVisitor", hasBonus }, state)
                    );
                }
                case "playWinterVisitor": {
                    return promptToChooseVisitor(
                        "winter",
                        setPendingAction({ type: "playVisitor", hasBonus }, state)
                    );
                }
                case "trainWorker": {
                    return endTurn(trainWorker(payCoins(hasBonus ? 3 : 4, state)));
                }
                case "yokeHarvest":
                    return promptToHarvest(
                        setPendingAction({ type: "harvestField", hasBonus }, markStructureUsed("yoke", state))
                    );
                case "yokeUproot":
                    return promptToUproot(
                        setPendingAction({ type: "uproot", hasBonus }, markStructureUsed("yoke", state))
                    );
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
