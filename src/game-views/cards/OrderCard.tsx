import "./PlayerCard.css";
import * as React from "react";
import { OrderCardData } from "../../game-data/orderCards";
import PlayerCard from "./PlayerCard";

interface Props {
    className?: string;
    cardData: OrderCardData;
}

const OrderCard: React.FunctionComponent<Props> = props => {
    return <PlayerCard type="order" className={props.className} name="Order" {...props.cardData} />;
};

export default OrderCard;
