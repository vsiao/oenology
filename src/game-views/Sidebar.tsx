import cx from "classnames";
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
import { useTooltip } from "./shared/useTooltip";
import VisitorCard from "./cards/VisitorCard";

interface Props {
    players: PlayerState[];
    playerNameById: Record<string, string>;
    grapeOwner?: string;
    activityLog: ActivityLog;
}

const Sidebar: React.FunctionComponent<Props> = props => {
    return <div className="Sidebar">
        <div className="Sidebar-players">
            {props.players.map(player => {
                return <SidebarPlayer key={player.id} player={player} hasGrape={player.id === props.grapeOwner} />;
            })}
        </div>
        <div className="Sidebar-activityLog">
            <div className="Sidebar-activityLogContents">
                {props.activityLog.map((event, i) =>
                    event.type !== "placeWorker"
                        ? <ActivityLogItem key={i} event={event} playerNameById={props.playerNameById} />
                        : null
                )}
            </div>
        </div>
    </div>;
};

const ActivityLogItem: React.FunctionComponent<{
    event: ActivityLogEvent;
    playerNameById: Record<string, string>;
}> = ({ event, playerNameById }) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [nodeRef, maybeLayer] = useTooltip(
        "left",
        React.useMemo(() => {
            if (event.type === "visitor") {
                return <VisitorCard className="Sidebar-visitorTip" cardData={visitorCards[event.visitorId]} />;
            }
            return null;
        }, [event])
    );

    React.useEffect(() => {
        // Force a reflow so that the adding a new class on next render will trigger a transition
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        nodeRef.current && nodeRef.current.scrollTop;
        setIsMounted(true);
    }, [nodeRef]);

    return <>
        <div ref={nodeRef as React.RefObject<HTMLDivElement>} className={cx({
            "Sidebar-activityLogItem": true,
            "Sidebar-activityLogItem--enter": isMounted,
            "Sidebar-activityLogItem--seasonSeparator": event.type === "season",
        })}>
            {renderActivity(event, playerNameById)}
        </div>
        {maybeLayer}
    </>;
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
        case "discard":
            return <>{player} discarded {event.cards.map((t, i) => <Card key={i} type={t} />)}</>;
        case "discardGrapes":
            return <>{player} discarded {event.grapes.map((g, i) => <Grape key={i} color={g.color}>{g.value}</Grape>)}</>;
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
        case "uproot":
            const { name, yields } = vineCards[event.vineId];
            return <>{player} {event.type === "plant" ? "planted" : "uprooted"} some <strong>{name}</strong> {renderYields(yields)}</>;
        case "residuals":
            return <>{player} {event.delta < 0 ? "lost" : "gained"} <Residuals>{Math.abs(event.delta)}</Residuals></>;
        case "sellGrapes":
            return <>{player} sold {event.grapes.map((g, i) => <Grape key={i} color={g.color}>{g.value}</Grape>)}</>;
        case "trainWorker":
            return <>{player} trained a <Worker /></>;
        case "visitor":
            return <>{player} played <strong>{visitorCards[event.visitorId].name}</strong></>;
        case "vp":
            return <>{player} {event.delta < 0 ? "lost" : "gained"} <VP>{Math.abs(event.delta)}</VP></>;
    }
};

const renderYields = ({ red, white }: VineYields): React.ReactNode => {
    return <>
        {red ? <Grape color="red">{red}</Grape> : null}
        {white ? <Grape color="white">{white}</Grape> : null}
    </>;
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!;
    const grapeOwner = game.tableOrder[game.grapeIndex];
    return {
        players: game.tableOrder.map(id => game.players[id]),
        playerNameById: Object.fromEntries(
            Object.entries(game.players).map(([id, p]) => [id, p.name])
        ),
        grapeOwner,
        activityLog: game.activityLog,
    };
};
export default connect(mapStateToProps)(Sidebar);
