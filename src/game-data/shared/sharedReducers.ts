import GameState, { CardType } from "../GameState";

export const discardWine = (state: GameState, playerId: string, wine: unknown) => {
    return state;
};

const splitDeck = <T>(deck: T[], n: number | undefined): [T[], T[]] => {
    return [n ? deck.slice(0, n) : [], n ? deck.slice(n) : deck];
};
export const drawCards = (
    state: GameState,
    playerId: string,
    numCards: { [K in CardType]?: number }
): GameState => {
    const drawPiles = state.drawPiles;
    const [drawnVines, vine] = splitDeck(drawPiles.vine, numCards.vine);
    const [drawnSummerVisitors, summerVisitor] = splitDeck(drawPiles.summerVisitor, numCards.summerVisitor);
    const [drawnOrders, order] = splitDeck(drawPiles.order, numCards.order);
    const [drawnWinterVisitors, winterVisitor] = splitDeck(drawPiles.winterVisitor, numCards.winterVisitor);

    const hand = state.players[playerId].cardsInHand;
    return {
        ...state,
        drawPiles: { vine, summerVisitor, order, winterVisitor },
        players: {
            ...state.players,
            [playerId]: {
                ...state.players[playerId],
                cardsInHand: {
                    vine: [...hand.vine, ...drawnVines],
                    summerVisitor: [...hand.summerVisitor, ...drawnSummerVisitors],
                    order: [...hand.order, ...drawnOrders],
                    winterVisitor: [...hand.winterVisitor, ...drawnWinterVisitors],
                },
            }
        }
    };
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
