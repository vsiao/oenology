import { AppAction } from "./appActions";
import { AppState } from "./AppState";
import { game } from "../game-data/gameReducers";
import { isGameAction } from "../game-data/gameActions";
import { allPlacements } from "../game-data/board/boardPlacements";
import GameState, { PlayerState } from "../game-data/GameState";

export const appReducer = (state: AppState | undefined, action: AppAction): AppState => {
    if (state === undefined) {
        return {
            room: { gameId: null, users: {} },
            userId: null,
            game: null,
        };
    }
    if (isGameAction(action)) {
        if (!action._key) {
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

            // Firebase drops null values and empty arrays, so we have to
            // fill them back in when we hydrate
            return {
                ...state,
                game: {
                    ...gameState,
                    wakeUpOrder: new Array(7).fill(null).map((_, i) =>
                        gameState.wakeUpOrder[i] || null
                    ) as GameState["wakeUpOrder"],
                    workerPlacements: Object.fromEntries(
                        allPlacements.map(({ type }) =>
                            [type, gameState.workerPlacements?.[type] ?? []]
                        )
                    ) as GameState["workerPlacements"],
                    players: Object.fromEntries(
                        Object.entries(gameState.players).map(([playerId, p]) =>
                            [playerId, {
                                ...p,
                                cardsInHand: p.cardsInHand || [],
                                fields: Object.fromEntries(
                                    Object.entries(p.fields).map(([fieldId, f]) =>
                                        [fieldId, {
                                            ...f,
                                            vines: f.vines || []
                                        }]
                                    )
                                ) as PlayerState["fields"],
                            }]
                        )
                    ),
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
