import cx from "classnames";
import * as React from "react";
import { VisitorCardData } from "../../game-data/visitors/visitorCards";
import "./PlayerCard.css";

interface Props {
    className?: string;
    cardData: VisitorCardData;
}

const VisitorCard: React.FunctionComponent<Props> = props => {
    const { name, description, season } = props.cardData;
    return <div
        className={cx({
            "PlayerCard": true,
            [`PlayerCard--${season}Visitor`]: true,
        }, props.className)}
    >
        <div className="PlayerCard-name">{name}</div>
        <div className="PlayerCard-description">
            <p className="PlayerCard-descriptionText">{description}</p>
        </div>
    </div>;
};

export default VisitorCard;
