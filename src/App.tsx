import './App.css';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Dispatch } from 'redux';
import { CHEAT_drawCard, CHEAT_gainGrape } from './game-data/gameActions';
import OenologyGame from './game-views/OenologyGame';
import { AppState } from './store/AppState';
import { AppAction } from './store/appActions';
import Home from './game-views/lobby/Home';
import { GrapeSpec } from './game-data/prompts/promptActions';
import { GrapeColor } from './game-data/GameState';

interface Props {
    playerId: string | null;
    drawCard: (playerId: string, id: string) => void;
    gainGrape: (playerId: string, grape: GrapeSpec) => void;
}

const App: React.FunctionComponent<Props> = props => {
    const [cheatInputValue, setCheatInputValue] = useState("");
    return <BrowserRouter>
        <div className="App">
            <header className="App-header">
                <a className="App-homeLink" href="/">oenology</a>
                <input type="text"
                    className="App-cheatBox"
                    value={cheatInputValue}
                    onChange={e => setCheatInputValue(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            const [cmd, ...parts] = cheatInputValue.split(":");
                            switch (cmd) {
                                case "d":
                                    props.drawCard(props.playerId!, parts[0]);
                                    break;
                                case "g":
                                    props.gainGrape(props.playerId!, {
                                        color: parts[0] as GrapeColor,
                                        value: parseInt(parts[1], 10),
                                    });
                                    break;
                            }
                            setCheatInputValue("");
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
        playerId: state.game && state.game.playerId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    return {
        drawCard: (playerId: string, id: string) => dispatch(CHEAT_drawCard(id, playerId)),
        gainGrape: (playerId: string, grape: GrapeSpec) => dispatch(CHEAT_gainGrape(grape, playerId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
