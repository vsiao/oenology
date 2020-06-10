import GameState, { CardType } from "../GameState";
import { SummerVisitorId, WinterVisitorId } from "../visitors/visitorCards";

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

    return {
        ...state,
        drawPiles: { vine, summerVisitor, order, winterVisitor },
        players: {
            ...state.players,
            [playerId]: {
                ...state.players[playerId],
                cardsInHand: [
                    ...state.players[playerId].cardsInHand,
                    ...drawnVines.map(id => ({ type: "vine" as const, id })),
                    ...drawnSummerVisitors.map(id => ({ type: "summerVisitor" as const, id })),
                    ...drawnOrders.map(id => ({ type: "order" as const, id })),
                    ...drawnWinterVisitors.map(id => ({ type: "winterVisitor" as const, id })),
                ],
            }
        }
    };
};

export const endTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    switch (currentTurn.type) {
        case "papaSetUp":
            return state;
        case "wakeUpOrder":
            return state;
        case "workerPlacement": {
            if (wakeUpOrder.every(p => p == null || p.passed)) {
                throw new Error("Unexpected state: no valid players for current season");
            }
            let i = wakeUpOrder.findIndex(player => player && player.playerId === currentTurn.playerId);
            while (true) {
                i = (i + 1) % wakeUpOrder.length;
                const maybeNextPlayer = wakeUpOrder[i];
                if (maybeNextPlayer !== null && !maybeNextPlayer.passed) {
                    let { discardPiles, players } = state;
                    if (
                        currentTurn.pendingAction !== null &&
                        currentTurn.pendingAction.type === "playVisitor"
                    ) {
                        const visitorId = currentTurn.pendingAction.visitorId;
                        // Filter out visitor card from current player's hand
                        players = {
                            ...players,
                            [currentTurn.playerId]: {
                                ...players[currentTurn.playerId],
                                cardsInHand: players[currentTurn.playerId].cardsInHand.filter(({ id }) => id !== visitorId),
                            },
                        };
                        // And add it to the front of the appropriate discard pile
                        discardPiles = {
                            ...discardPiles,
                            ...(currentTurn.season === "summer"
                                ? { summerVisitor: [visitorId as SummerVisitorId, ...discardPiles.summerVisitor] }
                                : { winterVisitor: [visitorId as WinterVisitorId, ...discardPiles.winterVisitor] })
                        };
                    }
                    return {
                        ...state,
                        players,
                        discardPiles,
                        currentTurn: {
                            type: "workerPlacement",
                            playerId: maybeNextPlayer.playerId,
                            pendingAction: null,
                            season: currentTurn.season,
                        },
                    };
                }
            }
        }
        case "fallVisitor":
            return state;
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
