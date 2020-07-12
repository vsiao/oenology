import * as React from "react";
import GameState, { CardId, WorkerPlacementTurn, Field } from "../GameState";
import { GameAction } from "../gameActions";
import { Choice, PromptState } from "./PromptState";
import { Coupon } from "../structures";
import { OrderId } from "../orderCards";
import { visitorCards } from "../visitors/visitorCards";
import { removeCardsFromHand } from "../shared/cardReducers";
import { VineId } from "../vineCards";
import { setPendingAction } from "../shared/turnReducers";
import { isPromptAction, VineInField } from "./promptActions";
import { plantVineInFieldDisabledReason, canFillOrderWithWines, allWines, plantVineDisabledReason, fieldYields, switchVines } from "../shared/sharedSelectors";

export const prompt = (state: GameState, action: GameAction) => {
    if (isPromptAction(action)) {
        return action.playerId === state.playerId
            ? { ...state, actionPrompts: state.actionPrompts.slice(1) }
            : state;
    }
    return state;
};

const enqueueActionPrompt = (state: GameState, prompt: PromptState): GameState => {
    return { ...state, actionPrompts: [...state.actionPrompts, prompt] };
};

export const promptForAction = <DataT extends unknown = undefined>(
    state: GameState,
    {
        title = "Choose an action",
        description = null,
        playerId = state.currentTurn.playerId,
        choices,
        upToN,
    }: {
        title?: string;
        description?: React.ReactNode;
        playerId?: string;
        choices: Choice<DataT>[];
        upToN?: number;
    }
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    const contextVisitor = state.currentTurn.type === "workerPlacement" &&
        state.currentTurn.pendingAction !== null &&
        state.currentTurn.pendingAction.type === "playVisitor"
        ? state.currentTurn.pendingAction.visitorId
        : undefined;
    return enqueueActionPrompt(state, {
        type: "chooseAction",
        title,
        description: contextVisitor
            ? <p>
                {state.currentTurn.playerId === state.playerId
                    ? "You"
                    : <strong>{state.players[state.currentTurn.playerId].name}</strong>
                } played the <strong>{visitorCards[contextVisitor].name}</strong>.
            </p>
            : description,
        playerId,
        choices,
        upToN,
    });
};

export const promptToChooseCard = (
    state: GameState,
    {
        title,
        style = "selector",
        cards,
        optional,
        numCards = 1,
        playerId = state.currentTurn.playerId,
    }: {
        title: React.ReactNode;
        style?: "selector" | "oneClick",
        cards: {
            id: CardId;
            disabledReason?: string | undefined;
        }[];
        optional?: boolean;
        numCards?: number;
        playerId?: string;
    }
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseCard", title, style, cards, optional, numCards });
};

export const promptToChooseOrderCard = (state: GameState): GameState => {
    const player = state.players[state.currentTurn.playerId];
    return promptToChooseCard(state, {
        title: "Choose an order to fill",
        style: "oneClick",
        cards: player.cardsInHand
            .filter(card => card.type === "order")
            .map(id => ({
                id,
                disabledReason:
                    canFillOrderWithWines(id.id as OrderId, allWines(state, player.id))
                        ? undefined
                        : "You can't fill this order."
            })),
    });
};

export const promptToChooseVineCard = (
    state: GameState,
    {
        bypassFieldLimit = false,
        bypassStructures = false,
        playerId = state.currentTurn.playerId,
        optional = false,
    }: {
        bypassFieldLimit?: boolean;
        bypassStructures?: boolean;
        playerId?: string;
        optional?: boolean;
    } = {}
): GameState => {
    return promptToChooseCard(state, {
        title: `Plant a vine`,
        style: "oneClick",
        cards: state.players[playerId].cardsInHand
            .filter(({ type }) => type === "vine")
            .map(id => ({
                id,
                disabledReason: plantVineDisabledReason(state, id.id as VineId, {
                    bypassFieldLimit,
                    bypassStructures,
                    playerId,
                }),
            })),
        playerId,
        optional,
    });
};

export const promptToChooseVisitor = (
    season: "summer" | "winter",
    state: GameState,
    optional = false
): GameState => {
    return promptToChooseCard(state, {
        title: `Play ${optional ? "another" : "a"} visitor`,
        style: "oneClick",
        cards: state.players[state.currentTurn.playerId].cardsInHand
            .filter(card => card.type === "visitor" &&
                visitorCards[card.id].season === season)
            .map(id => ({
                id,
                disabledReason: undefined, // TODO
            })),
        optional,
    });
};

