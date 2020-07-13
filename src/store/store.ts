import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleWare from "redux-saga";
import {
    publishGameLog,
    subscribeToRoom,
    subscribeToGameLog,
    signIn,
    getGameState,
} from "./firebase";
import { JoinGameAction, hydrateGame } from "./appActions";
import { appReducer } from "./appReducers";
import { call, take, fork, actionChannel, put } from "redux-saga/effects";

const sagaMiddleware = createSagaMiddleWare();
const store = createStore(
    appReducer,
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
        applyMiddleware(sagaMiddleware)
    )
);

sagaMiddleware.run(function* () {
    // First, start a buffer for join game requests
    const joinGameChannel = yield actionChannel("JOIN_GAME");

    // Then wait for firebase authentication to complete
    const userId = (yield call(signIn)) as unknown as string;

    const joinGameAction = (yield take(joinGameChannel)) as unknown as JoinGameAction;
    yield call(gameSaga, joinGameAction, userId);
});

function* gameSaga(action: JoinGameAction, userId: string) {
    const cachedGameState = yield call(getGameState, action.gameId);

    if (cachedGameState) {
        yield put(hydrateGame(cachedGameState));
    } else {
        yield fork(subscribeToRoom, action.gameId, userId);
        yield fork(subscribeToGameLog, action.gameId);
        yield fork(publishGameLog, action.gameId);
    }
}

export default store;
