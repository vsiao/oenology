import * as React from "react";
import cx from "classnames";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";

interface Props {
    title: React.ReactNode,
    onClick: (() => void) | null,
    season: string;
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, onClick, season } = props;
    return <div
        className={cx({
            "BoardPlacement": true,
            "BoardPlacement--interactive": onClick !== null,
            [`BoardPlacement--${season}`]: true,
        })}
        onClick={onClick || undefined}
    >
        <div className="BoardPlacement-title">
            {title}
        </div>
        <ul className="BoardPlacement-spots">
            {new Array(3).fill(0).map((_, i) =>
                <li key={i} className="BoardPlacement-spot">
                    {i === 1 && <Worker />}
                </li>
            )}
        </ul>
    </div>;
};

export default BoardPlacement;
