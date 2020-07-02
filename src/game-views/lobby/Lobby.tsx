import "./Lobby.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState, User } from "../../store/AppState";
import ChoiceButton from "../controls/ChoiceButton";
import { PlayerColor } from "../../game-data/GameState";
import { Dispatch } from "redux";
import { startGame } from "../../game-data/gameActions";
import { setCurrentUserName } from "../../store/appActions";

interface Props {
    currentUserId: string | null;
    users: Record<string, User>;
    gameStatus: string | null | undefined;
    setName: (name: string) => void;
    startGame: (players: User[]) => void;
}

const Lobby: React.FunctionComponent<Props> = ({
    currentUserId,
    users,
    gameStatus,
    setName,
    startGame
}) => {
    const currentUser = users[currentUserId!];
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
                </>
                : null}
        </div>
        <div className="Lobby-controls"></div>
        <div className="Lobby-sidebar">
            {gameStatus === null
                ? <>
                    <h3 className="Lobby-usersHeader">Waiting for players…</h3>
                    <ul className="Lobby-users">
                        {Object.values(users).map(u =>
                            <li key={u.id} className="Lobby-user">
                                {u.name || <em>…</em>}
                            </li>
                        )}
                    </ul>
                    <ChoiceButton
                        className="Lobby-startGame"
                        onClick={() =>
                            startGame(Object.values(users))}
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
        currentUserId: state.userId,
        gameStatus: state.room.status,
        users: Object.fromEntries(
            Object.entries(state.room.users)
                .filter(([_, u]) => u.status === "connected")
        ),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
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
            if (users.length > 6) {
                throw new Error("Can't have more than 6 players");
            }
            dispatch(
                startGame(
                    users.map(({ id, name }, i) => ({ id, name, color: colors[i] }))
                )
            );
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
