import "./StarToken.css";
import cx from "classnames";
import { motion } from "framer-motion";
import * as React from "react";
import { PlayerColor } from "../../game-data/GameState";

interface Props {
    className?: string;
    color?: PlayerColor;
    isPlaceholder?: boolean;

    // If set, will animate instances of this worker with the given id
    animateWithId?: string;
}

const StarToken: React.FunctionComponent<Props> = ({ className, isPlaceholder, color, animateWithId }) => {
    return <motion.span
        className={cx("StarToken", className)}
        {...(animateWithId === undefined
            ? null
            : {
                layout: true,
                layoutId: animateWithId,
            })}
    >
        &nbsp;
        <svg
            className={cx({
                "StarToken-icon": true,
                [`StarToken-icon--${color}`]: color,
                "StarToken-icon--placeholder": isPlaceholder,
            })}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 24 24"
        >
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
        </svg>
    </motion.span>;
};

export default StarToken;

