import { WinterVisitorId } from "./winterVisitorCards";

export default interface GameState {
    players: Record<string, PlayerState>;
}

export type PlayerColor = "blue" | "green" | "orange" | "yellow" | "purple" | "red";
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
        vine: unknown[];
        summerVisitor: unknown[];
        order: unknown[];
        winterVisitor: WinterVisitorId[];
    },
    crushPad: Record<"red" | "white", TokenMap>;
    cellar: Record<"red" | "white" | "rose" | "sparkling", TokenMap>;
}
