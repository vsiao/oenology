import "firebase/auth";
import "firebase/database";
import * as firebase from "firebase/app";
import { eventChannel } from "redux-saga";
import { take, put, call } from "redux-saga/effects";
import { firebaseConfig } from "./config";
import { isGameAction } from "../game-data/gameActions";
import { gameStatus, setUser, setCurrentUserId } from "./appActions";

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

export function* subscribeToRoom(gameId: string, userId: string) {
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

export function* publishGameLog(gameId: string) {
    while (true) {
        const gameAction = yield take(isGameAction);
        if (!gameAction.published) {
            firebase.database().ref(`gameLogs/${gameId}`).push(gameAction);
        }
    }
}

export function* subscribeToGameLog(gameId: string) {
    const firebaseEventChannel = eventChannel(emit => {
        const ref = firebase.database().ref(`gameLogs/${gameId}`);
        ref.on("child_added", snap => emit({ ...snap.val(), published: true }));
        return () => ref.off("child_added");
    });
    while (true) {
        yield put(yield take(firebaseEventChannel));
    }
}
