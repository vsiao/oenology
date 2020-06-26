import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleWare from "redux-saga";
import { publishToFirebase, subscribeToFirebase } from "./firebase";
import { JoinGameAction } from "./appActions";
import { appReducer } from "./appReducers";
import { all, call, take, takeEvery, select } from "redux-saga/effects";

const sagaMiddleware = createSagaMiddleWare();
const store = createStore(
    appReducer,
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
        applyMiddleware(sagaMiddleware)
    )
);

sagaMiddleware.run(function* () {
    yield takeEvery("JOIN_GAME", gameSaga);
});

function* gameSaga(action: JoinGameAction) {
    let playerId = yield select(state => state.playerId);
    while (!playerId) {
        // Wait for playerId to be initialized before joining
        yield take("SET_PLAYER_ID");
        playerId = yield select(state => state.playerId);
    }
    yield all([
        call(subscribeToFirebase, action.gameId),
        call(publishToFirebase, action.gameId),
    ]);
}

export default store;
