import "./Lobby.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState, User, GameOptions } from "../../store/AppState";
import ChoiceButton from "../controls/ChoiceButton";
import { PlayerColor } from "../../game-data/GameState";
import { Dispatch } from "redux";
import { setCurrentUserName, setGameOption } from "../../store/appActions";
import { startGame } from "../../store/firebase";
import VineCard from "../cards/VineCard";
import { vineCards } from "../../game-data/vineCards";
import { orderCards } from "../../game-data/orderCards";
import OrderCard from "../cards/OrderCard";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import VisitorCard from "../cards/VisitorCard";
import { Vine, Order } from "../icons/Card";
import Grape from "../icons/Grape";
import WineGlass from "../icons/WineGlass";

interface Props {
    gameId: string;
    currentUser?: User;
    users: User[];
    gameStatus: string | null | undefined;
    gameOptions: GameOptions;
    setName: (name: string) => void;
    setOption: (option: string, value: string | number | boolean) => void;
    startGame: (players: User[], options: GameOptions) => void;
}

const Lobby: React.FunctionComponent<Props> = ({
    gameId,
    currentUser,
    users,
    gameOptions,
    gameStatus,
    setName,
    setOption,
    startGame
}) => {
    const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);
    const gameUrl = `https://make-wine.web.app/game/${gameId}`;
    const isHost = currentUser === users[0];
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
                    <div className="Lobby-howto">
                        <h4 className="Lobby-howtoHeader">
                            Winemaking for Dummies™
                        </h4>
                        <ol className="Lobby-howtoList">
                            <li className="Lobby-howtoItem">Plant <Vine /></li>
                            <li className="Lobby-howtoItem">
                                Harvest field—<Grape color="red">1</Grape><Grape color="white">5</Grape>
                            </li>
                            <li className="Lobby-howtoItem">Make wine—<WineGlass color="blush">6</WineGlass></li>
                            <li className="Lobby-howtoItem">Fill <Order /></li>
                        </ol>
                    </div>
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
        <div className="Lobby-controls">
            {gameStatus === null && <>
                <h3 className="Lobby-exampleHeader">Example cards</h3>
                <ul className="Lobby-cards">
                    <li className="Lobby-card"><VineCard cardData={vineCards.pin1} /></li>
                    <li className="Lobby-card"><VineCard cardData={vineCards.cha1} /></li>
                    <li className="Lobby-card"><OrderCard cardData={orderCards.r2w2b5} /></li>
                    <li className="Lobby-card"><OrderCard cardData={orderCards.s9} /></li>
                    <li className="Lobby-card"><VisitorCard cardData={visitorCards.contractor} /></li>
                    <li className="Lobby-card"><VisitorCard cardData={visitorCards.buyer} /></li>
                    <li className="Lobby-card"><VisitorCard cardData={visitorCards.guestSpeaker} /></li>
                    <li className="Lobby-card"><VisitorCard cardData={visitorCards.promoter} /></li>
                </ul>
            </>}
        </div>
        <div className="Lobby-sidebar">
            {gameStatus === null
                ? <>
                    <h3 className="Lobby-usersHeader">Waiting for players…</h3>
                    <ul className="Lobby-users">
                        {users.map((u, i) =>
                            <li key={u.id} className="Lobby-user">
                                {u.name || <em>…</em>}
                                {i === 0 && <span className="Lobby-hostTag">host</span>}
                            </li>
                        )}
                    </ul>
                    <h3 className="Lobby-gameOptionsHeader">Options</h3>
                    <ul className="Lobby-gameOptions">
                        <li className="Lobby-gameOption">
                            <label className="Lobby-optionLabel">
                                <input
                                    className="Lobby-optionCheckbox"
                                    type="checkbox"
                                    disabled={!isHost}
                                    checked={gameOptions.multiInheritance ?? false}
                                    onChange={() => setOption("multiInheritance", !gameOptions.multiInheritance)}
                                />
                                Mama &amp; Papa: Choose from 2
                            </label>
                        </li>
                        <li className="Lobby-gameOption">
                            <label className="Lobby-optionLabel">
                                <input
                                    className="Lobby-optionCheckbox"
                                    type="checkbox"
                                    disabled={!isHost}
                                    checked={gameOptions.rhineVisitors ?? false}
                                    onChange={() => setOption("rhineVisitors", !gameOptions.rhineVisitors)}
                                />
                                Visit from the Rhine Valley
                            </label>
                        </li>
                        {renderComingSoonOption("Tuscany board")}
                    </ul>
                    {isHost
                        ? <ChoiceButton
                            className="Lobby-startGame"
                            onClick={() => startGame(users, gameOptions)}
                            disabled={users.length < 2 || users.length > 6}
                        >
                            Start Game
                        </ChoiceButton>
                        : null}
                </>
                : null}
        </div>
    </>;
};

const renderComingSoonOption = (label: string) => {
    return <li className="Lobby-gameOption">
        <label className="Lobby-optionLabel">
            <input
                className="Lobby-optionCheckbox"
                type="checkbox"
                disabled={true}
                checked={false}
            />
            <span className="Lobby-comingSoonOption">
                <em className="Lobby-comingSoon">Coming Soon</em>—{label}
            </span>
        </label>
    </li>;
};

const mapStateToProps = (state: AppState) => {
    return {
        currentUser: state.room.users[state.userId!],
        gameOptions: state.room.gameOptions || {},
        gameStatus: state.room.gameStatus,
        users: Object.values(state.room.users)
            .filter(u => u.status === "connected")
            .sort((u1, u2) => u1.connectedAt - u2.connectedAt),
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
        setOption: (option: string, value: string | number | boolean) =>
            dispatch(setGameOption(option, value)),
        startGame: (users: User[], options: GameOptions) => {
            startGame(
                ownProps.gameId,
                users.map(({ id, name }, i) => ({ id, name, color: colors[i] })),
                options
            );
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
