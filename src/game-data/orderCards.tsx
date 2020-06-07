import { WineColor } from "./GameState";

export type OrderId = keyof typeof orderCards;


export interface OrderCardData {
    wines: WineSpec[],
    victoryPoints: number,
    residualIncome: number;
}

interface WineSpec {
    color: WineColor,
    value: number;
}

const o = (
    victoryPoints: number,
    residualIncome: number,
    ...wines: WineSpec[][]
): OrderCardData => {
    return {
        wines: ([] as WineSpec[]).concat.apply([], wines),
        victoryPoints,
        residualIncome
    };
};


export const orderCards = {
    w432: o(4, 1, w(4, 3, 2)),
    r432: o(4, 1, r(4, 3, 2)),
    w4s7: o(6, 2, w(4), s(7)),
    r5w3: o(4, 1, r(5), w(3)),
    r3b7: o(5, 2, r(3), b(7))
};


function b(...values: number[]): WineSpec[] {
    return values.map(value => ({ color: "blush", value }));
}

function r(...values: number[]): WineSpec[] {
    return values.map(value => ({ color: "red", value }));
}


function s(...values: number[]): WineSpec[] {
    return values.map(value => ({ color: "sparkling", value }));
}

function w(...values: number[]): WineSpec[] {
    return values.map(value => ({ color: "white", value }));
}
