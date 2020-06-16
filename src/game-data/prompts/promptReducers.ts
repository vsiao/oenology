import GameState from "../GameState";
import { GameAction } from "../gameActions";
import { Choice } from "./PromptState";
import { Coupon } from "../structures";

export const prompt = (state: GameState, action: GameAction) => {
    switch (action.type) {
        case "CHOOSE_ACTION":
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

export const promptForAction = (
    state: GameState,
    {
        title = "Choose an action",
        playerId = state.currentTurn.playerId,
        choices,
    }: {
        title?: string;
        playerId?: string;
        choices: Choice[];
    }
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompts: [
            ...state.actionPrompts,
            { type: "chooseAction", title, playerId, choices },
        ],
    };
};

export const promptToChooseField = (state: GameState): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompts: [...state.actionPrompts, { type: "chooseField" }],
    };
};

export const promptToChooseWine = (state: GameState, minValue = 1): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompts: [...state.actionPrompts, { type: "chooseWine", minValue }],
    };
};

export const promptToMakeWine = (
    state: GameState,
    upToN: number,
    playerId = state.currentTurn.playerId
): GameState => {
    if (state.playerId !== playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompts: [...state.actionPrompts, { type: "makeWine", upToN }],
    };
};

export const promptToBuildStructure = (state: GameState, coupon?: Coupon): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompts: [...state.actionPrompts, { type: "buildStructure", coupon }],
    };
};
