import { GrapeColor } from "./GameState";

export type VineId = keyof typeof vineCards;

export interface VineCardData {
    name: string;
    structures: Array<string>,
    yields: { [K in GrapeColor]?: number; };
}

const vineData = {
    cabernetSauvignon: {
        name: "Cabernet Sauvignon",
        structures: ["trellis", "irrigation"],
        yields: {
            red: 4
        },
    },
    merlot: {
        name: "Merlot",
        structures: ["irrigation"],
        yields: {
            red: 3
        },
    },
    syrah: {
        name: "Syrah",
        structures: ["trellis"],
        yields: {
            red: 2
        },
    },
    sangiovese: {
        name: "Sangiovese",
        structures: [],
        yields: {
            red: 1
        },
    },
    pinot: {
        name: "Pinot",
        structures: ["trellis"],
        yields: {
            red: 1,
            white: 1
        },
    },
    malvasia: {
        name: "Malvasia",
        structures: [],
        yields: {
            white: 1
        },
    },
    trebbiano: {
        name: "Trebbiano",
        structures: ["trellis"],
        yields: {
            white: 2
        },
    },
    sauvignonBlanc: {
        name: "Sauvignon Blanc",
        structures: ["irrigation"],
        yields: {
            white: 3
        },
    },
    chardonnay: {
        name: "Chardonnay",
        structures: ["trellis", "irrigation"],
        yields: {
            white: 4
        },
    },
};

export const vineCards = {
    cab1: vineData.cabernetSauvignon,
    cab2: vineData.cabernetSauvignon,
    cab3: vineData.cabernetSauvignon,
    cab4: vineData.cabernetSauvignon,
    mer1: vineData.merlot,
    mer2: vineData.merlot,
    mer3: vineData.merlot,
    mer4: vineData.merlot,
    mer5: vineData.merlot,
    syr1: vineData.syrah,
    syr2: vineData.syrah,
    syr3: vineData.syrah,
    syr4: vineData.syrah,
    syr5: vineData.syrah,
    san1: vineData.sangiovese,
    san2: vineData.sangiovese,
    san3: vineData.sangiovese,
    san4: vineData.sangiovese,
    pin1: vineData.pinot,
    pin2: vineData.pinot,
    pin3: vineData.pinot,
    pin4: vineData.pinot,
    pin5: vineData.pinot,
    pin6: vineData.pinot,
    mal1: vineData.malvasia,
    mal2: vineData.malvasia,
    mal3: vineData.malvasia,
    mal4: vineData.malvasia,
    tre1: vineData.trebbiano,
    tre2: vineData.trebbiano,
    tre3: vineData.trebbiano,
    tre4: vineData.trebbiano,
    tre5: vineData.trebbiano,
    sau1: vineData.sauvignonBlanc,
    sau2: vineData.sauvignonBlanc,
    sau3: vineData.sauvignonBlanc,
    sau4: vineData.sauvignonBlanc,
    sau5: vineData.sauvignonBlanc,
    cha1: vineData.chardonnay,
    cha2: vineData.chardonnay,
    cha3: vineData.chardonnay,
    cha4: vineData.chardonnay,
};
