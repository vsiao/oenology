import "firebase/auth";
import "firebase/database";
import * as firebase from "firebase/app";
import { eventChannel } from "redux-saga";
import { take, put, call, fork, throttle, takeEvery } from "redux-saga/effects";
import { firebaseConfig } from "./config";
import { isGameAction, GameAction } from "../game-data/gameActions";
import { gameStatus, setUser, setCurrentUserId, SetCurrentUserNameAction, SetGameOptionAction, gameOptions } from "./appActions";
import GameState, { PlayerState, PlayerStats } from "../game-data/GameState";
import shortid from "shortid";
import { RoomState, User } from "./AppState";
import { allPlacements } from "../game-data/board/boardPlacements";

firebase.initializeApp(firebaseConfig);

function signInAnonymously() {
    return firebase.auth().signInAnonymously();
}

export function* signIn() {
    const userCredential = yield call(signInAnonymously);
    const userId = (userCredential as unknown as firebase.auth.UserCredential).user!.uid;
    yield put(setCurrentUserId(userId));
    return userId;
}

export function fetchRecentGames() {
    return new Promise<RoomState[]>(resolve => {
        firebase
            .database()
            .ref("rooms")
            .orderByChild("gameStartedAt")
            .limitToLast(50)
            .once("value", snap => {
                const rooms: RoomState[] = [];
                snap.forEach(child => {
                    const room = child.val();
                    rooms.push({
                        ...room,
                        key: child.key,
                        users: Object.fromEntries(
                            Object.entries(room.users as Record<string, User>)
                                .map(([id, u]) => [id, ({ ...u, id })])
                        ),
                    });
                });
                resolve(rooms.reverse());
            });
    });
}

export function fetchPlayersState(gameId: string) {
    return new Promise<Record<string, PlayerState>>(resolve => {
        firebase.database().ref(`gameStates/${gameId}/players`).once("value", snap => {
            resolve(hydratePlayers(snap.val() ?? {}));
        });
    })
}

export function getGameState(gameId: string) {
    return new Promise<GameState | null>(resolve => {
        firebase.database().ref(`gameStates/${gameId}`).once("value", snap => {
            const rawState = snap.val();
            if (!rawState) {
                return resolve(null);
            }

            // Firebase drops null values and empty arrays, so we have to
            // fill them back in here
            const gameState: GameState = {
                ...rawState,
                wakeUpOrder: new Array(7).fill(null).map((_, i) =>
                    rawState.wakeUpOrder[i] || null
                ) as GameState["wakeUpOrder"],
                workerPlacements: Object.fromEntries(
                    allPlacements.map(({ type }) =>
                        [type, rawState.workerPlacements?.[type] ?? []]
                    )
                ) as GameState["workerPlacements"],
                players: hydratePlayers(rawState.players),
            };
            resolve(gameState);
        });
    });
}

function hydratePlayers(rawPlayers: unknown): Record<string, PlayerState> {
    return Object.fromEntries(
        Object.entries(rawPlayers as Record<string, PlayerState>)
            .map(([playerId, p]) =>
                [playerId, {
                    ...p,
                    influence: p.influence ?? [],
                    cardsInHand: p.cardsInHand ?? [],
                    fields: Object.fromEntries(
                        Object.entries(p.fields).map(([fieldId, f]) =>
                            [fieldId, {
                                ...f,
                                vines: f.vines ?? []
                            }]
                        )
                    ) as PlayerState["fields"],
                }]
            )
    );
}

export function createRoom() {
    return new Promise<string>(resolve => {
        const ref = firebase.database().ref();
        ref.child(".info/serverTimeOffset").once("value", snap => {
            const nowMs = new Date().getTime() + snap.val();
            const roomId = shortid.generate();
            ref.child(`rooms/${roomId}/createdAt`)
                .set(new Date(nowMs).toJSON())
                .then(() => resolve(roomId));
        });
    });
}

function publishUserName(gameId: string, userId: string, action: SetCurrentUserNameAction) {
    const nameRef = firebase.database().ref(`rooms/${gameId}/users/${userId}/name`);
    nameRef.set(action.name);
}

function* throttledPublishUserName(gameId: string, userId: string) {
    yield throttle(1000, "SET_CURRENT_USER_NAME", publishUserName, gameId, userId);
}

