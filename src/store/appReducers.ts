import { AppAction } from "./appActions";
import { AppState } from "./AppState";
import { game, initGame } from "../game-data/gameReducers";

export const appReducer = (state: AppState | undefined, action: AppAction): AppState => {
    if (state === undefined) {
        return {
            playerId: null,
            game: initGame(),
        };
    }
    if (action.localOnly) {
        return local(state, action);
    }
    if (!action.published) {
        // Wait for action to be published to firebase before applying
        return state;
    }
    switch (action.type) {
        case "START_GAME":
            return {
                ...state,
                game: initGame(state.playerId, action.shuffledCards)
            };
    }
    return {
        ...state,
        game: game(state.game, action),
    };
};

export const local = (state: AppState, action: AppAction) => {
    switch (action.type) {
        case "SET_PLAYER_ID":
            return {
                ...state,
                playerId: action.playerId,
                game: {
                    ...state.game,
                    playerId: action.playerId,
                },
            };
        default:
            return state;
    }
};
