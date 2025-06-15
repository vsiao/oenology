import "./SpecialWorkerCard.css";
import cx from "classnames";
import * as React from "react";
import { SpecialWorkerId, specialWorkers } from "../../game-data/specialWorkers";

interface Props {
    className?: string;
    id: SpecialWorkerId;
}

const SpecialWorkerCard: React.FC<Props> = ({ id, className }) => {
    const cardData = specialWorkers[id];
    return <div className={cx({
        SpecialWorkerCard: true,
    }, className)}>
        <div className="SpecialWorkerCard-name">{id}</div>
        <div className="SpecialWorkerCard-description">
            {cardData}
        </div>
    </div>;
};

export default SpecialWorkerCard;
