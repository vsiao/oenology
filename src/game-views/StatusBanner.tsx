import "./StatusBanner.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { CurrentTurn, WorkerPlacementTurnPendingAction } from "../game-data/GameState";
import { SummerVisitor, WinterVisitor, Order, Vine } from "./icons/Card";
import { visitorCards } from "../game-data/visitors/visitorCards";

interface Props {
    currentTurn: CurrentTurn;
    playerNames: Record<string, string>;
    playerId: string | null;
}

const StatusBanner: React.FunctionComponent<Props> = props => {
    return <div className="StatusBanner">
        {renderStatus(props)}
    </div>;
};

const renderStatus = ({ currentTurn, playerNames, playerId }: Props) => {
    const playerName = <strong>{playerNames[currentTurn.playerId]}</strong>;
    switch (currentTurn.type) {
        case "mamaPapa":
            return <span>{playerName} is choosing their mama and papa.</span>;
        case "wakeUpOrder":
            return <span>{playerName} is picking their wake-up position.</span>;
        case "fallVisitor":
            return <span>{playerName} is picking their fall visitor.</span>;
        case "workerPlacement":
            if (currentTurn.pendingAction !== null) {
                return renderPendingActionStatus(
                    currentTurn.pendingAction,
                    playerName,
                    currentTurn.season
                );
            }
            const isCurrentPlayerTurn = currentTurn.playerId === playerId;
            return <span>
                It's {isCurrentPlayerTurn ? "your" : <>{playerName}'s</>} turn.
            </span>;
        case "endOfYearDiscard":
            return <span>{playerName} is discarding cards.</span>;
    }
};

const renderPendingActionStatus = (
    pendingAction: WorkerPlacementTurnPendingAction,
    playerName: React.ReactNode,
    season: "summer" | "winter"
): React.ReactElement => {
    switch (pendingAction.type) {
        case "buildStructure":
            return <span>{playerName} is building a structure.</span>;
        case "buyField":
            return <span>{playerName} is buying a field.</span>;
        case "buySell":
            return <span>{playerName} is selling grape(s) or buying/selling a field.</span>;
        case "fillOrder":
            return <span>{playerName} is filling an <Order />.</span>;
        case "harvestField":
            return <span>{playerName} is harvesting a field.</span>;
        case "makeWine":
            return <span>{playerName} is making some wine.</span>;
        case "plantVine":
            return <span>{playerName} is planting a <Vine />.</span>;
        case "playVisitor":
            const card = season === "summer" ? <SummerVisitor /> : <WinterVisitor />;
            if (pendingAction.visitorId) {
                const { name } = visitorCards[pendingAction.visitorId];
                return <span>{playerName} is playing the <strong>{name}</strong> {card}.</span>;
            }
            return <span>{playerName} is playing a {card}.</span>;
        case "sellField":
            return <span>{playerName} is selling a field.</span>;
        case "sellGrapes":
            return <span>{playerName} is selling grape(s).</span>;
        case "uproot":
            return <span>{playerName} is uprooting a <Vine />.</span>;
    }
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!;
    return {
        currentTurn: game.currentTurn,
        playerNames: Object.fromEntries(
            Object.keys(game.players)
                .map(playerId => [playerId, state.room.users[playerId].name])
        ),
        playerId: game.playerId,
    };
};

export default connect(mapStateToProps)(StatusBanner);
