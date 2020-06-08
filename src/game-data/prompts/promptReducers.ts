import GameState from "../GameState";

export const promptForAction = (state: GameState, choices: React.ReactNode[]): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompt: { type: "chooseAction", choices }
    };
};

export const promptToMakeWine = (state: GameState, upToN: number): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompt: { type: "makeWine", upToN }
    };
};

export const promptToPickWine = (state: GameState, minValue = 1): GameState => {
    if (state.playerId !== state.currentTurn.playerId) {
        return state;
    }
    return {
        ...state,
        actionPrompt: { type: "pickWine", minValue }
    };
};

export const clearPrompt = (state: GameState): GameState => {
    return { ...state, actionPrompt: null };
};
