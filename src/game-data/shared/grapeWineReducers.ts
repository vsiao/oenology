import GameState, { PlayerState, TokenMap, FieldId, WorkerPlacementTurn, PlayVisitorPendingAction } from "../GameState";
import { WineSpec, orderCards } from "../orderCards";
import { updatePlayer, pushActivityLog, gainResiduals, gainVP } from "./sharedReducers";
import { WineIngredients, GrapeSpec } from "../prompts/promptActions";
import { fieldYields, canFillOrderWithWines, devaluedIndex } from "./sharedSelectors";
import { addToDiscard } from "./cardReducers";

//
// Shared `TokenMap` reducers for aging and auto-devaluation
// ----------------------------------------------------------------------------

const cellarValueCap = (structures: PlayerState["structures"]): number =>
    structures.largeCellar ? 9 : structures.mediumCellar ? 6 : 3;

export const ageCellar = (
    cellar: PlayerState["cellar"],
    structures: PlayerState["structures"],
    n = 1
): PlayerState["cellar"] => {
    const valueCap = cellarValueCap(structures);
    cellar = {
        red: ageAllTokens(cellar.red, valueCap),
        white: ageAllTokens(cellar.white, valueCap),
        blush: ageAllTokens(cellar.blush, valueCap),
        sparkling: ageAllTokens(cellar.sparkling, valueCap),
    };
    if (n <= 1) {
        return cellar;
    }
    return ageCellar(cellar, structures, n - 1);
};

export const ageAllTokens = (tokens: TokenMap, valueCap: number = tokens.length): TokenMap => {
    let newTokenMap = new Array(9).fill(false) as TokenMap;
    for (let i = tokens.length - 1; i >= 0; --i) {
        if (!tokens[i]) {
            continue;
        }
        newTokenMap = ageSingleToken(newTokenMap, i, valueCap);
    }
    return newTokenMap;
};

const ageSingleToken = (tokens: TokenMap, i: number, valueCap: number): TokenMap => {
    const newTokenMap = tokens.slice() as TokenMap;
    const atCellarBoundary = i + 1 === 3 || i + 1 === 6 || i + 1 === 9;
    if (newTokenMap[i + 1] || (atCellarBoundary && i + 1 >= valueCap)) {
        // can't age
        newTokenMap[i] = true;
    } else {
        newTokenMap[i + 1] = true;
    }
    return newTokenMap;
};

export const ageSingleWine = (wine: WineSpec, state: GameState): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const idx = wine.value - 1;

    return updatePlayer(state, player.id, {
        cellar: {
            ...player.cellar,
            [wine.color]: ageSingleToken(
                player.cellar[wine.color].map((w, i) => w && i !== idx) as TokenMap,
                idx,
                cellarValueCap(player.structures)
            )
        }
    })
};

//
// Grape-and-wine-specific reducers
// ----------------------------------------------------------------------------

export const harvestFields = (state: GameState, fields: FieldId[]): GameState => {
    fields.forEach(f => state = harvestField(state, f));
    return state;
};

export const harvestField = (
    state: GameState,
    fieldId: FieldId,
    { asChemist = false }: { asChemist?: boolean } = {}
): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const { red, white } = fieldYields(player.fields[fieldId]);
    const yields = asChemist
        ? { red: Math.max(0, red - 1), white: Math.max(0, white - 1) }
        : { red, white };
    return pushActivityLog(
        { type: "harvest", playerId: player.id, yields },
        placeGrapes(updatePlayer(state, player.id, {
            fields: {
                ...player.fields,
                [fieldId]: { ...player.fields[fieldId], harvested: true }
            }
        }), yields)
    );
};

export const placeGrapes = (
    state: GameState,
    { red = 0, white = 0 }: { red?: number; white?: number; }
): GameState => {
    const player = state.players[state.currentTurn.playerId];

    // devalue grapes if crush pad already contains the same value
    const rIdx = devaluedIndex(red, player.crushPad.red);
    const wIdx = devaluedIndex(white, player.crushPad.white);
    return updatePlayer(state, player.id, {
        crushPad: {
            red: player.crushPad.red.map((r, i) => i === rIdx || r) as TokenMap,
            white: player.crushPad.white.map((w, i) => i === wIdx || w) as TokenMap,
        },
    });
};

