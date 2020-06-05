import * as React from "react";
import { connect } from "react-redux";
import GameState, { PlayerState } from "../game-data/GameState";
import VisitorCard from "./VisitorCard";
import winterVisitorCards from "../game-data/winterVisitorCards";
import "./PlayerMat.css";
import MeepleIcon from "./MeepleIcon";
import { summerVisitorCards } from "../game-data/summerVisitorCards";

interface Props {
    playerState: PlayerState;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    return <div className={`PlayerMat PlayerMat--${props.playerState.color}`}>
        <div className="PlayerMat-header">
            <span className="PlayerMat-recurringRevenue">0</span>
            <span className="PlayerMat-coins">0</span>
            <span className="PlayerMat-victoryPoints">0</span>
            <ul className="PlayerMat-workers">
                <li className="PlayerMat-worker PlayerMat-worker--grande">
                    <MeepleIcon className="PlayerMat-workerIcon" />
                </li>
                <li className="PlayerMat-worker">
                    <MeepleIcon className="PlayerMat-workerIcon" />
                </li>
                <li className="PlayerMat-worker">
                    <MeepleIcon className="PlayerMat-workerIcon" />
                </li>
            </ul>
        </div>
        <ul className="PlayerMat-cards">
            {props.playerState.cardsInHand.winterVisitor.map(id => {
                return <li key={id} className="PlayerMat-card">
                    <VisitorCard type={"winter"} cardData={winterVisitorCards[id]} />
                </li>;
            })}
            {props.playerState.cardsInHand.summerVisitor.map(id => {
                return <li key={id} className="PlayerMat-card">
                    <VisitorCard type={"summer"} cardData={summerVisitorCards[id]} />
                </li>;
            })}
        </ul>
    </div>;
};

const mapStateToProps = (gameState: GameState, ownProps: { playerId: string }) => {
    return { playerState: gameState.players[ownProps.playerId] }
};

export default connect(mapStateToProps)(PlayerMat);
