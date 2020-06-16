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
} from "../shared/sharedReducers";
import { promptToChooseField, promptForAction, promptToMakeWine, promptToBuildStructure } from "../prompts/promptReducers";
import { buyFieldDisabledReason, needGrapesDisabledReason } from "../shared/sharedSelectors";
import { VineId } from "../vineCards";
import { structures } from "../structures";

export const board = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "FALL_DRAW_SUMMER":
                    return endTurn(drawCards(state, { summerVisitor: 1 }));
                case "FALL_DRAW_WINTER":
                    return endTurn(drawCards(state, { winterVisitor: 1 }));
                case "BUY_FIELD":
                    return promptToChooseField(setPendingAction({ type: "buyField" }, state));
                case "SELL_FIELD":
                    return promptToChooseField(setPendingAction({ type: "sellField" }, state));
                case "SELL_GRAPES":
                    return endTurn(state); // TODO
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
                    return chooseWakeUpIndex(6, state); // TODO
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
            const currentTurn = state.currentTurn;
            const player = state.players[currentTurn.playerId];
            const field = player.fields[action.fieldId];
            const pendingAction = currentTurn.pendingAction!;

            switch (pendingAction.type) {
                case "buyField":
                case "sellField":
                    return endTurn((field.sold ? payCoins : gainCoins)(
                        field.value,
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
                        }
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
            return promptToChooseField(
                removeCardsFromHand(
                    [{ type: "vine", id: action.vineId }],
                    setPendingAction({ type: "plantVine", vineId: action.vineId }, state)
                )
            );

        case "MAKE_WINE":
            if (
                state.currentTurn.type !== "workerPlacement" ||
                state.currentTurn.pendingAction?.type !== "makeWine"
            ) {
                return state;
            }
            return endTurn(makeWineFromGrapes(state, action.ingredients));

        case "BUILD_STRUCTURE":
            if (
                state.currentTurn.type !== "workerPlacement" ||
                state.currentTurn.pendingAction?.type !== "buildStructure"
            ) {
                return state;
            }
            const structure = structures[action.structureId];
            return endTurn(buildStructure(payCoins(structure.cost, state), action.structureId));

        case "PASS":
            if (state.currentTurn.type !== "workerPlacement") {
                throw new Error("Unexpected state: can only pass a worker placement turn");
            }
            return passToNextSeason(state.currentTurn.playerId, state);

        case "PLACE_WORKER": {
            const player = state.players[state.currentTurn.playerId];
            const workerIndex = player.trainedWorkers.reduce(
                (previousValue, trainedWorker, currentIndex) =>
                    trainedWorker.available && trainedWorker.type === action.workerType
                        ? currentIndex
                        : previousValue,
                null as number | null
            );
            if (workerIndex === null) {
                throw new Error("Unexpected state: no available workers");
            }
            state = {
                ...state,
                players: {
                    ...state.players,
                    [player.id]: {
                        ...player,
                        trainedWorkers: player.trainedWorkers.map(
                            (w, i) => i === workerIndex ? { ...w, available: false } : w
                        ),
                    },
                },
                workerPlacements: {
                    ...state.workerPlacements,
                    [action.placement]: [...state.workerPlacements[action.placement], {
                        type: action.workerType,
                        playerId: state.currentTurn.playerId,
                        color: player.color
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
                                id: "SELL_GRAPES",
                                label: "Sell grape(s)",
                                disabledReason: needGrapesDisabledReason(state),
                            },
                            {
                                id: "BUY_FIELD",
                                label: "Buy a field",
                                disabledReason: buyFieldDisabledReason(state),
                            },
                            {
                                id: "SELL_FIELD",
                                label: "Sell a field",
                                disabledReason: Object.values(state.players[player.id].fields)
                                    .every(fields => fields.sold)
                                    ? "You don't have any fields to sell."
                                    : undefined,
                            },
                        ],
                    });
                case "drawOrder":
                    return endTurn(drawCards(state, { order: 1 }));
                case "drawVine":
                    return endTurn(drawCards(state, { vine: 1 }));
                case "fillOrder":
                    return state;
                case "gainCoin":
                    return endTurn(gainCoins(1, state));
                case "giveTour":
                    return endTurn(gainCoins(2, state));
                case "harvestField":
                    return promptToChooseField(setPendingAction({ type: "harvestField" }, state));
                case "makeWine":
                    return promptToMakeWine(setPendingAction({ type: "makeWine" }, state), /* upToN */ 2);
                case "plantVine":
                    return setPendingAction({ type: "plantVine" }, state);
                case "playSummerVisitor":
                case "playWinterVisitor":
                    return setPendingAction({ type: "playVisitor" }, state);
                case "trainWorker":
                    return endTurn(trainWorker(payCoins(4, state)));
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
