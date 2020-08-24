import "./PlayerCard.css";
import * as React from "react";
import { VineCardData } from "../../game-data/vineCards";
import PlayerCard from "./PlayerCard";

interface Props {
    className?: string;
    cardData: VineCardData;
}

const VineCard: React.FunctionComponent<Props> = props => {
    return <PlayerCard type="vine" className={props.className} {...props.cardData} />;
};

export default VineCard;
