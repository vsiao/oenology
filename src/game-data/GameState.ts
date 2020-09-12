import { InfluenceRegion } from "./board/influence";
import { SummerVisitorId, VisitorId, WinterVisitorId } from "./visitors/visitorCards";
import { PromptState } from "./prompts/PromptState";
import { VineId } from "./vineCards";
import { OrderId } from "./orderCards";
import { StructureId } from "./structures";
import { ActivityLog } from "./ActivityLog";
import { MamaId, PapaId } from "./mamasAndPapas";

export type BoardType = "base" | "tuscanyA" | "tuscanyB";
export type Season = "spring" | "summer" | "fall" | "winter";
export default interface GameState {
    // shared state
    year: number;
    season: Season;
    currentTurn: CurrentTurn;
    players: Record<string, PlayerState>;
    tableOrder: string[];
    grapeIndex: number | null; // index into tableOrder. picks wakeUpOrder first this year.
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
    boardType?: BoardType;
    workerPlacements: Record<WorkerPlacement, (BoardWorker | null)[]>;
    activityLog: ActivityLog;

    undoState:
        | {
            type: "undoable",
            // Contains a copy of the game state prior to the most recent action.
            prevState: GameState

            // `true` if the last action was by the current controlling player
            // within the context of the current turn. Ending a turn causes this
            // to flip to `false` (though `prevState` will still exist to allow
            // the next turn's player to undo, if necessary)
            isLastActionByCurrentTurnPlayer: boolean;
        }
        // If a card was drawn, don't allow undoing since information was revealed
        | { type: "drawnCard" }
        // Nothing to undo, usually indicating game beginning or game end
        | null;

    // Published key of the most-recently received action.
    // Used as a PRNG seed for on-demand shuffling.
    lastActionKey?: string;

    // Published key of the most-recently applied PlaceWorkerAction,
    // mostly for debugging purposes.
    lastPlaceWorkerActionKey?: string;

    // local state
    playerId: string | null;
    actionPrompts: PromptState[];
}

export interface WakeUpPosition {
    playerId: string;
    season: Season | "endOfYear";

    // If set, a player has chosen this wake-up position
    // for the next year (applicable to Tuscany board)
    nextYearPlayerId?: string;
    // If set, don't display playerId's rooster at this position.
    hasChosenNextYear?: boolean;
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

    // Used to enact actions for workers placed in future seasons
    // by the Planner and Administrator visitors.
    isPlannerTurn?: boolean;

    // Non-null if the player has chosen to play a worker in a position
    // but is pending further action before completing their turn
    // (eg. needs to pick a visitor card to play).
    pendingAction?: WorkerPlacementTurnPendingAction;

    // The Manager visitor allows an action from a prior season.
    // While resolving the prior-season action, the Manager's
    // pendingAction will be stored here.
    managerPendingAction?: PlayVisitorPendingAction;
}

export interface PlayVisitorPendingAction {
    type: "playVisitor";
    visitorId?: VisitorId;

    // If the visitor allows planting or filling an order
    vineId?: VineId;
    orderId?: OrderId;

    // Indicates the player currently taking an action, for visitors
    // which require opponents to take action
    actionPlayerId?: string;
    lastActionPlayerId?: string;

    // Keeps track of the choices already taken for the current visitor
    usedChoices?: { [choice: string]: boolean };

    // Can play an additional visitor due to placement bonus
    hasBonus: boolean;

    // Indicates which worker was used to play this visitor.
    // `undefined` means the visitor action was taken without a worker,
    // eg. using the Manager visitor to play a summer visitor.
    placementIdx?: number;
}

export type InfluencePendingAction = {
    type: "influence";
    nextAction?: "sellWine";
    hasBonus?: boolean;
};

export type WorkerPlacementTurnPendingAction = (
    | PlayVisitorPendingAction
    | { type: "buildOrGiveTour"; }
    | { type: "buildStructure"; }
    | { type: "buySell"; }
    | { type: "buyField"; }
    | { type: "fillOrder"; orderId?: OrderId; }
    | { type: "harvestField"; }
    | InfluencePendingAction
    | { type: "makeWine"; }
    | { type: "passToNextSeason"; nextSeason: Season | "endOfYear"; }
    | { type: "plantVine"; vineId?: VineId; }
    | { type: "sellField"; }
    | { type: "sellGrapes"; }
    | { type: "sellWine"; }
    | { type: "trade"; }
    | { type: "uproot"; }
) & { hasBonus: boolean };

export type WorkerPlacement =
    | "buildOrGiveTour"
    | "buildStructure"
    | "buySell"
    | "drawOrder"
    | "drawVine"
    | "fillOrder"
    | "gainCoin"
    | "giveTour"
    | "influence"
    | "plantVine"
    | "playSummerVisitor"
    | "playWinterVisitor"
    | "harvestField"
    | "makeWine"
    | "sellWine"
    | "trade"
    | "trainWorker"
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
    influence: InfluenceToken[];
    mamas: MamaId[];
    papas: PapaId[];
}

export type WorkerType = "grande" | "normal";
export interface Worker {
    type: WorkerType;
    id: number;
    available: boolean;
    isTemp?: boolean;
}
export interface BoardWorker {
    type: WorkerType,
    id: number;
    playerId: string,
    color: PlayerColor;
    isTemp: boolean;
    source: "Planner" | "Administrator" | null;
}

export interface InfluenceToken {
    id: string;
    placement?: InfluenceRegion;
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
