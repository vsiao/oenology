import './App.css';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { startGame, CHEAT_drawVisitor } from './game-data/gameActions';
import OenologyGame from './game-views/OenologyGame';
import { AppState } from './store/AppState';
import { AppAction } from './store/appActions';
import { setPlayerId } from './store/appActions';
import { visitorCards, VisitorId } from './game-data/visitors/visitorCards';

interface Props {
    currentPlayerId: string | null;
    playerIds: string[];
    onSelectPlayerId: (playerId: string) => void;
    drawVisitor: (id: VisitorId, playerId: string) => void;
    startGame: () => void;
}

const App: React.FunctionComponent<Props> = props => {
    const [drawVisitorInputValue, setDrawVisitorInputValue] = useState("");
    return (
        <div className="App">
            <header className="App-header">
                oenology
                <button onClick={props.startGame}>New Game</button>
                <input type="text"
                    value={drawVisitorInputValue}
                    onChange={e => setDrawVisitorInputValue(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            if (visitorCards.hasOwnProperty(drawVisitorInputValue)) {
                                props.drawVisitor(
                                    drawVisitorInputValue as VisitorId,
                                    props.currentPlayerId!
                                );
                            }
                        }
                    }}
                />
            </header>
            <OenologyGame currentPlayerId={props.currentPlayerId} />
            {props.currentPlayerId === null
                ? <div className="App-modal">
                    <div className="App-dialog">
                        Who are you? {props.playerIds.map(playerId =>
                        <button key={playerId} onClick={() => props.onSelectPlayerId(playerId)}>
                            {playerId}
                        </button>
                    )}
                    </div>
                </div>
                : null}
        </div>
    );
};

const mapStateToProps = (state: AppState) => {
    return {
        currentPlayerId: state.playerId,
        playerIds: Object.keys(state.game.players),
    }
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    return {
        onSelectPlayerId: (playerId: string) => dispatch(setPlayerId(playerId)),
        drawVisitor: (visitorId: VisitorId, playerId: string) =>
            dispatch(CHEAT_drawVisitor(visitorId, playerId)),
        startGame: () => dispatch(startGame()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
