import "./StatusBanner.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { CurrentTurn } from "../game-data/GameState";
import { SummerVisitor, WinterVisitor, Order } from "./icons/Card";
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
                switch (currentTurn.pendingAction.type) {
                    case "build":
                        return <span>{playerName} is building a structure.</span>;
                    case "buySell":
                        return <span>{playerName} is selling a grape or buying/selling a field.</span>;
                    case "fillOrder":
                        return <span>{playerName} is filling an <Order />.</span>;
                    case "harvest":
                        return <span>{playerName} is harvesting a field.</span>;
                    case "makeWine":
                        return <span>{playerName} is making some wine.</span>
                    case "playVisitor":
                        const card = currentTurn.season === "summer" ? <SummerVisitor /> : <WinterVisitor />;
                        if  (currentTurn.pendingAction.visitorId) {
                            const { name } = visitorCards[currentTurn.pendingAction.visitorId];
                            return <span>{playerName} is playing the <strong>{name}</strong> {card}.</span>
                        }
                        return <span>{playerName} is playing a {card}.</span>;
                }
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
