import GameState from "../game-data/GameState";

export interface AppState {
    userId: string | null;
    room: RoomState;
    game: GameState | null;
}

interface RoomState {
    gameId: string | null;
    status?: string | null;
    users: Record<string, User>;
}

export interface User {
    id: string;
    name: string;
    status: "connected" | "disconnected";
}
