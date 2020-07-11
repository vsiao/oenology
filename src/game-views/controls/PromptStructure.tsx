import "./PromptStructure.css";
import cx from "classnames";
import * as React from "react";
import XIcon from "../icons/XIcon";

interface Props {
    className?: string;
    title: React.ReactNode;
    onClose?: () => void;
}

const PromptStructure: React.FunctionComponent<Props> = props => {
    const [collapsed, setCollapsed] = React.useState(false);
    return <div className={cx({
        "PromptStructure": true,
        "PromptStructure--collapsed": collapsed
    }, props.className)}>
        <div className="PromptStructure-header" onClick={() => setCollapsed(!collapsed)}>
            <span className="PromptStructure-title">{props.title}</span>
            <button
                className="PromptStructure-collapseButton"
                onClick={event => {
                    event.stopPropagation();
                    setCollapsed(!collapsed);
                }}
            />
            {props.onClose
                ? <button
                    className="PromptStructure-closeButton"
                    onClick={event => {
                        event.stopPropagation();
                        props.onClose!();
                    }}
                >
                    <XIcon />
                </button>
                : null}
        </div>
        {props.children}
    </div>;
};

export default PromptStructure;
