import "./Lobby.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState, User } from "../../store/AppState";
import ChoiceButton from "../controls/ChoiceButton";
import { PlayerColor } from "../../game-data/GameState";
import { Dispatch } from "redux";
import { setCurrentUserName } from "../../store/appActions";
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
                    <div className="Lobby-howto">
                        <h4 className="Lobby-howtoHeader">
                            Winemaking for Dummies™
                            {/* <br /><em>from grape to glass</em> */}
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
