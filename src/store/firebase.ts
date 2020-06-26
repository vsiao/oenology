import * as firebase from "firebase/app";
import "firebase/database";
import { eventChannel } from "redux-saga";
import { take, put } from "redux-saga/effects";
import { firebaseConfig } from "./config";

firebase.initializeApp(firebaseConfig);

export function* publishToFirebase(gameId: string) {
    while (true) {
        const action = yield take("*");

        console.log("action", action);

        if (!action.localOnly && !action.published) {
            firebase.database().ref(`gameLogs/${gameId}`).push(action);
        }
    }
}

export function* subscribeToFirebase(gameId: string) {
    const firebaseEventChannel = eventChannel(emit => {
        const ref = firebase.database().ref(`gameLogs/${gameId}`);
        const onChildAdded = (snapshot: firebase.database.DataSnapshot) => {
            const action = snapshot.val();
            emit({ ...action, published: true });
        };
        ref.on("child_added", onChildAdded);
        return () => ref.off("child_added", onChildAdded);
    });
    while (true) {
        const action = yield take(firebaseEventChannel);

        yield put(action);
    }
}
