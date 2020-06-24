import GameState, { Field, CardType, WineColor } from "../GameState";
import { vineCards } from "../vineCards";
import { visitorCards } from "../visitors/visitorCards";
import { WineSpec, orderCards, OrderId } from "../orderCards";
import { Coupon, structures, StructureId } from "../structures";

export const buildStructureDisabledReason = (
    state: GameState,
    coupon?: Coupon
) => {
    const player = state.players[state.currentTurn.playerId];
    return Object.entries(player.structures)
        .some(([id, built]) => {
            if (built) {
                // already built; can't build again
                return false;
            }
            const baseCost = structures[id as StructureId].cost;
            if (!coupon) {
                return baseCost <= player.coins;
            }
            switch (coupon.kind) {
                case "discount":
                    return (baseCost - coupon.amount) <= player.coins;
                case "voucher":
                    return baseCost <= coupon.upToCost;
            }
        })
        ? undefined
        : "You don't have any structures you can build.";
};

export const fieldYields = (field: Field): { red: number; white: number; } => {
    return {
        red: field.vines.reduce(
            (r, v) => r + (vineCards[v].yields.red! || 0),
            0
        ),
        white: field.vines.reduce(
            (w, v) => w + (vineCards[v].yields.white! || 0),
            0
        ),
    };
};

export const plantVineDisabledReason = (state: GameState) => {
    const player = state.players[state.currentTurn.playerId];
    const fields = Object.values(player.fields);
    return player.cardsInHand.some(card => {
        return card.type === "vine" &&
            fields.some(field => {
                const { red, white } = fieldYields({
                    ...field,
                    vines: [...field.vines, card.id],
                });
                return red + white <= field.value;
            });
    })
        ? undefined
        : "You don't have any vines you can plant.";
};

export const hasGrapes = (state: GameState, playerId = state.currentTurn.playerId) => {
    return Object.values(state.players[playerId].crushPad)
        .some(grapes => grapes.some(g => g === true));
};
export const needGrapesDisabledReason = (state: GameState, playerId = state.currentTurn.playerId) => {
    return hasGrapes(state, playerId) ? undefined : "You don't have any grapes.";
};

export const allWines = (state: GameState, playerId = state.currentTurn.playerId): WineSpec[] => {
    const cellarWines: WineSpec[] = [];
    Object.entries(state.players[playerId].cellar).forEach(([color, tokenMap]) => {
        tokenMap.forEach((hasToken, i) => {
            if (hasToken) {
                cellarWines.push({ color: color as WineColor, value: i + 1 });
            }
        })
    });
    return cellarWines;
};

export const needWineDisabledReason = (
    state: GameState,
    minValue = 1,
    playerId = state.currentTurn.playerId
) => {
    const wines = allWines(state, playerId);
    if (wines.length === 0) {
        return "You don't have any wine.";
    }
    if (wines.every(w => w.value < minValue)) {
        return `You don't have any wines of value ${minValue} or more.`
    }
    return undefined;
};

export const canFillOrderWithWines = (orderId: OrderId, wines: WineSpec[]): false | WineSpec[] => {
    const winesLeft = wines.slice().sort((w1, w2) => w1.value - w2.value);

    for (const orderWine of orderCards[orderId].wines) {
        const matchingWineIdx = winesLeft.findIndex(
            ({ color, value }) => color === orderWine.color && value >= orderWine.value
        );
        if (matchingWineIdx < 0) {
            return false;
        }
        winesLeft.splice(matchingWineIdx, 1);
    }
    return winesLeft;
};

export const fillOrderDisabledReason = (state: GameState, playerId = state.currentTurn.playerId) => {
    return needWineDisabledReason(state, 1, playerId) ||
        needCardOfTypeDisabledReason(state, "order", playerId) ||
        (state.players[playerId].cardsInHand.some(card => {
            return card.type === "order" &&
                canFillOrderWithWines(card.id, allWines(state, playerId));
        }) ? undefined : "You can't fill any of your orders.");

};

export const needCardOfTypeDisabledReason = (
    state: GameState,
    type: CardType,
    playerId = state.currentTurn.playerId
) => {
    const hasCard = state.players[playerId].cardsInHand.some(card => {
        if (card.type === "visitor") {
            const { season } = visitorCards[card.id];
            switch (type) {
                case "summerVisitor":
                    return season === "summer";
                case "winterVisitor":
                    return season === "winter";
                default:
                    return false;
            }
        }
        return card.type === type;
    });
    if (hasCard) {
        return undefined;
    }
    switch (type) {
        case "order":
            return "You don't have any order cards.";
        case "summerVisitor":
            return "You don't have any summer visitors.";
        case "vine":
            return "You don't have any vine cards.";
        case "winterVisitor":
            return "You don't have any winter visitors.";
    }
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
    const trainedWorkers = playerState.workers.filter(w => !w.isTemp);
    if (trainedWorkers.length >= MAX_TRAINED_WORKERS) {
        return "You can't train any more workers.";
    }
    return moneyDisabledReason(state, cost);
};

export const moneyDisabledReason = (
    state: GameState,
    cost: number,
    playerId = state.currentTurn.playerId
): string | undefined => {
    return state.players[playerId].coins < cost ? "You don't have enough money." : undefined;
};
