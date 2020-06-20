import "./PromptStructure.css";
import cx from "classnames";
import * as React from "react";

interface Props {
    className?: string;
    title: React.ReactNode;
}

const PromptStructure: React.FunctionComponent<Props> = props => {
    return <div className={cx("PromptStructure", props.className)}>
        <div className="PromptStructure-header">
            {props.title}
        </div>
        {props.children}
    </div>;
};

export default PromptStructure;
