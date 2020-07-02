import "./ChooseCardPrompt.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { ChooseCardPromptState } from "../../game-data/prompts/PromptState";
import { chooseCards } from "../../game-data/prompts/promptActions";
import { CardId } from "../../game-data/GameState";
import { vineCards } from "../../game-data/vineCards";
import { orderCards } from "../../game-data/orderCards";
import VineCard from "../cards/VineCard";
import OrderCard from "../cards/OrderCard";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import VisitorCard from "../cards/VisitorCard";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";

interface Props {
    prompt: ChooseCardPromptState;
    onSelectCards: (cards: CardId[]) => void;
}

const ChooseCardPrompt: React.FunctionComponent<Props> = ({ prompt, onSelectCards }) => {
    const [selectedCards, setSelectedCards] = React.useState<CardId[]>([]);
    const handleCardClick = (id: CardId) => {
        if (prompt.style === "oneClick") {
            onSelectCards([id]);
        } else {
            setSelectedCards(
                selectedCards.indexOf(id) >= 0
                    ? selectedCards.filter(cardId => cardId !== id)
                    : [...selectedCards, id]
            );
        }
    };
    return <PromptStructure title={prompt.title}>
        <div className="ChooseCardPrompt-body">
            <ul className="ChooseCardPrompt-cards">
                {prompt.cards.map((card, i) => {
                    return <li className="ChooseCardPrompt-card" key={card.id.id}>
                        <button
                            className={cx({
                                "ChooseCardPrompt-cardButton": true,
                                "ChooseCardPrompt-cardButton--oneClick":
                                    prompt.style === "oneClick",
                                "ChooseCardPrompt-cardButton--selected":
                                    selectedCards.indexOf(card.id) >= 0,
                            })}
                            disabled={!!card.disabledReason}
                            onClick={() => handleCardClick(card.id)}
                        >
                            {renderCard(card.id)}
                        </button>
                    </li>;
                })}
            </ul>
            {prompt.style === "selector"
                ? <ChoiceButton
                    className="ChooseCardPrompt-confirmMulti"
                    disabled={selectedCards.length < prompt.numCards}
                    onClick={() => onSelectCards(selectedCards)}
                >
                    Confirm ({selectedCards.length} card{selectedCards.length !== 1 ? "s" : ""})
                </ChoiceButton>
                : prompt.optional
                    ? <ChoiceButton
                        className="ChooseCardPrompt-pass"
                        onClick={() => onSelectCards([])}
                    >
                        Pass
                    </ChoiceButton>
                    : null}
        </div>
    </PromptStructure>;
};

const renderCard = (card: CardId) => {
    switch (card.type) {
        case "vine":
            return <VineCard cardData={vineCards[card.id]} />;

        case "order":
            return <OrderCard cardData={orderCards[card.id]} />;

        case "visitor":
            return <VisitorCard cardData={visitorCards[card.id]} />;
    }
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string; }) => {
    return {
        onSelectCards: (cards: CardId[]) => dispatch(chooseCards(cards, ownProps.playerId)),
    };
};

export default connect(null, mapDispatchToProps)(ChooseCardPrompt);
