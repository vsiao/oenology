import "./Home.css";
import cx from "classnames";
import React, { FunctionComponent, useEffect, useState } from "react";
import { fetchRecentGames, createRoom, fetchPlayersState } from "../../store/firebase";
import { RoomState } from "../../store/AppState";
import Worker from "../icons/Worker";
import CrownIcon from "../icons/CrownIcon";
import VP from "../icons/VictoryPoints";

interface GameRoom extends RoomState {
    key: string;
}

const Home: FunctionComponent<{}> = props => {
    const [games, setGames] = useState<GameRoom[]>([])
    useEffect(() => {
        fetchRecentGames().then(games =>
            setGames(games as GameRoom[])
        );
    }, [])

    return <div className="Home">
        <h1 className="Home-title"><em>Make wine—with friends!</em></h1>
        <button className="Home-newGame" onClick={handleNewGameClick}>
            New Game
        </button>

        <h2>Recent Games</h2>
        <table className="Home-recentGamesTable">
            <tbody>
                {games.map(room => <RecentGameRow key={room.key} room={room} />)}
            </tbody>
        </table>
    </div>;
};

const handleNewGameClick = () => {
    createRoom().then(roomId => window.location.href = `/game/${roomId}`);
};

const RecentGameRow: FunctionComponent<{ room: GameRoom }> = ({ room }) => {
    const [fetchedPlayerData, setFetchedPlayerData] = useState<Record<string, {rank:number;vp: number;}>>({});
    const activePlayers = Object.entries(room.users).filter(([_, u]) => u.name).map(([id, u]) => ({...u, id}));
    const hasStats = activePlayers.every(p => p.gameStats);
    useEffect(() => {
        if (room.gameStatus === "completed" && !hasStats) {
            fetchPlayersState(room.key).then(playerMap => {
                const players = Object.values(playerMap);
                players.sort((p2, p1) => {
                    return p1.victoryPoints !== p2.victoryPoints
                        ? p1.victoryPoints - p2.victoryPoints
                        : p1.coins - p2.coins;
                });
                setFetchedPlayerData(Object.fromEntries(
                    players.map((p, i) => [p.id, { rank: i, vp: p.victoryPoints }])
                ));
            });
        }
    }, [room.gameStatus, room.key, hasStats]);
    activePlayers.sort((p1, p2) =>
        (p1.gameStats?.rank ?? fetchedPlayerData[p1.id]?.rank) -
            (p2.gameStats?.rank ?? fetchedPlayerData[p2.id]?.rank)
    );

    return <tr className="Home-recentGame">
        <td className="Home-recentGameCell">
            {room.gameStartedAt
                ? new Date(room.gameStartedAt).toLocaleString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric",
                })
                : null}{" "}
        </td>
        <td className="Home-recentGameCell">
            <div className="Home-recentGamePlayers">
                {activePlayers.map((p, i) => {
                    const vp = p.gameStats?.victoryPoints ?? fetchedPlayerData[p.id]?.vp;
                    const isWinner = p.gameStats?.rank === 0 || fetchedPlayerData[p.id]?.rank === 0;
                    return <React.Fragment key={p.id}>
                        {vp !== undefined && isWinner
                            ? <VP className="Home-recentGameVP">{vp}</VP>
                            : i > 0 && ", "}
                        <span className={cx({
                            "Home-playerName": true,
                            "Home-playerName--winner": isWinner,
                        })}>{p.name}</span>
                        {isWinner && <CrownIcon className="Home-recentGameCrown" />}
                    </React.Fragment>
                })}
            </div>
        </td>
        <td className="Home-recentGameCell">
            {activePlayers.length} <Worker isTemp={true} />
        </td>
        <td className="Home-recentGameCell">
            {room.gameOptions?.rhineVisitors && <span className="Home-rhineTag">rhine</span>}
            {room.gameOptions?.tuscanyBoard && <span className="Home-tuscanyTag">tuscany</span>}
        </td>
        <td className="Home-recentGameCell">
            <a href={`/game/${room.key}`}>
                Go!
            </a>
        </td>
    </tr>
};

export default Home;