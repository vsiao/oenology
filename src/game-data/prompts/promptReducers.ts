import GameState, { CardId } from "../GameState";
import { GameAction } from "../gameActions";
import { Choice, PromptState } from "./PromptState";
import { Coupon } from "../structures";
import { OrderId } from "../orderCards";

export const prompt = (state: GameState, action: GameAction) => {
    switch (action.type) {
        case "CHOOSE_ACTION":
        case "CHOOSE_CARDS":
        case "CHOOSE_FIELD":
        case "CHOOSE_WINE":
        case "MAKE_WINE":
        case "BUILD_STRUCTURE":
            return action.playerId === state.playerId
                ? { ...state, actionPrompts: state.actionPrompts.slice(1) }
                : state;
        default:
            return state;
    }
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
    }: {
        title?: string;
        cards: CardId[];
        optional?: boolean;
    }
): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseCard", title, cards, optional });
};

export const promptToChooseOrderCard = (state: GameState): GameState => {
    return promptToChooseCard(state, {
        title: "Choose an order to fill",
        cards: state.players[state.currentTurn.playerId].cardsInHand
            .filter(card => card.type === "order"),
    });
};

export const promptToChooseVineCard = (state: GameState, bonus = false): GameState => {
    return promptToChooseCard(state, {
        title: `Choose ${bonus ? "another" : "a"} vine to plant`,
        cards: state.players[state.currentTurn.playerId].cardsInHand
            .filter(({ type }) => type === "vine"),
        optional: bonus,
    });
};

export const promptToChooseField = (state: GameState): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseField" });
};

export const promptToChooseWine = (
    state: GameState,
    { minValue = 1, limit }: { minValue?: number; limit: number }
): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "chooseWine", minValue, limit });
};

export const promptToFillOrder = (state: GameState, orderIds: OrderId[]): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "fillOrder", orderIds, });
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

export const promptToBuildStructure = (state: GameState, coupon?: Coupon): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return enqueueActionPrompt(state, { type: "buildStructure", coupon });
};
