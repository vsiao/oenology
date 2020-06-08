import { Action } from "redux";

export type WorkerPlacement =
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
export const placeWorker = (placement: WorkerPlacement): PlaceWorkerAction => {
    return { type: "PLACE_WORKER", placement };
};
