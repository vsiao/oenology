import GameState, { CardType, CardId, CardsByType } from "../GameState";
import { pushActivityLog, updatePlayer } from "./sharedReducers";
import {
    SummerVisitorId,
    VisitorId,
    WinterVisitorId,
    summerVisitorCards,
    visitorCards,
    winterVisitorCards,
} from "../visitors/visitorCards";
import { orderCards, OrderId } from "../orderCards";
import { vineCards, VineId } from "../vineCards";

export const UNSHUFFLED_CARDS: CardsByType = {
    vine: Object.keys(vineCards) as VineId[],
    summerVisitor: Object.keys(summerVisitorCards) as SummerVisitorId[],
    order: Object.keys(orderCards) as OrderId[],
    winterVisitor: Object.keys(winterVisitorCards) as WinterVisitorId[],
};

const splitDeck = <T extends unknown>(deck: T[], n: number | undefined): [T[], T[]] => {
    return [n ? deck.slice(0, n) : [], n ? deck.slice(n) : deck];
};
export const drawCards = (
    state: GameState,
    numCards: { [K in CardType]?: number },
    playerId = state.currentTurn.playerId
): GameState => {
    const drawPiles = state.drawPiles;
    const [drawnVines, vine] = splitDeck(drawPiles.vine, numCards.vine);
    const [drawnSummerVisitors, summerVisitor] = splitDeck(drawPiles.summerVisitor, numCards.summerVisitor);
    const [drawnOrders, order] = splitDeck(drawPiles.order, numCards.order);
    const [drawnWinterVisitors, winterVisitor] = splitDeck(drawPiles.winterVisitor, numCards.winterVisitor);

    const drawnCards = [
        ...drawnVines.map((id) => ({ type: "vine" as const, id })),
        ...drawnSummerVisitors.map((id) => ({ type: "visitor" as const, id })),
        ...drawnOrders.map((id) => ({ type: "order" as const, id })),
        ...drawnWinterVisitors.map((id) => ({ type: "visitor" as const, id })),
    ];

    return pushActivityLog(
        {
            type: "draw",
            playerId,
            cards: drawnCards.map((card) => card.type === "visitor"
                ? (visitorCards[card.id].season === "summer" ? "summerVisitor" : "winterVisitor")
                : card.type),
        },
        updatePlayer(
            { ...state, drawPiles: { vine, summerVisitor, order, winterVisitor }, },
            playerId,
            { cardsInHand: [...state.players[playerId].cardsInHand, ...drawnCards], }
        )
    );
};

export const discardCards = (cards: CardId[], state: GameState): GameState => {
    return addToDiscard(cards, removeCardsFromHand(cards, state));
};

/**
 * Used to remove a card from a hand without yet adding it to the discard pile.
 * When playing a visitor card we want to resolve its effects with the card taken
 * out of the hand (so that visitors that count cards-in-hand don't count the visitor
 * itself), but before the card reaches discard (so that visitors who pick up from
 * the discard can work properly).
 */
export const removeCardsFromHand = (cards: CardId[], state: GameState): GameState => {
    const player = state.players[state.currentTurn.playerId];
    return updatePlayer(state, player.id, {
        cardsInHand: player.cardsInHand.filter(({ id }) =>
            cards.every((card) => card.id !== id)
        ),
    });
};

export const addToDiscard = (cards: CardId[], state: GameState): GameState => {
    let discardPiles = state.discardPiles;
    for (const card of cards) {
        const pileType =
            card.type === "visitor"
                ? visitorCards[card.id].season === "summer"
                    ? "summerVisitor"
                    : "winterVisitor"
                : card.type;
        discardPiles = {
            ...discardPiles,
            [pileType]: [card.id, ...discardPiles[pileType]],
        };
    }
    return { ...state, discardPiles };
};

/**
 * Finds a card by id and places it in the given player's hand. This essentially
 * spawns a duplicate copy of the card; we don't attempt to take the card out
 * of the deck or any other player's hand.
 */
export const CHEAT_drawCard = (id: string, playerId: string, state: GameState) => {
    const player = state.players[playerId];
    let cardId: CardId | null = null;
    if (orderCards.hasOwnProperty(id)) {
        cardId = { type: "order", id: id as OrderId };
    } else if (visitorCards.hasOwnProperty(id)) {
        cardId = { type: "visitor", id: id as VisitorId };
    } else if (vineCards.hasOwnProperty(id)) {
        cardId = { type: "vine", id: id as VineId };
    }
    if (!cardId) {
        return state;
    }
    return updatePlayer(state, player.id, {
        cardsInHand: [...player.cardsInHand, cardId],
    });
};
