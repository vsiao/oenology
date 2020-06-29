import GameState, { CardId, WorkerPlacementTurn, Field } from "../GameState";
import { GameAction } from "../gameActions";
import { Choice, PromptState } from "./PromptState";
import { Coupon } from "../structures";
import { OrderId } from "../orderCards";
import { visitorCards } from "../visitors/visitorCards";
import { removeCardsFromHand } from "../shared/cardReducers";
import { VineId } from "../vineCards";
import { setPendingAction } from "../shared/turnReducers";
import { isPromptAction } from "./promptActions";
import { plantVineInFieldDisabledReason } from "../shared/sharedSelectors";

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

export const promptForAction = <DataT = undefined>(
    state: GameState,
    {
        title = "Choose an action",
        playerId = state.currentTurn.playerId,
        choices,
    }: {
        title?: string;
        playerId?: string;
        choices: Choice<DataT>[];
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
    return enqueueActionPrompt(state, { type: "chooseAction", title, playerId, contextVisitor, choices, });
};

export const promptToChooseCard = (
    state: GameState,
    {
        title = "Choose a card",
        cards,
        optional,
        requireStructures
    }: {
        title?: string;
        cards: CardId[];
        optional?: boolean;
        requireStructures?: boolean;
    }
): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseCard", title, cards, optional, requireStructures });
};

export const promptToChooseOrderCard = (state: GameState): GameState => {
    return promptToChooseCard(state, {
        title: "Choose an order to fill",
        cards: state.players[state.currentTurn.playerId].cardsInHand
            .filter(card => card.type === "order"),
    });
};

export const promptToChooseVineCard = (
    state: GameState,
    { requireStructures = true, optional = false }: {
        requireStructures?: boolean;
        optional?: boolean;
    } = {}
): GameState => {
    return promptToChooseCard(state, {
        title: `Choose vine to plant`,
        cards: state.players[state.currentTurn.playerId].cardsInHand
            .filter(({ type }) => type === "vine"),
        optional,
        requireStructures
    });
};

export const promptToChooseVisitor = (
    season: "summer" | "winter",
    state: GameState,
    bonus = false
): GameState => {
    return promptToChooseCard(state, {
        title: `Choose ${bonus ? "another" : "a"} visitor`,
        cards: state.players[state.currentTurn.playerId].cardsInHand
            .filter(card => card.type === "visitor" &&
                visitorCards[card.id].season === season),
        optional: bonus,
    });
};

export const promptToPlant = (state: GameState, vineId: VineId, bypassFieldLimit = false) => {
    state = removeCardsFromHand(
        [{ type: "vine", id: vineId }],
        setPendingAction({
            ...(state.currentTurn as WorkerPlacementTurn).pendingAction!,
            vineId,
        }, state),
    );
    return promptToChooseField(state, field => {
        return plantVineInFieldDisabledReason(vineId, field, bypassFieldLimit);
    });
};

export const promptToHarvest = (state: GameState): GameState => {
    return promptToChooseField(state, field => {
        if (field.harvested) {
            return "You harvested this field already.";
        }
        return field.vines.length === 0
            ? "There's nothing here to harvest."
            : undefined;
    });
};

export const promptToChooseField = (
    state: GameState,
    disabledReason: (field: Field) => string | undefined
): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    const fields = state.players[state.currentTurn.playerId].fields;
    return enqueueActionPrompt(state, {
        type: "chooseField",
        disabledReasons: {
            field5: disabledReason(fields.field5),
            field6: disabledReason(fields.field6),
            field7: disabledReason(fields.field7),
        },
    });
};

export const promptToChooseWine = (
    state: GameState,
    { minValue = 1, limit }: { minValue?: number; limit: number; }
): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseWine", minValue, limit });
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
    playerId = state.currentTurn.playerId
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "makeWine", upToN });
};

export const promptToPlaceWorker = (state: GameState) => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "placeWorker" });
};

export const promptToBuildStructure = (state: GameState, coupon?: Coupon): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "buildStructure", coupon });
};
