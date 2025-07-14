import { GameAction } from "../gameActions";
import GameState, { WorkerPlacementTurn, WorkerType } from "../GameState";
import {
    buildStructure,
    gainCoins,
    payCoins,
    gainVP,
    plantVineInField,
    updatePlayer,
    pushActivityLog,
    uprootVineFromField,
} from "../shared/sharedReducers";
import {
    promptToChooseField,
    promptToChooseVineCard,
    promptToFillOrder,
    promptToPlant,
    promptToChooseGrapes,
    promptToBuildStructure,
} from "../prompts/promptReducers";
import { plantVinesDisabledReason, moneyDisabledReason } from "../shared/sharedSelectors";
import { structures } from "../structures";
import {
    MamaPapaChoiceData,
    WakeUpChoiceData,
    chooseMamaPapa,
    chooseWakeUp,
    endTurn,
    setPendingAction,
    gainWakeUpBonusAndMaybeCottage,
} from "../shared/turnReducers";
import { drawCards, discardCards } from "../shared/cardReducers";
import { fillOrder, makeWineFromGrapes, harvestFields, discardGrapes, discardWines } from "../shared/grapeWineReducers";
import { visitor } from "../visitors/visitorReducer";
import { giveTour, trade } from "./boardActionReducer";
import { influence } from "./influenceReducers";
import { gainWorker } from "../shared/workerReducers";
import { Action } from "redux";
import { workerPlacement } from "./workerPlacementReducer";

export type InternalGameAction = GameAction | InternalAction;

type InternalAction = WorkerTrainedAction;
interface WorkerTrainedAction extends Action<"WORKER_TRAINED"> {
    playerId: string;
}

export const currentTurn = (state: GameState, action: InternalGameAction): GameState => {
    switch (state.currentTurn.type) {
        case "mamaPapa":
            if (action.type === "CHOOSE_ACTION") {
                return chooseMamaPapa(
                    action.choice,
                    action.data as MamaPapaChoiceData,
                    action._key!,
                    state
                );
            }
            return state;

        case "wakeUpOrder": {
            if (action.type === "CHOOSE_ACTION" && action.choice === "WAKE_UP") {
                return endTurn(
                    chooseWakeUp(
                        // Base game always chooses wake-up position for the summer
                        state.boardType === "base" ? "summer" : "spring",
                        action.data as WakeUpChoiceData,
                        state
                    )
                );
            }
            return state;
        }
        case "workerPlacement":
            return workerPlacementTurn(state, action);

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

const workerPlacementTurn = (state: GameState, action: InternalGameAction): GameState => {
    const placementTurn = state.currentTurn as WorkerPlacementTurn;
    if (!placementTurn.pendingAction) {
        // Player must either place a worker or pass
        return workerPlacement(state, action);
    }

    const pendingAction = placementTurn.pendingAction;

    switch (pendingAction.type) {
        case "buildOrGiveTour":
            if (action.type !== "CHOOSE_ACTION") {
                return state;
            }
            const hasBonus = pendingAction.hasBonus;
            switch (action.choice) {
                case "BOARD_GIVE_TOUR":
                    return endTurn(giveTour(hasBonus, state));
                case "BOARD_BUILD":
                    return promptToBuildStructure(
                        setPendingAction({ type: "buildStructure", hasBonus }, state),
                        hasBonus ? { kind: "discount", amount: 1 } : undefined
                    );
                default:
                    return state;
            }
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
            const player = state.players[playerId];
            const field = player.fields[action.fields[0]];

            state = updatePlayer(
                pendingAction.hasBonus ? gainVP(1, state, { source: "bonus" }) : state,
                player.id,
                {
                    fields: {
                        ...player.fields,
                        [field.id]: { ...field, sold: !field.sold },
                    },
                }
            );
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
            const sellValue = action.grapes.reduce((sum, g) => sum += Math.ceil(g.value / 3), 0);

            return endTurn(gainCoins(
                sellValue,
                discardGrapes(
                    pendingAction.hasBonus ? gainVP(1, state, { source: "bonus" }) : state,
                    action.grapes
                )
            ));

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
                    return promptToChooseGrapes(
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
                    return endTurn(fillOrder(action.wines, state, { bonusVP: pendingAction.hasBonus }));
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

        case "influence":
            return influence(state, action);

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

        case "passToNextSeason":
            switch (action.type) {
                case "CHOOSE_ACTION":
                    switch (action.choice) {
                        case "WAKE_UP":
                        case "DRAW_CARD":
                            return gainWakeUpBonusAndMaybeCottage(action.data as WakeUpChoiceData, state);
                        case "FALL_DRAW_SUMMER":
                            return endTurn(drawCards(state, action._key!, { summerVisitor: 1 }));
                        case "FALL_DRAW_WINTER":
                            return endTurn(drawCards(state, action._key!, { winterVisitor: 1 }));
                        default:
                            return state;
                    }
                default:
                    return state;
            }
        case "sellWine":
            if (action.type !== "CHOOSE_WINE") {
                return state;
            }
            const wineType = action.wines[0].color;
            return endTurn(
                gainVP(
                    wineType === "sparkling"
                        ? 4
                        : wineType === "blush"
                            ? 2
                            : 1,
                    discardWines(state, action.wines),
                    { source: "trade" }
                )
            );

        case "trade":
            return trade(state, action);

        case "trainWorker":
            switch (action.type) {
                case "CHOOSE_ACTION":
                    if (action.choice !== "TRAIN_WORKER") {
                        return state;
                    }
                    state = gainWorker(state, pendingAction.cost, {
                        workerType: action.data as WorkerType,
                        playerId: action.playerId,
                        availableThisYear: pendingAction.availableThisYear,
                    });
                    if (pendingAction.fromAction) {
                        // Return to previous action
                        state = setPendingAction(pendingAction.fromAction, state);
                        return currentTurn(state, { type: "WORKER_TRAINED", playerId: action.playerId });
                    }
                    return endTurn(state);
            }
            return state;
    }
};
