import GameState, { Field, FieldId, CardType, WineColor, StructureState } from "../GameState";
import { vineCards, VineId } from "../vineCards";
import { visitorCards } from "../visitors/visitorCards";
import { WineSpec, orderCards, OrderId } from "../orderCards";
import { Coupon, structures, StructureId } from "../structures";
import { GrapeSpec, VineInField } from "../prompts/promptActions";

export const buildStructureDisabledReason = (
    state: GameState,
    coupon: Coupon = { kind: "discount", amount: 0 },
    playerId = state.currentTurn.playerId
) => {
    return Object.keys(structures)
        .some(id => structureDisabledReason(state, id as StructureId, coupon, playerId) === undefined)
        ? undefined
        : "You don't have any structures you can build.";
};

export const structureDisabledReason = (
    state: GameState,
    id: StructureId,
    coupon: Coupon,
    playerId = state.currentTurn.playerId
): string | undefined => {
    const player = state.players[playerId];
    if (player.structures[id]) {
        return "Already built";
    }
    if (id === "largeCellar" && !player.structures.mediumCellar) {
        return "Must build Medium Cellar first";
    }
    const baseCost = structures[id as StructureId].cost;
    switch (coupon.kind) {
        case "discount":
            return moneyDisabledReason(state, baseCost - coupon.amount, player.id);
        case "voucher":
            return baseCost > coupon.upToCost
                ? `Can only build structures up to ${coupon.upToCost}`
                : undefined;
    }
};

export const structureUsedDisabledReason = (
    state: GameState,
    id: StructureId,
    playerId = state.currentTurn.playerId
): string | undefined => {
    const player = state.players[playerId];
    switch (player.structures[id]) {
        case StructureState.Used:
            return "Can only be used once per year.";
        case StructureState.Unbuilt:
            return "You haven’t built this structure yet.";
    }
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

export const switchVines = (
    vines: VineInField[],
    fields: Record<FieldId, Field>
): Record<FieldId, Field> => {
    if (vines.length !== 2) {
        return fields;
    }
    const field0 = fields[vines[0].field];
    const field1 = fields[vines[1].field];
    return {
        ...fields,
        [field0.id]: {
            ...field0,
            vines: field0.vines.filter(id => id !== vines[0].id).concat(vines[1].id)
        },
        [field1.id]: {
            ...field1,
            vines: field1.vines.filter(id => id !== vines[1].id).concat(vines[0].id)
        }
    };
};

/**
 * Determines if a specific vine can be planted in a specific field.
 * Assumes that the vine itself is plantable (ie. does not check structures)
 */
export const plantVineInFieldDisabledReason = (
    vineId: VineId,
    field: Field,
    bypassFieldLimit = false
): string | undefined => {
    if (field.sold) {
        return "You don't own this field.";
    }
    if (bypassFieldLimit) {
        return undefined;
    }
    const { red, white } = fieldYields({
        ...field,
        vines: [...field.vines, vineId],
    });
    return red + white > field.value ? "Planting here would exceed the field's value" : undefined;
};

/**
 * Determines if a specific vine can be planted in *any* field
 */
export const plantVineDisabledReason = (
    state: GameState,
    vineId: VineId,
    { bypassFieldLimit = false, bypassStructures = false, playerId = state.currentTurn.playerId }: {
        bypassFieldLimit?: boolean;
        bypassStructures?: boolean;
        playerId?: string;
    } = {}
) => {
    const player = state.players[playerId];
    const fields = Object.values(player.fields);

    if (!bypassStructures && !vineCards[vineId].structures.every(s => !!player.structures[s])) {
        return "You haven't built the required structures.";
    }
    const hasOpenField = fields.some(
        field => !plantVineInFieldDisabledReason(vineId, field, bypassFieldLimit)
    );
    return hasOpenField ? undefined : "You can't plant this on any of your fields.";
};

/**
 * Determines if *any* vine can be planted in *any* field
 */
export const plantVinesDisabledReason = (
    state: GameState,
    opts: {
        bypassFieldLimit?: boolean;
        bypassStructures?: boolean;
        playerId?: string;
    } = {}
) => {
    const player = state.players[opts.playerId ?? state.currentTurn.playerId];
    return player.cardsInHand.some(card => {
        return card.type === "vine" && plantVineDisabledReason(state, card.id, opts) === undefined;
    })
        ? undefined
        : "You don't have any vines you can plant.";
};

export const hasGrapes = (state: GameState, playerId = state.currentTurn.playerId) => {
    return Object.values(state.players[playerId].crushPad)
        .some(grapes => grapes.some(g => g === true));
};

export const allGrapes = (state: GameState, playerId = state.currentTurn.playerId): GrapeSpec[] => {
    const grapes: GrapeSpec[] = [];
    const { red, white } = state.players[playerId].crushPad;
    red.forEach((r, i) => {
        if (r) grapes.push({ color: "red", value: i + 1 });
    });
    white.forEach((w, i) => {
        if (w) grapes.push({ color: "white", value: i + 1 });
    });
    return grapes;
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
        });
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
        return `You don't have any wines of value ${minValue} or more.`;
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
        needCardOfTypeDisabledReason(state, "order", { playerId }) ||
        (state.players[playerId].cardsInHand.some(card => {
            return card.type === "order" &&
                canFillOrderWithWines(card.id, allWines(state, playerId));
        }) ? undefined : "You can't fill any of your orders.");
};