export const promptToPlant = (
    state: GameState,
    vineId: VineId,
    { bypassFieldLimit = false, playerId = state.currentTurn.playerId }: {
        bypassFieldLimit?: boolean;
        playerId?: string;
    } = {}
) => {
    state = removeCardsFromHand(
        [{ type: "vine", id: vineId }],
        setPendingAction({
            ...(state.currentTurn as WorkerPlacementTurn).pendingAction!,
            vineId,
        }, state),
        playerId
    );
    return promptToChooseField(
        state,
        field => plantVineInFieldDisabledReason(vineId, field, bypassFieldLimit),
        { kind: "oneClick" },
        playerId
    );
};

export const promptToHarvest = (state: GameState, numFields = 1): GameState => {
    return promptToChooseField(
        state,
        field => {
            if (field.harvested) {
                return "You harvested this field already.";
            }
            return field.vines.length === 0
                ? "There's nothing here to harvest."
                : undefined;
        },
        { kind: "harvest", numSelections: numFields, }
    );
};

export const promptToUproot = (state: GameState, numVines = 1): GameState => {
    return promptToChooseField(
        state,
        field => {
            return field.vines.length === 0
                ? "There's nothing here to uproot."
                : undefined;
        },
        { kind: "uproot", numSelections: numVines, }
    );
};

export const promptToSwitchVines = (state: GameState): GameState => {
    const player = state.players[state.currentTurn.playerId];
    return promptToChooseField(
        state,
        field => {
            return field.vines.length === 0
                ? "There's nothing here to replant."
                : undefined;
        },
        { kind: "switch", numSelections: 2 },
        player.id,
        vines => {
            if (vines.length > 1) {
                if (vines.length !== 2) return "You may switch 2 vines";
                if (vines[0].field === vines[1].field) {
                    return "Vines must be from different fields";
                }
                const fields = switchVines(vines, player.fields);
                const field0 = fields[vines[0].field];
                const field1 = fields[vines[1].field];
                const { red: red0, white: white0 } = fieldYields(field0);
                const { red: red1, white: white1 } = fieldYields(field1);
                if (red0 + white0 > field0.value || red1 + white1 > field1.value) {
                    return "Switching these vines would exceed a field's value";
                }
            }
            return undefined;
        }
    );
};

export const promptToChooseField = (
    state: GameState,
    disabledReason: (field: Field) => string | undefined,
    { kind = "oneClick", numSelections = 1, }: {
        kind?: "oneClick" | "harvest" | "uproot" | "switch";
        numSelections?: number,
    } = {},
    playerId = state.currentTurn.playerId,
    submitDisabledReason?: (vines: VineInField[]) => string | undefined
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    const fields = state.players[playerId].fields;
    return enqueueActionPrompt(state, {
        type: "chooseField",
        kind,
        numSelections,
        disabledReasons: {
            field5: disabledReason(fields.field5),
            field6: disabledReason(fields.field6),
            field7: disabledReason(fields.field7),
        },
        submitDisabledReason
    });
};

export const promptToChooseWine = (
    state: GameState,
    { minValue = 1 }: { minValue?: number; } = {}
): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseWine", minValue, });
};

export const promptToChooseGrape = (state: GameState, limit?: 1): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseGrape", limit });
};

export const promptToFillOrder = (state: GameState, orderId: OrderId): GameState => {
    state = removeCardsFromHand(
        [{ type: "order", id: orderId }],
        setPendingAction({
            ...(state.currentTurn as WorkerPlacementTurn).pendingAction!,
            orderId,
        }, state),
    );
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "fillOrder", orderIds: [orderId], });
};

export const promptToMakeWine = (
    state: GameState,
    upToN: number,
    playerId = state.currentTurn.playerId,
    asZymologist = false
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "makeWine", upToN, asZymologist });
};

export const promptToPlaceWorker = (state: GameState) => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, {
        type: "placeWorker",
        key: state.lastPlaceWorkerActionKey || "",
    });
};

export const promptToBuildStructure = (
    state: GameState,
    coupon?: Coupon,
    playerId = state.currentTurn.playerId
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "buildStructure", coupon });
};

export const displayGameOverPrompt = (state: GameState) => {
    return enqueueActionPrompt(state, { type: "gameOver" });
};
