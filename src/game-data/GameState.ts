import { WinterVisitorId } from "./visitors/winter/winterVisitorCards";
import { SummerVisitorId } from "./visitors/summer/summerVisitorCards";
import { VineId } from "./vineCards";
import { PromptState } from "./prompts/PromptState";

export default interface GameState {
    currentTurn: CurrentTurn;
    players: Record<string, PlayerState>;
    actionPrompt: PromptState;
}

export type CurrentTurn =
    | { type: "papaSetUp"; playerId: string; }
    | { type: "wakeUpOrder"; playerId: string; }
    | WorkerPlacementTurn
    | { type: "fallVisitor"; playerId: string; };


export interface WorkerPlacementTurn {
    type: "workerPlacement";
    playerId: string;

    // Non-null if the player has chosen to play a worker in a position
    // but is pending further action before completing their turn
    // (eg. needs to pick a visitor card to play).
    pendingAction:
        | null
        | { type: "playSummerVisitor"; visitorId?: SummerVisitorId; } // choose sv card, then ...
        | { type: "buySell" } // sell grape OR sell field OR buy field, then choose grape or choose field
        | { type: "plant" } // choose vine card
        | { type: "build" } // choose structure
        | PlayWinterVisitor
        | { type: "harvest" } // choose field
        | { type: "makeWine" } // choose grape
        | { type: "fillOrder" }; // choose order card
}

export interface PlayWinterVisitor {
    type: "playWinterVisitor";
    visitorId?: WinterVisitorId;
}

export type CardType = "vine" | "summerVisitor" | "order" | "winterVisitor";
export type GrapeColor = "red" | "white";
export type PlayerColor = "blue" | "green" | "orange" | "yellow" | "purple" | "red";
export type Structure = "trellis" | "irrigation" | "yoke" | "windmill" | "cottage" | "tastingRoom";
export type TokenMap = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export interface PlayerState {
    id: string;
    color: PlayerColor;
    coins: number;
    victoryPoints: number;
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
