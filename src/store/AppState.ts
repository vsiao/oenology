import GameState from "../game-data/GameState";

export interface AppState {
    userId: string | null;
    room: RoomState;
    game: GameState | null;
}

export type GameStatus = "inProgress" | "completed";

export interface GameOptions {
    multiInheritance?: boolean;
    rhineVisitors?: boolean;
}

interface RoomState {
    gameId: string | null;
    gameOptions?: GameOptions;
    gameStartedAt?: string;
    gameStatus?: GameStatus | null;
    users: Record<string, User>;
}

export interface User {
    id: string;
    name: string;
    status: "connected" | "disconnected";
    connectedAt: number;
}
