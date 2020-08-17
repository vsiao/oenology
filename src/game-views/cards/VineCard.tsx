import "./PlayerCard.css";
import cx from "classnames";
import * as React from "react";
import { VineCardData } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import { GrapeColor } from "../../game-data/GameState";

interface Props {
    className?: string;
    cardData: VineCardData;
}

const VineCard: React.FunctionComponent<Props> = props => {
    const { name, structures, yields } = props.cardData;
    return <div className={cx("PlayerCard", "PlayerCard--vine", props.className)}>
        <div className="PlayerCard-name">{name}</div>
        <div className="PlayerCard-description">
            <div className="PlayerCard-vineStructures">
                {structures.map(s =>
                    <div key={s} className="PlayerCard-vineStructure">{capitalize(s)}</div>)}
            </div>
            {(Object.keys(yields) as GrapeColor[]).map(grapeColor =>
                <Grape key={grapeColor} color={grapeColor}>{yields[grapeColor]}</Grape>)}
        </div>
    </div>;
};

function capitalize(s: string) {
    return s[0].toUpperCase() + s.slice(1);
}

export default VineCard;
