import * as React from "react";
import { connect } from "react-redux";
import { PlayerState } from "../game-data/GameState";
import SidebarPlayer from "./SidebarPlayer";
import "./Sidebar.css";
import { AppState } from "../store/AppState";
import { ActivityLog, ActivityLogEvent } from "../game-data/ActivityLog";
import { structures } from "../game-data/structures";
import { VineYields, vineCards } from "../game-data/vineCards";
import Grape from "./icons/Grape";
import { visitorCards } from "../game-data/visitors/visitorCards";
import Worker from "./icons/Worker";
import Coins from "./icons/Coins";
import Card from "./icons/Card";
import { default as VP } from "./icons/VictoryPoints";
import WineGlass from "./icons/WineGlass";
import Residuals from "./icons/Residuals";

interface Props {
    players: Record<string, PlayerState>;
    playerNameById: Record<string, string>;
    activityLog: ActivityLog;
}

const Sidebar: React.FunctionComponent<Props> = props => {
    return <div className="Sidebar">
        <div className="Sidebar-players">
            {Object.values(props.players).map(player => {
                return <SidebarPlayer
                    key={player.id}
                    player={player}
                    playerName={props.playerNameById[player.id]}
                />;
            })}
        </div>
        <div className="Sidebar-activityLog">
            <div className="Sidebar-activityLogContents">
                {props.activityLog.map((event, i) => {
                    return <div key={i}>{renderActivity(event, props.playerNameById)}</div>;
                })}
            </div>
        </div>
    </div>;
};

const renderActivity = (
    event: ActivityLogEvent,
    playerNameById: Record<string, string>
): React.ReactNode => {
    if (event.type === "season") {
        return <div className="Sidebar-seasonSeparator">{event.season}</div>;
    }
    const player = <strong>{playerNameById[event.playerId]}</strong>;
    switch (event.type) {
        case "build":
            return <>{player} built the <strong>{structures[event.structureId].name}</strong></>;
        case "coins":
            return <>{player} {event.delta < 0 ? "paid" : "gained"} <Coins>{Math.abs(event.delta)}</Coins></>;
        case "draw":
            return <>{player} drew {event.cards.map((t, i) => <Card key={i} type={t} />)}</>;
        case "fill":
            return <>{player} filled a {event.wines.map((w, i) => <WineGlass key={i} color={w.color}>{w.value}</WineGlass>)} order</>;
        case "buySellField":
            return <>{player} {event.buy ? "bought" : "sold"} a field</>;
        case "harvest":
            return <>{player} harvested {renderYields(event.yields)}</>;
        case "makeWine":
            return <>{player} made {
                event.wines.map((w, i) => <WineGlass key={i} color={w.color}>{w.value}</WineGlass>)
            }</>;
        case "pass":
            return <>{player} passed</>;
        case "plant":
            const { name, yields } = vineCards[event.vineId];
            return <>{player} planted some <strong>{name}</strong> {renderYields(yields)}</>;
        case "residuals":
            return <>{player} {event.delta < 0 ? "lost" : "gained"} <Residuals>{Math.abs(event.delta)}</Residuals></>;
        case "trainWorker":
            return <>{player} trained a <Worker /></>;
        case "visitor":
            return <>{player} played <strong>{visitorCards[event.visitorId].name}</strong></>;
        case "vp":
            return <>{player} {event.delta < 0 ? "lost" : "gained"} <VP>{Math.abs(event.delta)}</VP></>;
        default:
            return JSON.stringify(event);
    }
}

const renderYields = ({ red, white }: VineYields): React.ReactNode => {
    return <>
        {red ? <Grape color="red">{red}</Grape> : null}
        {white ? <Grape color="white">{white}</Grape> : null}
    </>;
}

const mapStateToProps = (state: AppState): {
    players: Record<string, PlayerState>;
    playerNameById: Record<string, string>;
    activityLog: ActivityLog;
} => {
    const game = state.game!;
    return {
        players: game.players,
        playerNameById: Object.fromEntries(
            Object.entries(state.room.users).map(([id, user]) => [id, user.name])
        ),
        activityLog: game.activityLog,
    };
};
export default connect(mapStateToProps)(Sidebar);
