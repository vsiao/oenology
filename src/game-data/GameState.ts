export default interface GameState {
    players: Record<string, PlayerState>;
}

export type PlayerColor = "blue" | "green" | "orange" | "yellow" | "purple" | "red";
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
    crushPad: {
        red: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
        white: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
    };
    cellar: {
        red: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
        white: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
        rose: [boolean, boolean, boolean, boolean, boolean, boolean];
        sparkling: [boolean, boolean, boolean];
    };
}
