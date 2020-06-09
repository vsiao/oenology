import * as React from "react";
import { VineCardData } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import { GrapeColor } from "../../game-data/GameState";
import "./VineCard.css";

interface Props {
    cardData: VineCardData;
}

const VineCard: React.FunctionComponent<Props> = props => {
    const { name, structures, yields } = props.cardData;
    return <div className="VineCard">
        <div className="VineCard-name">{name}</div>
        <div className="VineCard-description">
            <div className="VineCard-structures">
                {structures.map(s =>
                    <div key={s} className="VineCard-structure">{truncateStructure(s)}</div>)}
            </div>
            <div className="VineCard-yield">
                {(Object.keys(yields) as GrapeColor[]).map(grapeColor =>
                    <Grape key={grapeColor} color={grapeColor}>{yields[grapeColor]}</Grape>)}
            </div>
        </div>
    </div>;
};

function truncateStructure(s: string) {
    return s[0].toUpperCase() + s[1];
}

export default VineCard;
