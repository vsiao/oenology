import { AppAction } from "./appActions";
import { AppState } from "./AppState";
import { GameAction } from "../game-data/gameActions";
import { game } from "../game-data/gameReducers";

export const appReducer = (state: AppState | undefined, action: AppAction): AppState => {
    if (state === undefined) {
        return {
            playerId: null,
            game: game(undefined, action as GameAction),
        };
    }
    if (action.localOnly) {
        return local(state, action);
    }
    if (!action.published) {
        // Wait for action to be published to firebase before applying
        return state;
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
            };
        default:
            return state;
    }
};
