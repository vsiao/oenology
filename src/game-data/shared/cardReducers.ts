import Alea from "alea";
import GameState, { CardType, CardId, CardsByType } from "../GameState";
import { pushActivityLog, updatePlayer } from "./sharedReducers";
import {
    SummerVisitorId,
    VisitorId,
    WinterVisitorId,
    summerVisitorCards,
    visitorCards,
    winterVisitorCards,
    rhineSummerVisitorCards,
    rhineWinterVisitorCards,
} from "../visitors/visitorCards";
import { orderCards, OrderId } from "../orderCards";
import { vineCards, VineId } from "../vineCards";

export const unshuffledDecks = (
    exclude: { [K in string]?: boolean },
    options: { rhineVisitors?: boolean }
): CardsByType => {
    return {
        vine: Object.keys(vineCards) as VineId[],
        summerVisitor: Object
            .keys(options.rhineVisitors ? rhineSummerVisitorCards : summerVisitorCards)
            .filter(id => !exclude[id]) as SummerVisitorId[],
        order: Object.keys(orderCards) as OrderId[],
        winterVisitor: Object
            .keys(options.rhineVisitors ? rhineWinterVisitorCards : winterVisitorCards)
            .filter(id => !exclude[id]) as WinterVisitorId[],
    };
};

export const shuffle = <T>(inCards: T[], random: () => number): T[] => {
    const out = inCards.slice();

    // Fisher-Yates shuffle
    for (let i = out.length - 1; i >= 0; --i) {
        const j = Math.floor(random() * (i + 1)); // 0 <= x <= i
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
    }
    return out;
};

const splitDeck = <T extends unknown>(deck: T[], n: number | undefined): [T[], T[]] => {
    return [n ? deck.slice(0, n) : [], n ? deck.slice(n) : deck];
};
export const drawCards = (
    state: GameState,
    seed: string,
    numCards: { [K in CardType]?: number },
    playerId = state.currentTurn.playerId
): GameState => {
    const drawnCards: CardId[] = [];

    let random: () => number;
    Object.entries(numCards).forEach(([t, numCards]) => {
        if (!numCards) {
            return;
        }
        const type = t as CardType;
        const { drawPiles, discardPiles } = state;
        let drawPile: string[] = drawPiles[type];
        if (drawPile.length < numCards) {
            drawPile = [...drawPile, ...shuffle(discardPiles[type], random || (random = Alea(seed)))];
            state = { ...state, discardPiles: { ...state.discardPiles, [type]: [] } };
        }
        let cards: string[];
        [cards, drawPile] = splitDeck(drawPile, numCards);
        state = { ...state, drawPiles: { ...state.drawPiles, [type]: drawPile } };

        drawnCards.push(
            ...cards.map(id =>
                ({ type: type === "vine" || type === "order" ? type : "visitor", id, }) as CardId
            )
        );
    });

    // Can't undo a card draw
    state = { ...state, undoState: { type: "drawnCard" }, };

    return pushActivityLog(
        {
            type: "draw",
            playerId,
            cards: drawnCards.map((card) => card.type === "visitor"
                ? (visitorCards[card.id].season === "summer" ? "summerVisitor" : "winterVisitor")
                : card.type),
        },
        addCardsToHand(drawnCards, state, playerId)
    );
};

export const discardCards = (cards: CardId[], state: GameState): GameState => {
    return pushActivityLog(
        {
            type: "discard",
            playerId: state.currentTurn.playerId,
            cards: cards.map((card) => card.type === "visitor"
                ? (visitorCards[card.id].season === "summer" ? "summerVisitor" : "winterVisitor")
                : card.type),
        },
        addToDiscard(cards, removeCardsFromHand(cards, state))
    );
};

export const addCardsToHand = (
    cards: CardId[],
    state: GameState,
    playerId = state.currentTurn.playerId
): GameState => {
    return updatePlayer(
        state,
        playerId,
        { cardsInHand: [...state.players[playerId].cardsInHand, ...cards], }
    );
};

/**
 * Used to remove a card from a hand without yet adding it to the discard pile.
 * When playing a visitor card we want to resolve its effects with the card taken
 * out of the hand (so that visitors that count cards-in-hand don't count the visitor
 * itself), but before the card reaches discard (so that visitors who pick up from
 * the discard can work properly).
 */
export const removeCardsFromHand = (
    cards: CardId[],
    state: GameState,
    playerId = state.currentTurn.playerId
): GameState => {
    const player = state.players[playerId];
    if (!cards.every(card => player.cardsInHand.some(({ id }) => id === card.id))) {
        throw new Error(
            `Unexpected state: tried to remove cards that weren't in the player's hand: ` +
            `${cards.map(({ id }) => id)} playerId: ${playerId}`
        );
    }
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
