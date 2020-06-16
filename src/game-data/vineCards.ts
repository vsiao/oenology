import { GrapeColor } from "./GameState";
import { StructureId } from "./structures";

export type VineId = keyof typeof vineCards;

type VineYields = {
    [K in GrapeColor]?: number;
};
export interface VineCardData {
    name: string;
    structures: Array<string>,
    yields: VineYields;
}

const vineCard = (name: string, structures: StructureId[], yields: VineYields): VineCardData => {
    return { name, structures, yields };
};

const vineData = {
    cabernetSauvignon: vineCard("Cabernet Sauvignon", ["trellis", "irrigation"], { red: 4 }),
    merlot: vineCard("Merlot", ["irrigation"], { red: 3 }),
    syrah: vineCard("Syrah", ["trellis"], { red: 2 }),
    sangiovese: vineCard("Sangiovese", [], { red: 1 }),
    pinot: vineCard("Pinot", ["trellis"], { red: 1, white: 1 }),
    malvasia: vineCard("Malvasia", [], { white: 1 }),
    trebbiano: vineCard("Trebbiano", ["trellis"], { white: 2 }),
    sauvignonBlanc: vineCard("Sauvignon Blanc", ["irrigation"], { white: 3 }),
    chardonnay: vineCard("Chardonnay", ["trellis", "irrigation"], { white: 4 }),
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
