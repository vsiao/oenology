import './App.css';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { startGame, CHEAT_drawCard } from './game-data/gameActions';
import OenologyGame from './game-views/OenologyGame';
import { AppState } from './store/AppState';
import { AppAction } from './store/appActions';
import { setPlayerId } from './store/appActions';
import ChoiceButton from './game-views/controls/ChoiceButton';

interface Props {
    currentPlayerId: string | null;
    playerIds: string[];
    onSelectPlayerId: (playerId: string) => void;
    drawCard: (id: string, playerId: string) => void;
    startGame: () => void;
}

const App: React.FunctionComponent<Props> = props => {
    const [drawCardInputValue, setDrawCardInputValue] = useState("");
    return (
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
                <button className="App-newGame" onClick={props.startGame}>
                    New Game
                </button>
            </header>
            <OenologyGame currentPlayerId={props.currentPlayerId} />
            {props.currentPlayerId === null
                ? <div className="App-modal">
                    <div className="App-dialog">
                        Who are you? {props.playerIds.map(playerId =>
                            <ChoiceButton key={playerId} onClick={() => props.onSelectPlayerId(playerId)}>
                                {playerId}
                            </ChoiceButton>
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
        drawCard: (id: string, playerId: string) => dispatch(CHEAT_drawCard(id, playerId)),
        startGame: () => dispatch(startGame()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
