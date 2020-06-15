import { Action } from "redux";
import { WorkerType } from "../GameState";

export type BoardAction =
    | PlaceWorkerAction
    | PassAction;

interface PassAction extends Action<"PASS"> { }
export const pass = (): PassAction => {
    return { type: "PASS" };
};

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

interface PlaceWorkerAction extends Action<"PLACE_WORKER"> {
    placement: WorkerPlacement;
    workerType: WorkerType;
}
export const placeWorker = (placement: WorkerPlacement, workerType: WorkerType): PlaceWorkerAction => {
    return { type: "PLACE_WORKER", placement, workerType };
};
