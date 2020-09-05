import { Season, BoardType } from "../GameState";

export type WakeUpBonus =
    | "nothing"
    | "gainCoin"
    | "drawVine"
    | "drawOrder"
    | "drawSummerVisitor"
    | "drawWinterVisitor"
    | "drawVisitor"
    | "gainVP"
    | "tempWorker"
    | "drawCard"
    | "drawStructure"
    | "influence"
    | "ageGrapes"
    | "firstPlayer";

export const wakeUpBonuses = (boardType: BoardType): Record<Season, WakeUpBonus[]> => {
    switch (boardType) {
        case "base":
            return {
                spring: ["nothing", "drawVine", "drawOrder", "gainCoin", "drawVisitor", "gainVP", "tempWorker"],
                summer: [],
                fall: [],
                winter: [],
            };
        case "tuscanyA":
        case "tuscanyB":
            return {
                spring: ["nothing", "nothing", "nothing", "nothing", "nothing", "nothing", "nothing"],
                summer: ["nothing", "gainCoin", "drawVine", "drawOrder", "drawVisitor", "gainVP", "tempWorker"],
                fall: ["nothing", "nothing", "drawSummerVisitor", "drawSummerVisitor", "drawWinterVisitor", "drawWinterVisitor", "drawCard"],
                winter: ["nothing", "nothing", "nothing", boardType === "tuscanyB" ? "drawStructure" : "nothing", "influence", "ageGrapes", "firstPlayer"],
            };
    }
};
