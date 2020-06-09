import GameState, { CardType } from "../GameState";

export const discardWine = (state: GameState, playerId: string, wine: unknown) => {
    return state;
};

export const drawCards = (state: GameState, playerId: string, cards: { [K in CardType]?: number }) => {
    return state;
};

export const endTurn = (state: GameState) => {
    return state;
};

export const gainVP = (state: GameState, playerId: string, numVP: number) => {
    const playerState = state.players[playerId];
    return {
        ...state,
        players: {
            ...state.players,
            [playerId]: {
                ...playerState,
                victoryPoints: playerState.victoryPoints + numVP,
            },
        },
    };
};

export const gainCoins = (state: GameState, playerId: string, numCoins: number) => {
    const playerState = state.players[playerId];
    return {
        ...state,
        players: {
            ...state.players,
            [playerId]: {
                ...playerState,
                coins: playerState.coins + numCoins,
            },
        },
    };
};
