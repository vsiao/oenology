import { SummerVisitorId, VisitorId, WinterVisitorId } from "./visitors/visitorCards";
import { PromptState } from "./prompts/PromptState";
import { VineId } from "./vineCards";
import { OrderId } from "./orderCards";
import { StructureId } from "./structures";
import { ActivityLog } from "./ActivityLog";
import { MamaId, PapaId } from "./mamasAndPapas";

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
    | { type: "mamaPapa"; playerId: string; }
    | { type: "wakeUpOrder"; playerId: string; }
    | WorkerPlacementTurn
    | { type: "fallVisitor"; playerId: string; }
    | { type: "endOfYearDiscard"; playerId: string; };

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
    canPlayAdditionalVisitor: boolean;
    visitorId?: VisitorId;
}
export type WorkerPlacementTurnPendingAction =
    | PlayVisitorPendingAction
    | { type: "buySell"; }
    | { type: "sellGrapes"; }
    | { type: "buyField"; }
    | { type: "sellField"; }
    | { type: "plantVine"; vineId?: VineId; bonusActivated?: true; }
    | { type: "buildStructure"; } // choose structure
    | { type: "harvestField"; bonusActivated?: true; } // choose field
    | { type: "uproot"; }
    | { type: "makeWine"; } // choose grape
    | { type: "fillOrder"; orderId?: OrderId; }; // choose order card

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
    | "yokeHarvest"
    | "yokeUproot";

export type CardType = "vine" | "summerVisitor" | "order" | "winterVisitor";
export type GrapeColor = "red" | "white";
export type PlayerColor = "blue" | "green" | "orange" | "yellow" | "purple" | "red";
export type TokenMap = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
export type WineColor = "red" | "white" | "blush" | "sparkling";
export enum StructureState {
    Unbuilt,
    Built,
    Used
}

export interface PlayerState {
    id: string;
    name: string;
    color: PlayerColor;
    coins: number;
    residuals: number;
    victoryPoints: number;
    workers: Worker[];
    cardsInHand: CardId[];
    fields: Record<FieldId, Field>;
    crushPad: Record<GrapeColor, TokenMap>;
    cellar: Record<WineColor, TokenMap>;
    structures: Record<StructureId, StructureState>;
    mama: MamaId;
    papa: PapaId;
}

export type WorkerType = "grande" | "normal";
export interface Worker {
    type: WorkerType;
    available: boolean;
    isTemp?: boolean;
}
export interface BoardWorker {
    type: WorkerType,
    playerId: string,
    color: PlayerColor;
    isTemp?: boolean;
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
    harvested: boolean;
}
