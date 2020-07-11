import "./VineCard.css";
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
    return <div className={cx("VineCard", props.className)}>
        <div className="VineCard-name">{name}</div>
        <div className="VineCard-description">
            <div className="VineCard-structures">
                {structures.map(s =>
                    <div key={s} className="VineCard-structure">{capitalize(s)}</div>)}
            </div>
            <div className="VineCard-yield">
                {(Object.keys(yields) as GrapeColor[]).map(grapeColor =>
                    <Grape key={grapeColor} color={grapeColor}>{yields[grapeColor]}</Grape>)}
            </div>
        </div>
    </div>;
};

function capitalize(s: string) {
    return s[0].toUpperCase() + s.slice(1);
}

export default VineCard;
