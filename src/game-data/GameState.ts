import { WinterVisitorId } from "./winterVisitorCards";
import { SummerVisitorId } from "./summerVisitorCards";
import { VineId } from "./vineCards";

export default interface GameState {
    players: Record<string, PlayerState>;
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
