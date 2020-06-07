import { GrapeColor } from "./GameState";

export type VineId = keyof typeof vineCards;

export interface VineCardData {
    name: string;
    structures: Array<string>,
    yields: { [K in GrapeColor]?: number; };
}

export const vineCards = {
    cabarnetSauvignon: {
        name: "Cabernet Sauvignon",
        structures: ["trellis", "irrigation"],
        yields: {
            red: 4
        }
    },
    merlot: {
        name: "Merlot",
        structures: ["irrigation"],
        yields: {
            red: 3
        }
    },
    syrah: {
        name: "Syrah",
        structures: ["trellis"],
        yields: {
            red: 2
        }
    },
    sangiovese: {
        name: "Sangiovese",
        structures: [],
        yields: {
            red: 1
        }
    },
    pinot: {
        name: "Pinot",
        structures: ["trellis"],
        yields: {
            red: 1,
            white: 1
        }
    },
    malvasia: {
        name: "Malvasia",
        structures: [],
        yields: {
            white: 1
        }
    },
    trebbiano: {
        name: "Trebbiano",
        structures: ["trellis"],
        yields: {
            white: 2
        }
    },
    sauvignonBlanc: {
        name: "Sauvignon Blanc",
        structures: ["irrigation"],
        yields: {
            white: 3
        }
    },
    chardonnay: {
        name: "Chardonnay",
        structures: ["trellis", "irrigation"],
        yields: {
            white: 4
        }
    },
};
