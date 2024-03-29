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
        case "SET_GAME_OPTION":
            return {
                ...state,
                room: {
                    ...state.room,
                    gameOptions: {
                        ...state.room.gameOptions,
                        [action.option]: action.value,
                    },
                },
            };
        case "JOIN_GAME":
            return {
                ...state,
                room: {
                    gameId: action.gameId,
                    users: {}
                },
            };
        case "GAME_OPTIONS":
            return {
                ...state,
                room: {
                    ...state.room,
                    gameOptions: action.options,
                },
            };
        case "GAME_STATUS":
            return {
                ...state,
                room: {
                    ...state.room!,
                    gameStatus: action.status,
                },
            };
        case "HYDRATE_GAME":
            const gameState = action.state;
            return {
                ...state,
                game: {
                    ...gameState,
                    playerId: gameState.tableOrder.some(id => id === state.userId)
                        ? state.userId
                        : null,
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
