import * as React from "react";
import { VisitorCardData } from "../game-data/winterVisitorCards";
import "./VisitorCard.css";

interface Props {
    type: "summer" | "winter";
    cardData: VisitorCardData;
}

const VisitorCard: React.FunctionComponent<Props> = props => {
    const { name, description } = props.cardData;
    return <div className={`VisitorCard VisitorCard--${props.type}`}>
        <div className="VisitorCard-name">{name}</div>
        <p className="VisitorCard-description">{description}</p>
    </div>;
};

export default VisitorCard;
