import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleWare from "redux-saga";
import { publishToFirebase, subscribeToFirebase } from "./firebase";
import { appReducer } from "./appReducers";

const sagaMiddleware = createSagaMiddleWare();
const store = createStore(
    appReducer,
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
        applyMiddleware(sagaMiddleware)
    )
);

sagaMiddleware.run(publishToFirebase);
const unsubscribe = store.subscribe(() => {
    // Wait for playerId to be initialized before applying game logs
    if (store.getState().playerId) {
        subscribeToFirebase(action => store.dispatch(action));
        unsubscribe();
    }
});

export default store;
