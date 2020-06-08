import * as firebase from "firebase/app";
import { take } from "redux-saga/effects";

import "firebase/database";
import { GameAction } from "../game-data/actionTypes";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwkZqkezD1s8QrplNx8nZni_Wz88JuO5Y",
  authDomain: "oenology-89bc8.firebaseapp.com",
  databaseURL: "https://oenology-89bc8.firebaseio.com",
  projectId: "oenology-89bc8",
  storageBucket: "oenology-89bc8.appspot.com",
  messagingSenderId: "316300212927",
  appId: "1:316300212927:web:bff7347fb001e2aa12240a"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const gameLogsRef = firebase.database().ref(`gameLogs/test`);

export function* publishToFirebase() {
    while (true) {
        const action = yield take("*");

        console.log("action", action);

        if (!action.published) {
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
