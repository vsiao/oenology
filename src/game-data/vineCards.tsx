import { GrapeColor } from "./GameState";

export type VineId = keyof typeof vineCards;

export interface VineCardData {
    name: string;
    structures: Array<string>,
    yields: { [K in GrapeColor]?: number; };
}

export const vineCards = {
    cabernetSauvignon: {
        name: "Cabernet Sauvignon",
        structures: ["trellis", "irrigation"],
        yields: {
            red: 4
        },
        count: 4,
    },
    merlot: {
        name: "Merlot",
        structures: ["irrigation"],
        yields: {
            red: 3
        },
        count: 5,
    },
    syrah: {
        name: "Syrah",
        structures: ["trellis"],
        yields: {
            red: 2
        },
        count: 5,
    },
    sangiovese: {
        name: "Sangiovese",
        structures: [],
        yields: {
            red: 1
        },
        count: 4,
    },
    pinot: {
        name: "Pinot",
        structures: ["trellis"],
        yields: {
            red: 1,
            white: 1
        },
        count: 6,
    },
    malvasia: {
        name: "Malvasia",
        structures: [],
        yields: {
            white: 1
        },
        count: 4,
    },
    trebbiano: {
        name: "Trebbiano",
        structures: ["trellis"],
        yields: {
            white: 2
        },
        count: 5,
    },
    sauvignonBlanc: {
        name: "Sauvignon Blanc",
        structures: ["irrigation"],
        yields: {
            white: 3
        },
        count: 5,
    },
    chardonnay: {
        name: "Chardonnay",
        structures: ["trellis", "irrigation"],
        yields: {
            white: 4
        },
        count: 4,
    },
};
