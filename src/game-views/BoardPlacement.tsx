import * as React from "react";
import cx from "classnames";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";

interface Props {
    title: React.ReactNode,
    onClick: () => void,
    season: string;
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, onClick, season } = props;
    return <div className={cx("BoardPlacement", `BoardPlacement--${season}`)}>
        <div className="BoardPlacement-inner">
            <div className="BoardPlacement-title">
                {title}
            </div>
            <ul className="BoardPlacement-spots">
                {new Array(3).fill(0).map((_, i) =>
                    <li key={i} className="BoardPlacement-spot" onClick={onClick}>
                        {i === 1 && <Worker />}
                    </li>
                )}
            </ul>
        </div>
    </div>;
};

export default BoardPlacement;
