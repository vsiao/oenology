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

interface Props {
    players: Record<string, PlayerState>;
    activityLog: ActivityLog;
}

const Sidebar: React.FunctionComponent<Props> = props => {
    return <div className="Sidebar">
        <div className="Sidebar-players">
            {Object.values(props.players).map(player => {
                return <SidebarPlayer key={player.id} player={player} />;
            })}
        </div>
        <div className="Sidebar-activityLog">
            <div className="Sidebar-activityLogContents">
                {props.activityLog.map((event, i) => {
                    return <div key={i}>{renderActivity(event)}</div>;
                })}
            </div>
        </div>
    </div>;
};

const renderActivity = (event: ActivityLogEvent): React.ReactNode => {
    const player = <strong>{event.playerId}</strong>;
    switch (event.type) {
        case "build":
            return <>{player} built the <strong>{structures[event.structureId].name}</strong></>;
        case "draw":
            return <>{player} drew {event.cards.map((t, i) => <Card key={i} type={t} />)}</>;
        case "buySellField":
            return <>{player} {event.buy ? "bought" : "sold"} a <Coins>{event.value}</Coins> field</>;
        case "harvest":
            return <>{player} harvested {renderYields(event.yields)}</>;
        case "makeWine":
            return <>{player} made some wine</>; // TODO
        case "pass":
            return <>{player} passed</>;
        case "plant":
            const { name, yields } = vineCards[event.vineId];
            return <>{player} planted some <strong>{name}</strong> {renderYields(yields)}</>;
        case "trainWorker":
            return <>{player} trained a <Worker /></>;
        case "visitor":
            return <>{player} played <strong>{visitorCards[event.visitorId].name}</strong></>;
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

const mapStateToProps = (state: AppState) => {
    return {
        players: state.game.players,
        activityLog: state.game.activityLog,
    };
};
export default connect(mapStateToProps)(Sidebar);
