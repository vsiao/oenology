import "./PlayerCard.css";
import cx from "classnames";
import * as React from "react";
import { OrderCardData } from "../../game-data/orderCards";
import WineGlass from "../icons/WineGlass";
import VictoryPoints from "../icons/VictoryPoints";
import Residuals from "../icons/Residuals";

interface Props {
    className?: string;
    cardData: OrderCardData;
}

const OrderCard: React.FunctionComponent<Props> = props => {
    const { wines, victoryPoints, residualIncome } = props.cardData;
    return <div className={cx("PlayerCard", "PlayerCard--order", props.className)}>
        <div className="PlayerCard-name">Order</div>
        <div className="PlayerCard-description">
            {wines.map(wine => (
                <WineGlass key={`${wine.color}${wine.value}`} className="PlayerCard-wine" color={wine.color}>{wine.value}</WineGlass>
            ))}
            <div className="PlayerCard-orderRewards">
                <VictoryPoints>{victoryPoints}</VictoryPoints>
                <Residuals>{residualIncome}</Residuals>
            </div>
        </div>
    </div>;
};

export default OrderCard;
