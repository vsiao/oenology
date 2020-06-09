import './App.css';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { startGame } from './game-data/gameActions';
import OenologyGame from './game-views/OenologyGame';
import { AppState } from './store/AppState';
import { AppAction } from './store/appActions';
import { setPlayerId } from './store/appActions';

interface Props {
    currentPlayerId: string | null;
    playerIds: string[];
    onSelectPlayerId: (playerId: string) => void;
    startGame: () => void;
}

const App: React.FunctionComponent<Props> = props => {
    return (
        <div className="App">
            <header className="App-header">
                oenology
                {props.currentPlayerId
                    ? null
                    : props.playerIds.map(playerId =>
                        <button key={playerId} onClick={() => props.onSelectPlayerId(playerId)}>
                            {playerId}
                        </button>
                    )}
                <button onClick={props.startGame}>New Game</button>
            </header>
            <OenologyGame currentPlayerId={props.currentPlayerId} />
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
        startGame: () => dispatch(startGame()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
