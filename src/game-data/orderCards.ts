import { WineColor } from "./GameState";

export type OrderId = keyof typeof orderCards;


export interface OrderCardData {
    wines: WineSpec[],
    victoryPoints: number,
    residualIncome: number;
}

export interface WineSpec {
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
    r3b7: o(5, 2, r(3), b(7)),
    r6: o(3, 1, r(6)),
    w3s7: o(6, 2, w(3), s(7)),
    w3b7: o(5, 2, w(3), b(7)),
    r2w4: o(3, 1, r(2), w(4)),
    b6: o(3, 1, b(6)),
    r3w5: o(4, 1, r(3), w(5)),
    b8: o(4, 1, b(8)),
    w5: o(2, 1, w(5)),
    r8: o(4, 1, r(8)),
    r43: o(3, 1, r(4, 3)),
    w4b4: o(4, 1, w(4), b(4)),
    b65: o(6, 2, b(6, 5)),
    b4: o(2, 1, b(4)),
    r2w2b5: o(5, 2, r(2), w(2), b(5)),
    w6: o(3, 1, w(6)),
    r2w2: o(2, 1, r(2), w(2)),
    w43: o(3, 1, w(4, 3)),
    r3w3: o(3, 1, r(3), w(3)),
    r4b4: o(4, 1, r(4), b(4)),
    r6w6: o(5, 2, r(6), w(6)),
    w2s8: o(6, 2, w(2), s(8)),
    w3s8: o(6, 2, w(3), s(8)),
    r76: o(5, 2, r(7, 6)),
    r3w1: o(2, 1, r(3), w(1)),
    w76: o(5, 2, w(7, 6)),
    s9: o(5, 2, s(9)),
    s7: o(4, 1, s(7)),
    r5: o(2, 1, r(5)),
    w8: o(4, 1, w(8)),
    r1w3: o(2, 1, r(1), w(3)),
    r4w2: o(3, 1, r(4), w(2))
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
