import cx from "classnames";
import * as React from "react";
import { VisitorCardData } from "../../game-data/visitors/visitorCards";
import PlayerCard from "./PlayerCard";

interface Props {
    className?: string;
    cardData: VisitorCardData;
}

const VisitorCard: React.FunctionComponent<Props> = props => {
    const { name, description, season } = props.cardData;
    return <PlayerCard type={`${season}Visitor`} className={props.className} name={name} description={description} />;
};

export default VisitorCard;
