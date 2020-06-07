import cx from "classnames";
import * as React from "react";
import "./Residuals.css";

interface Props {
    className?: string;
}

const Residuals: React.FunctionComponent<Props> = props => {
   return <span className={cx("Residuals", props.className)}>
      <span className="Residuals-amount">
        {props.children}
       </span>
    </span>;
};

export default Residuals;
