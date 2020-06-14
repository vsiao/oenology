import * as React from "react";
import cx from "classnames";
import { WineColor } from "../../game-data/GameState";
import "./WineGlass.css";

interface Props {
    color?: WineColor;
    className?: string;
}

const WineGlass: React.FunctionComponent<Props> = props => {
    return <span className={cx("WineGlass", props.className, {
        [`WineGlass--${props.color}`]: props.color
    })}>
        <svg className="WineGlass-svg" xmlns="http://www.w3.org/2000/svg" viewBox="6 8 12 14">
            <path d="M12.062 21.313H12h.062zM15.438 8.52H12v.001H8.562S7.02 13.688 7.02 16.438s1.901 4.476 2.292 4.668c.387.189.688.316 2.688.316s2.301-.127 2.688-.316c.392-.193 2.293-1.918 2.293-4.669-.001-2.75-1.543-7.917-1.543-7.917z" />
        </svg>
        <span className="WineGlass-value">
            {props.children}
        </span>
    </span>;
};

export default WineGlass;
