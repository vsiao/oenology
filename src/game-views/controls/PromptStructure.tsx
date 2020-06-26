import "./PromptStructure.css";
import cx from "classnames";
import * as React from "react";

interface Props {
    className?: string;
    title: React.ReactNode;
}

const PromptStructure: React.FunctionComponent<Props> = props => {
    const [collapsed, setCollapsed] = React.useState(false);
    return <div className={cx({
        "PromptStructure": true,
        "PromptStructure--collapsed": collapsed
    }, props.className)}>
        <div className="PromptStructure-header" onClick={() => setCollapsed(!collapsed)}>
            <svg className="PromptStructure-collapseIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 8.12">
                <path d="M13 1.62L11.38 0 6.5 4.88 1.62 0 0 1.62l6.5 6.5 6.5-6.5z"/>
            </svg>
            {props.title}
        </div>
        {props.children}
    </div>;
};

export default PromptStructure;
