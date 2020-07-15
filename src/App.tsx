import './App.css';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Dispatch } from 'redux';
import { CHEAT_drawCard } from './game-data/gameActions';
import OenologyGame from './game-views/OenologyGame';
import { AppState } from './store/AppState';
import { AppAction } from './store/appActions';
import Home from './game-views/lobby/Home';

interface Props {
    currentPlayerId: string | null;
    drawCard: (id: string, playerId: string) => void;
}

const App: React.FunctionComponent<Props> = props => {
    const [drawCardInputValue, setDrawCardInputValue] = useState("");
    return <BrowserRouter>
        <div className="App">
            <header className="App-header">
                oenology
                <input type="text"
                    className="App-cheatBox"
                    value={drawCardInputValue}
                    onChange={e => setDrawCardInputValue(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            props.drawCard(drawCardInputValue, props.currentPlayerId!);
                            setDrawCardInputValue("");
                        }
                    }}
                />
            </header>
            <Switch>
                <Route path="/game/:gameId">
                    <OenologyGame />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </div>
    </BrowserRouter>;
};

const mapStateToProps = (state: AppState) => {
    return {
        currentPlayerId: state.game && state.game.playerId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    return {
        drawCard: (id: string, playerId: string) => dispatch(CHEAT_drawCard(id, playerId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
