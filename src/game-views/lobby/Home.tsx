import "./Home.css";
import React, { FunctionComponent, useEffect, useState } from "react";
import { fetchRecentGames, createRoom } from "../../store/firebase";
import { RoomState } from "../../store/AppState";
import Worker from "../icons/Worker";

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
    const activePlayers = Object.values(room.users).filter(u => u.name);
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
            {activePlayers.map((p, i) => <>
                {i > 0 ? ", " : null}
                <span className="Home-playerName">{p.name}</span>
            </>)}
        </td>
        <td className="Home-recentGameCell">
            {activePlayers.length} <Worker isTemp={true} />
        </td>
        <td className="Home-recentGameCell">
            {room.gameOptions?.rhineVisitors && <span className="Home-optionTag">rhine</span>}
            {room.gameOptions?.tuscanyBoard && <span className="Home-optionTag">tuscany</span>}
        </td>
        <td className="Home-recentGameCell">
            <a href={`/game/${room.key}`}>
                Go!
            </a>
        </td>
    </tr>
};

export default Home;