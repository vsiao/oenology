import { AppAction } from "./appActions";
import { AppState } from "./AppState";
import { game } from "../game-data/gameReducers";
import { isGameAction } from "../game-data/gameActions";

export const appReducer = (state: AppState | undefined, action: AppAction): AppState => {
    if (state === undefined) {
        return {
            room: { gameId: null, users: {} },
            userId: null,
            game: null,
        };
    }
    if (isGameAction(action)) {
        if (!action.published) {
            // Wait for action to be published to server before applying
            return state;
        }
        return {
            ...state,
            game: game(state.game!, action, state.userId!),
        };
    }
    switch (action.type) {
        case "SET_CURRENT_USER_ID":
            return {
                ...state,
                userId: action.userId,
            };
        case "SET_CURRENT_USER_NAME": {
            const user = state.room.users[state.userId!];
            return {
                ...state,
                room: {
                    ...state.room,
                    users: {
                        ...state.room.users,
                        [user.id]: {
                            ...user,
                            name: action.name,
                        },
                    },
                },
            };
        }
        case "JOIN_GAME":
            return {
                ...state,
                room: {
                    gameId: action.gameId,
                    users: {}
                },
            };
        case "GAME_STATUS":
            return {
                ...state,
                room: {
                    ...state.room!,
                    status: action.status,
                },
            };
        case "UPDATE_USER":
            const user = action.user;
            return {
                ...state,
                room: {
                    ...state.room!,
                    users: {
                        ...state.room!.users,
                        [user.id]: user,
                    },
                },
            };
        default:
            return state;
    }
};
