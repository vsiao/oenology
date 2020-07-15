import "firebase/auth";
import "firebase/database";
import * as firebase from "firebase/app";
import { eventChannel } from "redux-saga";
import { take, put, call, fork, throttle } from "redux-saga/effects";
import { firebaseConfig } from "./config";
import { isGameAction, startGame as startGameAction, PlayerInit } from "../game-data/gameActions";
import { gameStatus, setUser, setCurrentUserId, SetCurrentUserNameAction } from "./appActions";

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

export function getGameState(gameId: string) {
    return new Promise(resolve => {
        firebase.database().ref(`rooms/${gameId}/game`).once("value", snap => {
            resolve(snap.val());
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

export function* subscribeToRoom(gameId: string, userId: string) {
    yield fork(throttledPublishUserName, gameId, userId);

    const firebaseEventChannel = eventChannel(emit => {
        const roomRef = firebase.database().ref(`rooms/${gameId}`);

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
                userRef.update({ status: "connected" });
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

export function startGame(gameId: string, players: PlayerInit[]) {
    const ref = firebase.database().ref();
    ref.child(".info/serverTimeOffset").once("value", snap => {
        const nowMs = new Date().getTime() + snap.val();
        const startGameKey = ref.child(`gameLogs/${gameId}`).push().key;
        ref.update({
            [`gameLogs/${gameId}/${startGameKey}`]: startGameAction(players),
            [`rooms/${gameId}/gameStartedAt`]: new Date(nowMs).toJSON(),
            [`rooms/${gameId}/gameStatus`]: "inProgress",
        });
    });
}

export function* publishGameLog(gameId: string) {
    while (true) {
        const gameAction = yield take(isGameAction);
        if (!gameAction._key) {
            firebase.database().ref(`gameLogs/${gameId}`).push(gameAction);
        }
    }
}

export function* subscribeToGameLog(gameId: string) {
    const firebaseEventChannel = eventChannel(emit => {
        const ref = firebase.database().ref(`gameLogs/${gameId}`);
        ref.on("child_added", snap => {
            emit({ ...snap.val(), _key: snap.key })
        });
        return () => ref.off("child_added");
    });
    while (true) {
        yield put(yield take(firebaseEventChannel));
    }
}
