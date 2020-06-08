import { Action } from "redux";

type WorkerPlacement =
    | "drawVine"
    | "giveTour"
    | "buildStructure"
    | "playSummerVisitor"
    | "buySell"
    | "plantVine"
    | "drawOrder"
    | "harvestField"
    | "trainWorker"
    | "playWinterVisitor"
    | "makeWine"
    | "fillOrder"
    | "gainCoin"
    | "yoke";

export interface PlaceWorkerAction extends Action<"PLACE_WORKER"> {
    placement: WorkerPlacement;
}
export const placeWorker = (placement: WorkerPlacement) => {
    return { type: "PLACE_WORKER", placement };
};
