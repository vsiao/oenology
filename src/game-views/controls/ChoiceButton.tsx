import "./ChoiceButton.css";
import cx from "classnames";
import * as React from "react";
import { useTooltip } from "../shared/useTooltip";

interface Props {
    className?: string;
    disabled?: boolean;
    disabledReason?: string | undefined;
    onClick?: () => void;
}

const ChoiceButton: React.FunctionComponent<Props> = props => {
    const [anchorRef, maybeTooltip] = useTooltip("bottom", props.disabledReason);
    const isDisabled = props.disabled || props.disabledReason !== undefined;

    return <>
        <button
            ref={props.disabledReason ? anchorRef as React.RefObject<HTMLButtonElement> : null}
            aria-disabled={isDisabled}
            className={cx({
                "ChoiceButton": true,
                "ChoiceButton--disabled": isDisabled,
            }, props.className)}
            onClick={isDisabled ? undefined : props.onClick}
        >
            {props.children}
        </button>
        {maybeTooltip}
    </>;
};

export default ChoiceButton;
