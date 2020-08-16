import "./MamaPapaCard.css";
import cx from "classnames";
import * as React from "react";
import { MamaPapaId, mamaPapaCards, PapaCard } from "../../game-data/mamasAndPapas";
import Worker from "../icons/Worker";
import Coins from "../icons/Coins";
import Card from "../icons/Card";
import { CardType } from "../../game-data/GameState";
import VictoryPoints from "../icons/VictoryPoints";
import { structures } from "../../game-data/structures";

interface Props {
    id: MamaPapaId;
}

const MamaPapaCard: React.FunctionComponent<Props> = props => {
    const cardData = mamaPapaCards[props.id];
    return <div className={cx({
        MamaPapaCard: true,
        "MamaPapaCard--mama": cardData.type === "mama",
        "MamaPapaCard--papa": cardData.type === "papa",
    })}>
        <div className="MamaPapaCard-name">{cardData.name}</div>
        <div className="MamaPapaCard-description">
            {cardData.type === "mama"
                ? <>
                    <div>
                        Gain <Worker /> <Worker /> {
                            cardData.coins ? <Coins>{cardData.coins}</Coins> : null
                        }
                        <br />
                        Draw {Object.entries(cardData.cards).map(([type, num]) =>
                            <React.Fragment key={type}>
                                {new Array(num).fill(null).map((_, i) =>
                                    <React.Fragment key={i}>
                                        <Card key={i} type={type as CardType} />{" "}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </div>
                </>
                : <>
                    <div>
                        Gain {
                            cardData.coins ? <Coins>{cardData.coins}</Coins> : null
                        } <Worker workerType="grande" />
                        <hr className="MamaPapaCard-divider" />
                        {renderPapaChoice(cardData.choiceA)}
                        <br />
                        OR gain <Coins>{cardData.choiceB}</Coins>
                    </div>
                </>}
        </div>
    </div>;
};

const renderPapaChoice = (choice: PapaCard["choiceA"]): React.ReactNode => {
    switch (choice) {
        case "victoryPoint":
            return <>Gain <VictoryPoints>1</VictoryPoints></>;
        case "worker":
            return <>Train <Worker /></>;
        default:
            return <span className="MamaPapaCard-structure">{structures[choice].name}</span>;
    }
};

export default MamaPapaCard;
