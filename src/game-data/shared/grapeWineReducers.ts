import GameState, { PlayerState, TokenMap, FieldId, WorkerPlacementTurn } from "../GameState";
import { WineSpec, OrderId, orderCards } from "../orderCards";
import { updatePlayer, pushActivityLog, gainResiduals, gainVP } from "./sharedReducers";
import { WineIngredients, GrapeSpec } from "../prompts/promptActions";
import { fieldYields } from "./sharedSelectors";
import { addToDiscard } from "./cardReducers";

//
// Shared `TokenMap` reducers for aging and auto-devaluation
// ----------------------------------------------------------------------------

export const ageCellar = (
    cellar: PlayerState["cellar"],
    structures: PlayerState["structures"],
    n = 1
): PlayerState["cellar"] => {
    const valueCap = structures.largeCellar ? 9 : structures.mediumCellar ? 6 : 3;
    cellar = {
        red: ageAll(cellar.red, valueCap),
        white: ageAll(cellar.white, valueCap),
        blush: ageAll(cellar.blush, valueCap),
        sparkling: ageAll(cellar.sparkling, valueCap),
    };
    if (n <= 1) {
        return cellar;
    }
    return ageCellar(cellar, structures, n - 1);
};

export const ageAll = (tokens: TokenMap, valueCap: number = tokens.length): TokenMap => {
    let newTokenMap = new Array(9).fill(false) as TokenMap;
    for (let i = tokens.length - 1; i >= 0; --i) {
        if (!tokens[i]) {
            continue;
        }
        newTokenMap = ageSingle(newTokenMap, i, valueCap);
    }
    return newTokenMap;
};

export const ageSingle = (tokens: TokenMap, i: number, valueCap: number = tokens.length): TokenMap => {
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

export const devaluedIndex = (value: number, tokens: TokenMap) => {
    for (value--; value >= 0; --value) {
        if (!tokens[value]) {
            return value;
        }
    }
    return -1;
};

//
// Grape-and-wine-specific reducers
// ----------------------------------------------------------------------------

export const harvestFields = (state: GameState, fields: FieldId[]): GameState => {
    fields.forEach(f => state = harvestField(state, f));
    return state;
};

export const harvestField = (state: GameState, fieldId: FieldId): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const yields = fieldYields(player.fields[fieldId]);
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
        if (cellarValue <= 0) {
            return;
        }
        wines.push({ color: type, value: cellarValue });
        cellar = {
            ...cellar,
            [type]: cellar[type].map((w, i) => w || i === cellarValue - 1),
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
    bonusVP = false
): GameState => {
    const orderId = ((state.currentTurn as WorkerPlacementTurn).pendingAction as any).orderId as OrderId;
    if (!orderId) {
        throw new Error("Unexpected state: should've chosen an order before filling");
    }
    const { residualIncome, wines, victoryPoints } = orderCards[orderId];
    return gainResiduals(residualIncome, gainVP(victoryPoints + (bonusVP ? 1 : 0),
        addToDiscard(
            [{ type: "order", id: orderId }],
            discardWines(
                pushActivityLog({ type: "fill", playerId: state.currentTurn.playerId, wines }, state),
                winesToUse
            )
        )
    ));
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
