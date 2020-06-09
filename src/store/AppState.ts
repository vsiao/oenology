import GameState from "../game-data/GameState";

export interface AppState {
    playerId: string | null;
    game: GameState;
}
