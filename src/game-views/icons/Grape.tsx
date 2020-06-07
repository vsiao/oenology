import cx from "classnames";
import * as React from "react";
import { GrapeColor } from "../../game-data/GameState";
import "./Grape.css";

interface Props {
    color?: GrapeColor;
}

const Grape: React.FunctionComponent<Props> = props => {
    return <span className={cx("Grape", {
        [`Grape--${props.color}`]: props.color
    })}>
        {props.children}
    </span>;
};

export default Grape;
