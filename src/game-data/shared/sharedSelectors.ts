import GameState from "../GameState";

export const hasNonEmptyCrushPad = (state: GameState) => {
    const playerId = state.currentTurn.playerId;
    return Object.values(state.players[playerId].crushPad)
        .some(grapes => grapes.some(g => g === true));
};

export const buyFieldDisabledReason = (state: GameState): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    const soldFields = Object.values(playerState.fields).filter(f => f.sold);
    if (soldFields.length === 0) {
        return "You don't have any fields to buy.";
    }
    const minValue = soldFields.map(f => f.value).reduce((a, b) => Math.min(a, b));
    if (minValue > playerState.coins) {
        return "You don't have enough money.";
    }
    return undefined;
};

export const harvestFieldDisabledReason = (state: GameState): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    if (Object.values(playerState.fields).every(field => field.sold || field.vines.length === 0)) {
        return "You don't have any fields to harvest.";
    };
    return undefined;
};

export const trainWorkerDisabledReason = (state: GameState, cost: number): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    if (playerState.workers.every(w => w.trained)) {
        return "You have no workers to train.";
    }
    if (playerState.coins < cost) {
        return "You don't have enough money.";
    }
    return undefined;
};
