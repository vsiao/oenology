export type StructureId = "trellis" | "irrigation" | "yoke" | "windmill" | "cottage" | "tastingRoom" | "mediumCellar" | "largeCellar";

export interface StructureData {
    name: string;
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
        cost: 2
    },
    irrigation: {
        name: "Irrigation",
        cost: 3
    },
    yoke: {
        name: "Yoke",
        cost: 2
    },
    windmill: {
        name: "Windmill",
        cost: 5
    },
    cottage: {
        name: "Cottage",
        cost: 4
    },
    tastingRoom: {
        name: "Tasting Room",
        cost: 6
    },
    mediumCellar: {
        name: "Medium Cellar",
        cost: 4
    },
    largeCellar: {
        name: "Large Cellar",
        cost: 6,
    }
};

export const maxStructureCost = Object.values(structures).reduce((max, structure) => {
    if (structure.cost > max) {
        return structure.cost;
    }
    return max;
}, 0);

export const structureAbbreviations: Record<StructureId, string> = {
    trellis: 'Tr',
    irrigation: 'Irr',
    yoke: 'Yo',
    windmill: 'Wi',
    cottage: 'Co',
    tastingRoom: 'Ta',
    mediumCellar: '',
    largeCellar: ''
};
