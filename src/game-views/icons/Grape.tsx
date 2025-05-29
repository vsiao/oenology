import cx from "classnames";
import * as React from "react";
import { GrapeColor } from "../../game-data/GameState";
import "./Grape.css";

interface Props {
    children?: number | string;
    className?: string;
    color?: GrapeColor;
}

const Grape: React.FunctionComponent<Props> = props => {
    return <span className={cx({
        "Grape": true,
        [`Grape--${props.color}`]: props.color
    }, props.className)}>
        {props.children || <>&nbsp;</>}
    </span>;
};

export default Grape;
