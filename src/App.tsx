import './App.css';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route } from "react-router-dom";
import { Dispatch } from 'redux';
import { startGame, CHEAT_drawCard } from './game-data/gameActions';
import OenologyGame from './game-views/OenologyGame';
import { AppState, User } from './store/AppState';
import { AppAction } from './store/appActions';
import { PlayerColor } from './game-data/GameState';

interface Props {
    currentPlayerId: string | null;
    usersInRoom: User[];
    drawCard: (id: string, playerId: string) => void;
    startGame: (players: string[]) => void;
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
                <button
                    className="App-newGame"
                    onClick={() => props.startGame(props.usersInRoom.map(u => u.id))}
                >
                    New Game
                </button>
            </header>
            <Route path="/game/:gameId">
                <OenologyGame />
            </Route>
        </div>
    </BrowserRouter>;
};

const mapStateToProps = (state: AppState) => {
    return {
        currentPlayerId: state.game.playerId,
        usersInRoom: Object.values(state.room.users)
            .filter(user => user.status === "connected"),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    const colors: PlayerColor[] = [
        "purple",
        "orange",
        "green",
        "red",
        "yellow",
        "blue"
    ];
    return {
        drawCard: (id: string, playerId: string) => dispatch(CHEAT_drawCard(id, playerId)),
        startGame: (userIds: string[]) => {
            if (userIds.length > 6) {
                throw new Error("Can't have more than 6 players");
            }
            dispatch(startGame(userIds.map((id, i) => [id, colors[i]])));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
