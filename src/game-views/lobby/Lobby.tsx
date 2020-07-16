import "./Lobby.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState, User } from "../../store/AppState";
import ChoiceButton from "../controls/ChoiceButton";
import { PlayerColor } from "../../game-data/GameState";
import { Dispatch } from "redux";
import { setCurrentUserName } from "../../store/appActions";
import { startGame } from "../../store/firebase";

interface Props {
    gameId: string;
    currentUser?: User;
    users: User[];
    gameStatus: string | null | undefined;
    setName: (name: string) => void;
    startGame: (players: User[]) => void;
}

const Lobby: React.FunctionComponent<Props> = ({
    gameId,
    currentUser,
    users,
    gameStatus,
    setName,
    startGame
}) => {
    const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);
    const gameUrl = `https://make-wine.web.app/game/${gameId}`;
    return <>
        <div className="Lobby-main">
            {gameStatus === null
                ? <>
                    <label className="Lobby-nameLabel">
                        What's your name?
                        <input
                            autoFocus
                            type="text"
                            className="Lobby-nameInput"
                            value={currentUser ? currentUser.name : ""}
                            onChange={e => setName(e.target.value)}
                        />
                    </label>
                    <div className="Lobby-shareBanner">
                        <a href={gameUrl} className="Lobby-shareLink">
                            {gameUrl}
                        </a>
                        <button
                            className="Lobby-copyLinkButton"
                            onClick={() => {
                                const textArea = document.createElement("textarea");
                                textArea.value = gameUrl;
                                document.body.appendChild(textArea);
                                try {
                                    textArea.focus();
                                    textArea.select();
                                    if (document.execCommand("copy")) {
                                        setCopiedToClipboard(true);
                                    }
                                } finally {
                                    document.body.removeChild(textArea);
                                }
                            }}
                        >
                            {copiedToClipboard ? "Copied" : "Copy"}
                        </button>
                    </div>
                </>
                : null}
        </div>
        <div className="Lobby-controls"></div>
        <div className="Lobby-sidebar">
            {gameStatus === null
                ? <>
                    <h3 className="Lobby-usersHeader">Waiting for players…</h3>
                    <ul className="Lobby-users">
                        {users.map(u =>
                            <li key={u.id} className="Lobby-user">
                                {u.name || <em>…</em>}
                            </li>
                        )}
                    </ul>
                    <ChoiceButton
                        className="Lobby-startGame"
                        onClick={() => startGame(users)}
                        disabled={users.length < 2 || users.length > 6}
                    >
                        Start Game
                    </ChoiceButton>
                </>
                : null}
        </div>
    </>;
};

const mapStateToProps = (state: AppState) => {
    return {
        currentUser: state.room.users[state.userId!],
        gameStatus: state.room.gameStatus,
        users: Object.values(state.room.users).filter(u => u.status === "connected"),
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: { gameId: string }) => {
    const colors: PlayerColor[] = [
        "purple",
        "orange",
        "green",
        "red",
        "yellow",
        "blue"
    ];
    return {
        setName: (name: string) => dispatch(setCurrentUserName(name)),
        startGame: (users: User[]) => {
            startGame(
                ownProps.gameId,
                users.map(({ id, name }, i) => ({ id, name, color: colors[i] }))
            );
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
