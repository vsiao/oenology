import cx from "classnames";
import * as React from "react";
import { VisitorCardData } from "../../game-data/visitors/visitorCards";
import "./VisitorCard.css";

interface Props {
    className?: string;
    cardData: VisitorCardData;
}

const VisitorCard: React.FunctionComponent<Props> = props => {
    const { name, description, season } = props.cardData;
    return <div
        className={cx({
            "VisitorCard": true,
            [`VisitorCard--${season}`]: true,
        }, props.className)}
    >
        <div className="VisitorCard-name">{name}</div>
        <div className="VisitorCard-description">
            <p className="VisitorCard-descriptionText">{description}</p>
        </div>
    </div>;
};

export default VisitorCard;
