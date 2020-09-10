import { BoardType } from "../GameState";

export type InfluenceRegion =
    | "arezzo"
    | "firenze"
    | "grosseto"
    | "livorno"
    | "lucca"
    | "pisa"
    | "siena";

export type InfluencePlacementBonus =
    | "gain1"
    | "gain2"
    | "drawOrder"
    | "drawStructure"
    | "drawSummerVisitor"
    | "drawVine"
    | "drawWinterVisitor"

export interface InfluenceData {
    id: InfluenceRegion
    name: string;
    vp: number;
    bonus: InfluencePlacementBonus;
}

const makeRegion = (id: InfluenceRegion, vp: number, bonus: InfluencePlacementBonus): InfluenceData => {
    const name = id.charAt(0).toUpperCase() + id.substr(1);
    return { id, name, vp, bonus };
};

export const allRegions: Record<InfluenceRegion, InfluenceData> = {
    arezzo: makeRegion("arezzo", 2, "drawOrder"),
    firenze: makeRegion("firenze", 2, "drawWinterVisitor"),
    grosseto: makeRegion("grosseto", 1, "drawVine"),
    livorno: makeRegion("livorno", 2, "drawSummerVisitor"),
    lucca: makeRegion("lucca", 1, "drawStructure"),
    pisa: makeRegion("pisa", 1, "gain2"),
    siena: makeRegion("siena", 2, "gain1"),
};

export const influenceRegions = (boardType: BoardType): InfluenceData[] => {
    if (boardType === "base") {
        return [];
    }
    const regionNames: InfluenceRegion[] = boardType === "tuscanyA"
        ? ["arezzo", "firenze", "grosseto", "livorno", "pisa", "siena"]
        : ["arezzo", "firenze", "grosseto", "livorno", "lucca", "pisa", "siena"];
    return regionNames.map(r => allRegions[r]);
};
