import GameState, { CardType } from "../GameState";

export const discardWine = (state: GameState, playerId: string, wine: unknown) => {
    return state;
};

export const drawCards = (state: GameState, playerId: string, cards: { [K in CardType]?: number }) => {
    return state;
};

export const endTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    if (wakeUpOrder.every(p => p == null || p.passed)) {
        throw new Error("Unexpected state: no valid players for current season");
    }
    let i = wakeUpOrder.findIndex(player => player && player.playerId === currentTurn.playerId);
    while (true) {
        i = (i + 1) % wakeUpOrder.length;
        const maybeNextPlayer = wakeUpOrder[i];
        if (maybeNextPlayer !== null && !maybeNextPlayer.passed) {
            return {
                ...state,
                currentTurn: {
                    type: "workerPlacement",
                    playerId: maybeNextPlayer.playerId,
                    pendingAction: null,
                }
            };
        }
    }
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
