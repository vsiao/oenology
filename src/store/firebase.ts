import * as firebase from "firebase/app";
import { take } from "redux-saga/effects";
import { GameAction } from "../game-data/gameActions";
import { firebaseConfig } from "./config";

import "firebase/database";

firebase.initializeApp(firebaseConfig);

const gameLogsRef = firebase.database().ref(`gameLogs/test`);

export function* publishToFirebase() {
    while (true) {
        const action = yield take("*");

        console.log("action", action);

        if (!action.localOnly && !action.published) {
            gameLogsRef.push(action);
        }
    }
}

export function subscribeToFirebase(onAction: (action: GameAction) => void) {
    gameLogsRef.on("child_added", snapshot => {
        const action = snapshot.val();

        onAction({ ...action, published: true });
    });
}
