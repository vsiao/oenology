import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import OenologyGame from './game-views/OenologyGame';
import Home from './game-views/lobby/Home';
import { connect } from 'react-redux';
import GameTopbar from './game-views/GameTopbar';
import { AppState } from './store/AppState';

interface Props {
    isGameStarted: boolean;
}

const App: React.FunctionComponent<Props> = props => {
    return <BrowserRouter>
        <div className="App">
            <header className="App-header">
                <a className="App-homeLink" href="/">oenology</a>
                {props.isGameStarted && <GameTopbar />}
            </header>
            <Routes>
                <Route path="/game/:gameId" element={<OenologyGame />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </div>
    </BrowserRouter>;
};

const mapStateToProps = (state: AppState) => {
    return {
        isGameStarted: !!state.game,
    };
};

export default connect(mapStateToProps)(App);
