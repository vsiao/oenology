import { SummerVisitorId, VisitorId, WinterVisitorId } from "./visitors/visitorCards";
import { PromptState } from "./prompts/PromptState";
import { VineId } from "./vineCards";
import { OrderId } from "./orderCards";
import { StructureId } from "./structures";
import { WorkerPlacement } from "./board/boardActions";
import { ActivityLog } from "./ActivityLog";

export default interface GameState {
    // shared state
    currentTurn: CurrentTurn;
    players: Record<string, PlayerState>;
    tableOrder: string[];
    grapeIndex: number; // index into tableOrder. picks wakeUpOrder first this year.
    wakeUpOrder: [
        WakeUpPosition | null, // -
        WakeUpPosition | null, // vine
        WakeUpPosition | null, // order
        WakeUpPosition | null, // coin
        WakeUpPosition | null, // visitor
        WakeUpPosition | null, // victory point
        WakeUpPosition | null, // temp worker
    ];
    drawPiles: CardsByType;
    discardPiles: CardsByType;
    workerPlacements: Record<WorkerPlacement, BoardWorker[]>;
    activityLog: ActivityLog;

    // local state
    playerId: string | null;
    actionPrompts: PromptState[];
}

export interface WakeUpPosition {
    playerId: string;
    passed?: true;
}

export type CurrentTurn =
    | { type: "papaSetUp"; playerId: string; }
    | { type: "wakeUpOrder"; playerId: string; }
    | WorkerPlacementTurn
    | { type: "fallVisitor"; playerId: string; };

export interface WorkerPlacementTurn {
    type: "workerPlacement";
    playerId: string;
    season: "summer" | "winter";

    // Non-null if the player has chosen to play a worker in a position
    // but is pending further action before completing their turn
    // (eg. needs to pick a visitor card to play).
    pendingAction: WorkerPlacementTurnPendingAction | null;
}

export interface PlayVisitorPendingAction {
    type: "playVisitor";
    visitorId?: VisitorId;
}
export type WorkerPlacementTurnPendingAction =
    | PlayVisitorPendingAction
    | { type: "buySell"; }
    | { type: "sellGrapes"; }
    | { type: "buyField"; }
    | { type: "sellField"; }
    | { type: "plantVine"; vineId?: VineId; }
    | { type: "buildStructure"; } // choose structure
    | { type: "harvestField"; } // choose field
    | { type: "makeWine"; } // choose grape
    | { type: "fillOrder"; }; // choose order card

export type CardType = "vine" | "summerVisitor" | "order" | "winterVisitor";
export type GrapeColor = "red" | "white";
export type PlayerColor = "blue" | "green" | "orange" | "yellow" | "purple" | "red";
export type TokenMap = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
export type WineColor = "red" | "white" | "blush" | "sparkling";

export interface PlayerState {
    id: string;
    color: PlayerColor;
    coins: number;
    residuals: number;
    victoryPoints: number;
    trainedWorkers: TrainedWorker[],
    cardsInHand: CardId[];
    fields: Record<FieldId, Field>;
    crushPad: Record<"red" | "white", TokenMap>;
    cellar: Record<"red" | "white" | "blush" | "sparkling", TokenMap>;
    structures: Record<StructureId, boolean>;
}

export type WorkerType = "grande" | "normal";
export interface TrainedWorker {
    type: WorkerType;
    available: boolean;
}
export interface BoardWorker {
    type: WorkerType,
    playerId: string,
    color: PlayerColor;
}

export type CardId =
    | { type: "order"; id: OrderId; }
    | { type: "vine"; id: VineId; }
    | { type: "visitor"; id: VisitorId; };

export interface CardsByType {
    vine: VineId[];
    summerVisitor: SummerVisitorId[];
    order: OrderId[];
    winterVisitor: WinterVisitorId[];
}

export type FieldId = "field5" | "field6" | "field7";
export interface Field {
    id: FieldId;
    value: number;
    vines: VineId[];
    sold: boolean;
}