export const cardTypesInPlay = (state: GameState): CardType[] => {
    return ["vine", "summerVisitor", "order", "winterVisitor"];
};

export const numCardsDisabledReason = (
    state: GameState,
    numCards: number,
    playerId = state.currentTurn.playerId
) => {
    const player = state.players[playerId];
    return player.cardsInHand.length < numCards
        ? "You don't have enough cards."
        : undefined;
};

export const needCardOfTypeDisabledReason = (
    state: GameState,
    type: CardType | "visitor",
    { playerId = state.currentTurn.playerId, numCards = 1 }: {
        playerId?: string;
        numCards?: number;
    } = {}
) => {
    const hasCard = state.players[playerId].cardsInHand.some(card => {
        if (card.type === "visitor") {
            const { season } = visitorCards[card.id];
            switch (type) {
                case "visitor":
                    return true;
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
    if (
        Object.values(playerState.fields)
            .every(field => field.sold || field.vines.length === 0 || field.harvested)
    ) {
        return "You don't have any fields to harvest.";
    };
    return undefined;
};

export const uprootDisabledReason = (
    state: GameState,
    { numVines = 1 }: {
        numVines?: number;
    } = {}
): string | undefined => {
    const playerState = state.players[state.currentTurn.playerId];
    if (
        Object.values(playerState.fields)
            .reduce((count, field) => count += field.vines.length, 0) < numVines
    ) {
        return "You don't have enough vines to uproot.";
    }
    return undefined;
};

const MAX_TRAINED_WORKERS = 6;
export const trainWorkerDisabledReason = (
    state: GameState,
    cost: number,
    playerId = state.currentTurn.playerId
): string | undefined => {
    const playerState = state.players[playerId];
    const trainedWorkers = playerState.workers.filter(w => !w.isTemp);
    if (trainedWorkers.length >= MAX_TRAINED_WORKERS) {
        return "You can't train any more workers.";
    }
    return moneyDisabledReason(state, cost, playerId);
};

export const moneyDisabledReason = (
    state: GameState,
    cost: number,
    playerId = state.currentTurn.playerId
): string | undefined => {
    return state.players[playerId].coins < cost ? "You don't have enough money." : undefined;
};

export const GAME_OVER_VP = 20;
export const gameIsOver = (state: GameState) => {
    return state.currentTurn.type === "workerPlacement"
        && state.currentTurn.season === "winter"
        && state.wakeUpOrder.every(pos => !pos || pos.passed)
        && Object.values(state.players).some(p => p.victoryPoints >= GAME_OVER_VP);
};

export const residualPaymentsDisabledReason = (state: GameState, n: number): string | undefined => {
    return state.players[state.currentTurn.playerId].residuals >= n
        ? undefined
        : "You don't have enough residual payments.";
};
