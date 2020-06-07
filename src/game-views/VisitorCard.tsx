import cx from "classnames";
import * as React from "react";
import { VisitorCardData } from "../game-data/visitorCard";
import "./VisitorCard.css";

interface Props {
    type: "summer" | "winter";
    cardData: VisitorCardData;
    interactive: boolean;
    onClick?: () => void;
}

const VisitorCard: React.FunctionComponent<Props> = props => {
    const { name, description } = props.cardData;
    return <div
        className={cx({
            "VisitorCard": true,
            "VisitorCard--interactive": props.interactive,
            [`VisitorCard--${props.type}`]: true,
        })}
        onClick={props.onClick}
    >
        <div className="VisitorCard-name">{name}</div>
        <div className="VisitorCard-description">
            <p className="VisitorCard-descriptionText">{description}</p>
        </div>
    </div>;
};

export default VisitorCard;
