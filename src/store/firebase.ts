import * as firebase from "firebase/app";
import { take } from "redux-saga/effects";
import { GameAction } from "../game-data/gameActions";
import { firebaseConfig } from "./config";

import "firebase/database";

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

export function subscribeToFirebase(gameId: string, onAction: (action: GameAction) => void) {
    firebase.database().ref(`gameLogs/${gameId}`).on("child_added", snapshot => {
        const action = snapshot.val();

        onAction({ ...action, published: true });
    });
}
