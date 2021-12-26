export type StructureId = "trellis" | "irrigation" | "yoke" | "windmill" | "cottage" | "tastingRoom" | "mediumCellar" | "largeCellar";

export interface StructureData {
    name: string;
    description: string;
    cost: number;
}

interface Discount {
    kind: "discount",
    amount: number;
}

interface Voucher {
    kind: "voucher",
    upToCost: number;
}

export type Coupon = Discount | Voucher;

export const structures: Record<StructureId, StructureData> = {
    trellis: {
        name: "Trellis",
        description: "Required to plant certain vines.",
        cost: 2
    },
    irrigation: {
        name: "Irrigation",
        description: "Required to plant certain vines.",
        cost: 3
    },
    yoke: {
        name: "Yoke",
        description: "Personal harvest or uproot action, once per year.",
        cost: 2
    },
    windmill: {
        name: "Windmill",
        description: "Gain 1VP when planting a vine, max once per year.",
        cost: 5
    },
    cottage: {
        name: "Cottage",
        description: "Draw a visitor card each fall.",
        cost: 4
    },
    tastingRoom: {
        name: "Tasting Room",
        description: "Gain 1VP when giving a tour with a non-empty cellar, max once per year.",
        cost: 6
    },
    mediumCellar: {
        name: "Medium Cellar",
        description: "Stores wine of value 4 or greater, including blush wine.",
        cost: 4
    },
    largeCellar: {
        name: "Large Cellar",
        description: "Stores wine of value 7 or greater, including sparkling wine.",
        cost: 6,
    }
};

export const maxStructureCost = Object.values(structures).reduce((max, structure) => {
    if (structure.cost > max) {
        return structure.cost;
    }
    return max;
}, 0);
