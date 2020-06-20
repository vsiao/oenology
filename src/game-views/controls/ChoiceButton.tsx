import "./ChoiceButton.css";
import cx from "classnames";
import * as React from "react";

interface Props {
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}

const ChoiceButton: React.FunctionComponent<Props> = props => {
    return <button
        className={cx("ChoiceButton", props.className)}
        disabled={props.disabled}
        onClick={props.onClick}
    >
        {props.children}
    </button>
};

export default ChoiceButton;
