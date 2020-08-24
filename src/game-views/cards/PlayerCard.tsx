import cx from "classnames";
import * as React from "react";
import { WineSpec } from "../../game-data/orderCards";
import { VineYields } from "../../game-data/vineCards";
import { StructureId } from "../../game-data/structures";
import { GrapeColor } from "../../game-data/GameState";
import WineGlass from "../icons/WineGlass";
import Grape from "../icons/Grape";
import VictoryPoints from "../icons/VictoryPoints";
import Residuals from "../icons/Residuals";
import "./PlayerCard.css";

interface Props {
    type: string;
    className?: string,
    name: string,
    description?: React.ReactNode;
    structures?: Array<StructureId>;
    yields?: VineYields,
    wines?: WineSpec[];
    victoryPoints?: number,
    residualIncome?: number,
}

const PlayerCard: React.FunctionComponent<Props> = props => {
    const { type, name, description, structures, yields, wines, victoryPoints, residualIncome } = props;
    return <div className={cx("PlayerCard", {
        [`PlayerCard--${type}`]: type
    }, props.className)}>
        <div className="PlayerCard-name">{name}</div>
        <div className="PlayerCard-description">
            {description && <div className="PlayerCard-descriptionText">{description}</div>}
            {structures && (
                <div className="PlayerCard-vineStructures">
                    {structures.map(s => (
                        <div key={s} className="PlayerCard-vineStructure">{capitalize(s)}</div>
                    ))}
                </div>
            )}
            {yields && (Object.keys(yields) as GrapeColor[]).map(grapeColor =>
                <Grape key={grapeColor} color={grapeColor}>{yields[grapeColor]}</Grape>)}
            {wines && wines.map(wine => (
                <WineGlass key={`${wine.color}${wine.value}`} className="PlayerCard-wine" color={wine.color}>{wine.value}</WineGlass>
            ))}
            {!!(victoryPoints || residualIncome) && (
                <div className="PlayerCard-rewards">
                    {victoryPoints && <VictoryPoints>{victoryPoints}</VictoryPoints>}
                    {residualIncome && <Residuals>{residualIncome}</Residuals>}
                </div>
            )}
        </div>
    </div>;
};

function capitalize(s: string) {
    return s[0].toUpperCase() + s.slice(1);
}

export default PlayerCard;