function publishGameOption(gameId: string, action: SetGameOptionAction) {
    const ref = firebase.database().ref(`rooms/${gameId}/gameOptions/${action.option}`);
    ref.set(action.value);
}

export function* subscribeToRoom(gameId: string, userId: string) {
    yield takeEvery("SET_GAME_OPTION", publishGameOption, gameId);
    yield fork(throttledPublishUserName, gameId, userId);

    const firebaseEventChannel = eventChannel(emit => {
        const roomRef = firebase.database().ref(`rooms/${gameId}`);

        const gameOptionsRef = roomRef.child("gameOptions");
        gameOptionsRef.on("value", snap => emit(gameOptions(snap.val())));

        const gameStatusRef = roomRef.child("gameStatus");
        gameStatusRef.on("value", snap => emit(gameStatus(snap.val())));

        const usersRef = roomRef.child("users");
        usersRef.on("child_added", snap =>
            emit(setUser({ ...snap.val(), id: snap.key })));
        usersRef.on("child_changed", snap =>
            emit(setUser({ ...snap.val(), id: snap.key })));

        const userRef = usersRef.child(userId);
        firebase.database().ref(".info/connected").on("value", snap => {
            if (!snap.val()) {
                return;
            }
            userRef.onDisconnect().update({ status: "disconnected" }).then(() => {
                userRef.update({
                    status: "connected",
                    connectedAt: firebase.database.ServerValue.TIMESTAMP,
                });
            });
        });

        return () => {
            gameStatusRef.off("value");
            usersRef.off("child_added");
            usersRef.off("child_removed");
            usersRef.off("child_changed");
        };
    });
    while (true) {
        yield put(yield take(firebaseEventChannel));
    }
}

export function startGame(gameId: string) {
    const ref = firebase.database().ref();
    ref.child(".info/serverTimeOffset").once("value", snap => {
        const nowMs = new Date().getTime() + snap.val();
        ref.update({
            [`rooms/${gameId}/gameStartedAt`]: new Date(nowMs).toJSON(),
            [`rooms/${gameId}/gameStatus`]: "inProgress",
        });
    });
}

export function endGame(gameId: string, gameState: GameState, playerStats: PlayerStats[]) {
    const ref = firebase.database().ref();
    ref.child(".info/serverTimeOffset").once("value", snap => {
        const nowMs = new Date().getTime() + snap.val();
        const { playerId, ...denormalizedGameState } = gameState;
        const updates: Record<string, any> = {
            [`gameStates/${gameId}`]: denormalizedGameState,
            [`rooms/${gameId}/gameEndedAt`]: new Date(nowMs).toJSON(),
            [`rooms/${gameId}/gameStatus`]: "completed",
        };
        playerStats.forEach((stats, i) => {
            updates[`rooms/${gameId}/users/${stats.id}/gameStats`] = {
                ...stats,
                rank: i,
            };
        });
        ref.update(updates);
    });
}

export function* publishGameLog(gameId: string) {
    while (true) {
        const gameAction = yield take(isGameAction);
        if (!gameAction._key) {
            firebase.database().ref(`gameLogs/${gameId}`).push({
                ...gameAction,
                ts: firebase.database.ServerValue.TIMESTAMP,
            });
        }
    }
}

export function* subscribeToGameLog(gameId: string) {
    const gameLogRef = firebase.database().ref(`gameLogs/${gameId}`);

    // First, apply all existing actions sorted by timestamp
    const gameLogSnap = (yield call(() => gameLogRef.orderByChild("ts").once("value"))) as firebase.database.DataSnapshot;
    const appliedKeys: Set<string> = new Set();
    const orderedLog: GameAction[] = [];
    gameLogSnap.forEach(snap => {
        orderedLog.push({ ...snap.val(), _key: snap.key });
    });
    for (const action of orderedLog) {
        yield put(action);
        appliedKeys.add(action._key!);
    }

    // Then listen for new actions, filtering out those we've already applied
    const firebaseEventChannel = eventChannel(emit => {
        gameLogRef.on("child_added", snap => {
            if (!appliedKeys.has(snap.key!)) {
                emit({ ...snap.val(), _key: snap.key });
            }
        });
        return () => gameLogRef.off("child_added");
    });
    while (true) {
        yield put(yield take(firebaseEventChannel));
    }
}
