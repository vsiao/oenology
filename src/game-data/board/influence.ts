import { BoardType } from "../GameState";

export type InfluenceRegion =
    | "arezzo"
    | "firenze"
    | "grosseto"
    | "livorno"
    | "lucca"
    | "pisa"
    | "siena";

type PlacementBonus =
    | "gain1"
    | "gain2"
    | "drawOrder"
    | "drawStructure"
    | "drawSummerVisitor"
    | "drawVine"
    | "drawWinterVisitor"

export interface InfluenceData {
    name: InfluenceRegion;
    vp: number;
    bonus: PlacementBonus;
}

const regionData: Record<InfluenceRegion, InfluenceData> = {
    arezzo: {
        name: "arezzo",
        vp: 2,
        bonus: "drawOrder",
    },
    firenze: {
        name: "firenze",
        vp: 2,
        bonus: "drawWinterVisitor",
    },
    grosseto: {
        name: "grosseto",
        vp: 1,
        bonus: "drawVine",
    },
    livorno: {
        name: "livorno",
        vp: 2,
        bonus: "drawSummerVisitor",
    },
    lucca: {
        name: "lucca",
        vp: 1,
        bonus: "drawStructure",
    },
    pisa: {
        name: "pisa",
        vp: 1,
        bonus: "gain2",
    },
    siena: {
        name: "siena",
        vp: 2,
        bonus: "gain1",
    },
};

export const influenceRegions = (boardType: BoardType): InfluenceData[] => {
    if (boardType === "base") {
        return [];
    }
    const regionNames: InfluenceRegion[] = boardType === "tuscanyA"
        ? ["arezzo", "firenze", "grosseto", "livorno", "pisa", "siena"]
        : ["arezzo", "firenze", "grosseto", "livorno", "lucca", "pisa", "siena"];
    return regionNames.map(r => regionData[r]);
};
