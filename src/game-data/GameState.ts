import { WinterVisitorId } from "./winterVisitorCards";
import { SummerVisitorId } from "./summerVisitorCards";
import { VineId } from "./vineCards";

export default interface GameState {
    currentTurn: CurrentTurn;
    players: Record<string, PlayerState>;
}

export type CurrentTurn =
    | { type: "papaSetUp"; playerId: string; }
    | { type: "wakeUpOrder"; playerId: string; }
    | WorkerPlacementTurn
    | { type: "fallVisitor"; playerId: string; };


interface WorkerPlacementTurn {
    type: "workerPlacement";
    playerId: string;

    // Non-null if the player has chosen to play a worker in a position
    // but is pending further action before completing their turn
    // (eg. needs to pick a visitor card to play).
    pendingAction:
        | null
        | { type: "playSummerVisitor"; visitorId?: SummerVisitorId; }
        | { type: "buySell" }
        | { type: "plant" }
        | { type: "build" }
        | { type: "playWinterVisitor"; visitorId?: WinterVisitorId; }
        | { type: "harvest" }
        | { type: "makeWine" }
        | { type: "fillOrder" };
}

export type CardType = "vine" | "summerVisitor" | "order" | "winterVisitor";
export type GrapeColor = "red" | "white";
export type PlayerColor = "blue" | "green" | "orange" | "yellow" | "purple" | "red";
export type Structure = "trellis" | "irrigation" | "yoke" | "windmill" | "cottage" | "tastingRoom";
export type TokenMap = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export interface PlayerState {
    id: string;
    color: PlayerColor;
    availableWorkers: {
        grandeWorker?: true;
        worker1?: true;
        worker2?: true;
        worker3?: true;
        worker4?: true;
        worker5?: true;
    };
    cardsInHand: {
        vine: VineId[];
        summerVisitor: SummerVisitorId[];
        order: unknown[];
        winterVisitor: WinterVisitorId[];
    },
    crushPad: Record<"red" | "white", TokenMap>;
    cellar: Record<"red" | "white" | "rose" | "sparkling", TokenMap>;
}
