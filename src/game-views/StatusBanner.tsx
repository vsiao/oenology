import "./StatusBanner.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { CurrentTurn, WorkerPlacementTurnPendingAction } from "../game-data/GameState";
import { SummerVisitor, WinterVisitor, Order, Vine } from "./icons/Card";
import { visitorCards } from "../game-data/visitors/visitorCards";
import { Dispatch } from "redux";
import { GameAction } from "../game-data/gameActions";
import { pass } from "../game-data/board/boardActions";

interface Props {
    currentTurn: CurrentTurn;
    playerId: string | null;
    passTurn: () => void;
}

const StatusBanner: React.FunctionComponent<Props> = props => {
    return <div className="StatusBanner">
        {renderStatus(props)}
    </div>;
};

const renderStatus = ({ currentTurn, playerId, passTurn }: Props) => {
    const playerName = <strong>{currentTurn.playerId}</strong>;
    switch (currentTurn.type) {
        case "workerPlacement":
            if (currentTurn.pendingAction !== null) {
                return renderPendingActionStatus(
                    currentTurn.pendingAction,
                    playerName,
                    currentTurn.season
                );
            }
            const isCurrentPlayerTurn = currentTurn.playerId === playerId;
            return <>
                It's&nbsp;{isCurrentPlayerTurn ? "your" : <>{playerName}'s</>} turn.
                {isCurrentPlayerTurn ? <>&nbsp;<button onClick={passTurn}>Pass</button></> : null}
            </>;
        default:
            return JSON.stringify(currentTurn);
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
            return <span>{playerName} is making some wine.</span>
        case "plantVine":
            return <span>{playerName} is planting a <Vine />.</span>
        case "playVisitor":
            const card = season === "summer" ? <SummerVisitor /> : <WinterVisitor />;
            if  (pendingAction.visitorId) {
                const { name } = visitorCards[pendingAction.visitorId];
                return <span>{playerName} is playing the <strong>{name}</strong> {card}.</span>
            }
            return <span>{playerName} is playing a {card}.</span>;
        case "sellField":
            return <span>{playerName} is selling a field.</span>
        case "sellGrapes":
            return <span>{playerName} is selling grape(s).</span>
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        currentTurn: state.game.currentTurn,
        playerId: state.playerId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return { passTurn: () => dispatch(pass()) };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatusBanner);
