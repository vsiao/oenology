import "./StatusBanner.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { CurrentTurn } from "../game-data/GameState";
import { SummerVisitor, WinterVisitor, Order } from "./icons/Card";
import { visitorCards } from "../game-data/visitors/visitorCards";

interface Props {
    currentTurn: CurrentTurn;
}

const StatusBanner: React.FunctionComponent<Props> = props => {
    return <div className="StatusBanner">
        {renderStatus(props.currentTurn)}
    </div>;
};

const renderStatus = (currentTurn: CurrentTurn) => {
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
                    case "playSummerVisitor":
                        if  (currentTurn.pendingAction.visitorId) {
                            const { name } = visitorCards[currentTurn.pendingAction.visitorId];
                            return <span>{playerName} is playing the <strong>{name}</strong> <SummerVisitor />.</span>
                        }
                        return <span>{playerName} is playing a <SummerVisitor />.</span>;
                    case "playWinterVisitor":
                        if  (currentTurn.pendingAction.visitorId) {
                            const { name } = visitorCards[currentTurn.pendingAction.visitorId];
                            return <span>{playerName} is playing the <strong>{name}</strong> <WinterVisitor />.</span>
                        }
                        return <span>{playerName} is playing a <WinterVisitor />.</span>;
                }
            }
            return <>It's&nbsp;{playerName}'s turn.</>
        default:
            return JSON.stringify(currentTurn);
    }
};

const mapStateToProps = (state: AppState) => {
    return { currentTurn: state.game.currentTurn };
};

export default connect(mapStateToProps)(StatusBanner);
