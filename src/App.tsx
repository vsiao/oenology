import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import GameState from './game-data/GameState';
import OenologyGame from './game-views/OenologyGame';
import { AppAction } from './store/actionTypes';
import { setPlayerId } from './store/localActionCreators';

import './App.css';

interface Props {
    currentPlayerId: string | null;
    playerIds: string[];
    onSelectPlayerId: (playerId: string) => void;
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
            </header>
            <OenologyGame currentPlayerId={props.currentPlayerId} />
        </div>
    );
};

const mapStateToProps = (state: GameState) => {
    return {
        currentPlayerId: state.playerId,
        playerIds: Object.keys(state.players),
    }
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    return {
        onSelectPlayerId: (playerId: string) => dispatch(setPlayerId(playerId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
