import { VineId, VineYields } from "./vineCards";
import { WineSpec, OrderId } from "./orderCards";
import { StructureId } from "./structures";
import { VisitorId } from "./visitors/visitorCards";
import { CardType } from "./GameState";
import { GrapeSpec } from "./prompts/promptActions";

export type ActivityLog = ActivityLogEvent[];

export type ActivityLogEvent =
    | BuildEvent
    | BuySellFieldEvent
    | CoinsEvent
    | DestroyEvent
    | DiscardEvent
    | DiscardGrapesEvent
    | DrawEvent
    | FillEvent
    | GainWineEvent
    | HarvestEvent
    | MakeWineEvent
    | PassEvent
    | PlaceWorkerEvent
    | PlantEvent
    | ResidualsEvent
    | SeasonEvent
    | SellGrapeEvent
    | TrainWorkerEvent
    | UprootEvent
    | VisitorEvent
    | VPChangeEvent;

interface LogEvent<T extends string> {
    type: T;
    playerId: string;
}

interface BuildEvent extends LogEvent<"build"> {
    structureId: StructureId;
}
interface BuySellFieldEvent extends LogEvent<"buySellField"> {
    buy: boolean;
}
interface CoinsEvent extends LogEvent<"coins"> {
    delta: number;
}

interface DestroyEvent extends LogEvent<"destroy"> {
    structureId: StructureId;
}
interface DiscardEvent extends LogEvent<"discard"> {
    cards: CardType[];
}
interface DiscardGrapesEvent extends LogEvent<"discardGrapes"> {
    grapes: GrapeSpec[];
}
interface DrawEvent extends LogEvent<"draw"> {
    cards: CardType[];
}
interface FillEvent extends LogEvent<"fill"> {
    orderId: OrderId;

    /** @deprecated in favor of `orderId`. TODO: migrate to add ##FillEventOrderId */
    wines?: WineSpec[];
}
interface GainWineEvent extends LogEvent<"gainWine"> {
    wine: WineSpec;
}
interface PlantEvent extends LogEvent<"plant"> {
    vineId: VineId;
}
interface VisitorEvent extends LogEvent<"visitor"> {
    visitorId: VisitorId;
}
interface HarvestEvent extends LogEvent<"harvest"> {
    yields: VineYields;
}
interface MakeWineEvent extends LogEvent<"makeWine"> {
    wines: WineSpec[];
}
interface PassEvent extends LogEvent<"pass"> { }
interface PlaceWorkerEvent extends LogEvent<"placeWorker"> { }
interface ResidualsEvent extends LogEvent<"residuals"> {
    delta: number;
}
interface SeasonEvent {
    type: "season";
    season: string;
}
/** @deprecated in favor of DiscardGrapesEvent */
interface SellGrapeEvent extends LogEvent<"sellGrapes"> {
    grapes: GrapeSpec[];
}
interface TrainWorkerEvent extends LogEvent<"trainWorker"> { }
interface UprootEvent extends LogEvent<"uproot"> {
    vineId: VineId;
}
export type VPSource = "bonus" | "fill" | "influence" | "structure" | "trade" | "visitor";
interface VPChangeEvent extends LogEvent<"vp"> {
    delta: number;
    source: VPSource;
}