export const discardGrapes = (state: GameState, grapes: GrapeSpec[]) => {
    const player = state.players[state.currentTurn.playerId];

    let crushPad = player.crushPad;
    grapes.forEach(g => {
        crushPad = {
            ...crushPad,
            [g.color]: crushPad[g.color].map((hasWine, i) => hasWine && g.value !== i + 1),
        };
    });
    return pushActivityLog(
        { type: "discardGrapes", playerId: player.id, grapes },
        updatePlayer(state, state.currentTurn.playerId, { crushPad })
    );
};

export const gainWine = (
    wine: WineSpec,
    state: GameState
): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const idx = devaluedIndex(wine.value, player.cellar[wine.color]);
    return pushActivityLog(
        { type: "gainWine", playerId: player.id, wine },
        updatePlayer(state, player.id, {
            cellar: {
                ...player.cellar,
                [wine.color]: player.cellar[wine.color].map((w, i) => i === idx || w) as TokenMap,
            },
        })
    );
};

export const makeWineFromGrapes = (
    state: GameState,
    wine: WineIngredients[],
    playerId = state.currentTurn.playerId
): GameState => {
    const player = state.players[playerId];

    let { cellar, crushPad } = player;
    const wines: WineSpec[] = [];
    wine.forEach(({ type, grapes, cellarValue }) => {
        const idx = devaluedIndex(cellarValue, cellar[type]);
        if (idx < 0) {
            return;
        }
        wines.push({ color: type, value: idx + 1 });
        cellar = {
            ...cellar,
            [type]: cellar[type].map((w, i) => w || i === idx),
        };
        crushPad = {
            red: crushPad.red.map(
                (r, i) => r && grapes.every(({ color, value }) => color !== "red" || value !== i + 1)
            ) as TokenMap,
            white: crushPad.white.map(
                (w, i) => w && grapes.every(({ color, value }) => color !== "white" || value !== i + 1)
            ) as TokenMap,
        };
    });

    return pushActivityLog(
        { type: "makeWine", playerId: playerId, wines, },
        updatePlayer(state, player.id, { crushPad, cellar, })
    );
};

export const fillOrder = (
    winesToUse: WineSpec[],
    state: GameState,
    { bonusVP = false, asPremiumBuyer = false }: {
        bonusVP?: boolean;
        asPremiumBuyer?: boolean;
    } = {}
): GameState => {
    const orderId = ((state.currentTurn as WorkerPlacementTurn).pendingAction as PlayVisitorPendingAction).orderId;
    if (!orderId) {
        throw new Error("Unexpected state: should've chosen an order before filling");
    }
    const { residualIncome, victoryPoints } = orderCards[orderId];
    state = addToDiscard(
        [{ type: "order", id: orderId }],
        discardWines(
            pushActivityLog({ type: "fill", playerId: state.currentTurn.playerId, orderId, }, state),
            winesToUse
        )
    );
    return gainResiduals(
        residualIncome,
        gainVP(
            victoryPoints,
            asPremiumBuyer && canFillOrderWithWines(orderId, winesToUse, /* asPremiumBuyer */ true)
                ? gainVP(2, state, { source: "visitor" })
                : bonusVP
                    ? gainVP(1, state, { source: "bonus" })
                    : state,
            { source: "fill" }
        )
    );
};

export const discardWines = (state: GameState, wines: WineSpec[]) => {
    const player = state.players[state.currentTurn.playerId];

    let cellar = player.cellar;
    wines.forEach(w => {
        cellar = {
            ...cellar,
            [w.color]: cellar[w.color].map((hasWine, i) => hasWine && w.value !== i + 1),
        };
    });
    return updatePlayer(state, state.currentTurn.playerId, { cellar });
};
