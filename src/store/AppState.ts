import GameState from "../game-data/GameState";

export interface AppState {
    userId: string | null;
    room: RoomState;
    game: GameState;
}

interface RoomState {
    gameId: string | null;
    status?: string;
    users: Record<string, User>;
}

export interface User {
    id: string;
    name: string;
    status: "connected" | "disconnected";
}
