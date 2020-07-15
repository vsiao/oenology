import "./Home.css";
import React, { FunctionComponent, useEffect, useState } from "react";
import { fetchRecentGames } from "../../store/firebase";

interface GameRoom {
    key: string;
    gameStartedAt: string;
    gameStatus: string;
    users: { name: string }[];
}

const Home: FunctionComponent<{}> = props => {
    const [games, setGames] = useState<GameRoom[]>([])
    useEffect(() => {
        fetchRecentGames().then(games =>
            setGames(games as GameRoom[])
        );
    }, [])

    return <div className="Home">
        <h2>Recent Games</h2>
        <table className="Home-recentGamesTable">
            <tbody>
                {games.map(room => <RecentGameRow key={room.key} room={room} />)}
            </tbody>
        </table>
    </div>;
};

const RecentGameRow: FunctionComponent<{ room: GameRoom }> = ({ room }) => {
    return <tr className="Home-recentGame">
        <td className="Home-recentGameCell">
            {room.gameStartedAt
                ? new Date(room.gameStartedAt).toLocaleString()
                : null}{" "}
        </td>
        <td className="Home-recentGameCell">
            {Object.values(room.users).filter(u => u.name)
                .map(u => u.name).sort().join(", ")}
        </td>
        <td className="Home-recentGameCell">
            <a href={`/game/${room.key}`}>
                Go!
            </a>
        </td>
    </tr>
};

export default Home;