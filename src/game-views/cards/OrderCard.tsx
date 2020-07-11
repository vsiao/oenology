import "./OrderCard.css";
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
    return <div className={cx("OrderCard", props.className)}>
        <div className="OrderCard-name">Order</div>
        <div className="OrderCard-description">
            <div className="OrderCard-wines">
                {wines.map(wine => (
                    <WineGlass key={`${wine.color}${wine.value}`} className="OrderCard-wine" color={wine.color}>{wine.value}</WineGlass>
                ))}
            </div>
            <div className="OrderCard-rewards">
                <VictoryPoints>{victoryPoints}</VictoryPoints>
                <Residuals>{residualIncome}</Residuals>
            </div>
        </div>
    </div>;
};

export default OrderCard;
