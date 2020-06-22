import { VineId, VineYields } from "./vineCards";
import { WineSpec } from "./orderCards";
import { StructureId } from "./structures";
import { VisitorId } from "./visitors/visitorCards";
import { CardType } from "./GameState";

export type ActivityLog = ActivityLogEvent[];

export type ActivityLogEvent =
    | BuildEvent
    | BuySellFieldEvent
    | CoinsEvent
    | DrawEvent
    | FillEvent
    | HarvestEvent
    | MakeWineEvent
    | PassEvent
    | PlantEvent
    | ResidualsEvent
    | SeasonEvent
    | TrainWorkerEvent
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
interface DrawEvent extends LogEvent<"draw"> {
    cards: CardType[];
}
interface FillEvent extends LogEvent<"fill"> {
    wines: WineSpec[];
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
interface ResidualsEvent extends LogEvent<"residuals"> {
    delta: number;
}
interface SeasonEvent {
    type: "season";
    season: string;
}
interface TrainWorkerEvent extends LogEvent<"trainWorker"> { }
interface VPChangeEvent extends LogEvent<"vp"> {
    delta: number;
}
