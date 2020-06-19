import * as React from "react";
import { connect } from "react-redux";
import { PlayerState } from "../game-data/GameState";
import SidebarPlayer from "./SidebarPlayer";
import "./Sidebar.css";
import { AppState } from "../store/AppState";
import { ActivityLog } from "../game-data/ActivityLog";

interface Props {
    players: Record<string, PlayerState>;
    activityLog: ActivityLog;
}

const Sidebar: React.FunctionComponent<Props> = props => {
    return <div className="Sidebar">
        {Object.values(props.players).map(player => {
            return <SidebarPlayer key={player.id} player={player} />;
        })}
        <div className="Sidebar-gameLog">
            {props.activityLog.map((event, i) => {
                return <div key={i}>{JSON.stringify(event)}</div>;
            })}
        </div>
    </div>;
};


const mapStateToProps = (state: AppState) => {
    return {
        players: state.game.players,
        activityLog: state.game.activityLog,
    };
};
export default connect(mapStateToProps)(Sidebar);
