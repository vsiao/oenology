import "./Lobby.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { AppState, User, GameOptions } from "../../store/AppState";
import ChoiceButton from "../controls/ChoiceButton";
import { startGame as startGameAction } from "../../game-data/gameActions";
import { MAX_NUM_PLAYERS, PLAYER_COLORS, PlayerColor } from "../../game-data/GameState";
import { Dispatch } from "redux";
import { setCurrentUserName, setGameOption, setPlayerColor } from "../../store/appActions";
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
import Worker from "../icons/Worker";

interface Props {
    gameId: string;
    currentUser?: User;
    users: User[];
    gameStatus: string | null | undefined;
    gameOptions: GameOptions;
    setName: (name: string) => void;
    setOption: (option: string, value: string | number | boolean) => void;
    setColor: (c: PlayerColor) => void;
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
    setColor,
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
                                {i < MAX_NUM_PLAYERS &&
                                    <PlayerColorPicker
                                        color={gameOptions.playerColors?.[u.id]}
                                        playerColors={gameOptions.playerColors}
                                        isCurrentUser={u.id === currentUser?.id}
                                        setColor={setColor}
                                    />}
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
                                Visit from the Rhine Valley (BETA)
                            </label>
                        </li>
                        <li className="Lobby-gameOption">
                            <label className="Lobby-optionLabel">
                                <input
                                    className="Lobby-optionCheckbox"
                                    type="checkbox"
                                    disabled={!isHost}
                                    checked={gameOptions.tuscanyBoard ?? false}
                                    onChange={() => setOption("tuscanyBoard", !gameOptions.tuscanyBoard)}
                                />
                                Tuscany Board (BETA)
                            </label>
                        </li>
                        {renderComingSoonOption("Tuscany workers")}
                    </ul>
                    {isHost
                        ? <ChoiceButton
                            className="Lobby-startGame"
                            onClick={() => startGame(users.slice(0, MAX_NUM_PLAYERS), gameOptions)}
                            disabled={users.length < 2}
                        >
                            Start Game
                        </ChoiceButton>
                        : null}
                </>
                : null}
        </div>
    </>;
};

const PlayerColorPicker: React.FC<{
    color?: PlayerColor;
    playerColors?: Record<string, PlayerColor>;
    isCurrentUser: boolean;
    setColor: (c: PlayerColor) => void;
}> = ({ color, playerColors = {}, isCurrentUser, setColor }) => {
    const ref = React.useRef<HTMLSpanElement>(null);
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        if (!isEditing) {
            return;
        }
        const onMouseDown = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        };
        document.addEventListener("mousedown", onMouseDown, /* capture */ true);
        return () => document.removeEventListener("mousedown", onMouseDown, /* capture */ true);
    }, [isEditing]);

    return <span
        ref={ref}
        className={cx(
            "Lobby-playerColor",
            { "Lobby-playerColor--editable": isCurrentUser }
        )}
        onClick={isCurrentUser
            ? event => {
                if (event.defaultPrevented) {
                    return;
                }
                setIsEditing(!isEditing);
            }
            : undefined}
    >
        <Worker color={color} />
        {isEditing && <div className="Lobby-playerColorPicker" onClick={event => event.preventDefault()}>
            {PLAYER_COLORS.map((c, i) =>
                <>
                    <button
                        className={cx("Lobby-playerColorButton", {
                            "Lobby-playerColorButton--selected": color === c,
                        })}
                        disabled={color !== c && Object.values(playerColors).includes(c)}
                        onClick={() => {
                            setColor(c);
                            setIsEditing(false);
                        }}
                    >
                        <Worker color={c} />
                    </button>
                    {i === 3 ? <br /> : null}
                </>
            )}
        </div>}
    </span>;
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
    return {
        setName: (name: string) => dispatch(setCurrentUserName(name)),
        setOption: (option: string, value: string | number | boolean) =>
            dispatch(setGameOption(option, value)),
        setColor: (color: PlayerColor) =>
            dispatch(setPlayerColor(color)),
        startGame: (users: User[], options: GameOptions) => {
            dispatch(
                startGameAction(
                    users.map(({ id, name }, i) => ({ id, name, color: options.playerColors![id] })),
                    options
                )
            );
            startGame(ownProps.gameId);
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
