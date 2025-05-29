import cx from "classnames";
import * as React from "react";
import "./Coins.css";

interface Props {
    children?: number | string;
    className?: string;
}

const Coins: React.FunctionComponent<Props> = props => {
   return <span className={cx("Coins", props.className)}>
       {props.children}
    </span>;
};

export default Coins;
