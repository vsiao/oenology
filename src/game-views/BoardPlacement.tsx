import * as React from "react";
import cx from "classnames";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";
import { BoardWorker } from "../game-data/GameState";

interface Props {
    title: React.ReactNode,
    onClick: (() => void) | undefined,
    season: string,
    workers: BoardWorker[];
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, onClick, season, workers } = props;
    return <div
        className={cx({
            "BoardPlacement": true,
            "BoardPlacement--interactive": !!onClick,
            [`BoardPlacement--${season}`]: true,
        })}
        onClick={onClick}
    >
        <div className="BoardPlacement-title">
            {title}
        </div>
        <ul className="BoardPlacement-spots">
            {new Array(3).fill(0).map((_, i) => {
                const worker = workers[i];
                return <li key={i} className="BoardPlacement-spot">
                    {worker && <Worker workerType={worker.type} color={worker.color} />}
                </li>;
            })}
        </ul>
    </div>;
};

export default BoardPlacement;
