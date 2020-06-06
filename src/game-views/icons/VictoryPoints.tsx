import cx from "classnames";
import * as React from "react";
import "./VictoryPoints.css";

interface Props {
    className?: string;
}

const VictoryPoints: React.FunctionComponent<Props> = props => {
   return <span className={cx("VictoryPoints", props.className)}>
       {props.children}
    </span>;
};

export default VictoryPoints;
