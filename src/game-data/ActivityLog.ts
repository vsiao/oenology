import { VineId, VineYields } from "./vineCards";
import { WineSpec } from "./orderCards";
import { StructureId } from "./structures";

export type ActivityLog = ActivityLogEvent[];

export type ActivityLogEvent =
    | BuildEvent
    | HarvestEvent
    | MakeWineEvent
    | PassEvent
    | PlantEvent
    | VPChangeEvent;

interface LogEvent<T extends string> {
    type: T;
    playerId: string;
}

interface BuildEvent extends LogEvent<"build"> {
    structureId: StructureId;
}
interface PlantEvent extends LogEvent<"plant"> {
    vineId: VineId;
}
interface HarvestEvent extends LogEvent<"harvest"> {
    yields: VineYields;
}
interface PassEvent extends LogEvent<"pass"> { }
interface MakeWineEvent extends LogEvent<"makeWine"> {
    wines: WineSpec[];
}
interface VPChangeEvent extends LogEvent<"vp"> {
    delta: number;
}
