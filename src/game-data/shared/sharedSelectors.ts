import GameState, { Field } from "../GameState";
import { vineCards, VineCardData } from "../vineCards";

export const fieldYields = (field: Field): { red: number; white: number; } => {
    return {
        red: field.vines.reduce(
            (r, v) => r + ((vineCards[v] as VineCardData).yields.red! || 0),
            0
        ),
        white: field.vines.reduce(
            (w, v) => w + ((vineCards[v] as VineCardData).yields.white! || 0),
            0
        ),
    };
};

export const needGrapesDisabledReason = (state: GameState) => {
    const playerId = state.currentTurn.playerId;
    const hasGrapes = Object.values(state.players[playerId].crushPad)
        .some(grapes => grapes.some(g => g === true));
    return hasGrapes ? undefined : "You don't have any grapes.";
};

export const buyFieldDisabledReason = (state: GameState): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    const soldFields = Object.values(playerState.fields).filter(f => f.sold);
    if (soldFields.length === 0) {
        return "You don't have any fields to buy.";
    }
    const minValue = soldFields.map(f => f.value).reduce((a, b) => Math.min(a, b));
    return moneyDisabledReason(state, minValue);
};

export const harvestFieldDisabledReason = (state: GameState): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    if (Object.values(playerState.fields).every(field => field.sold || field.vines.length === 0)) {
        return "You don't have any fields to harvest.";
    };
    return undefined;
};

const MAX_TRAINED_WORKERS = 6;
export const trainWorkerDisabledReason = (state: GameState, cost: number): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    if (playerState.trainedWorkers.length >= MAX_TRAINED_WORKERS) {
        return "You can't train any more workers.";
    }
    return moneyDisabledReason(state, cost);
};

export const moneyDisabledReason = (state: GameState, cost: number): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    return playerState.coins < cost ? "You don't have enough money." : undefined;
};
