import "./ChooseCardPrompt.css";
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
    return <PromptStructure title={prompt.title}>
        <ul className="ChooseCardPrompt-cards">
            {prompt.cards.map((card, i) => {
                return <li className="ChooseCardPrompt-card" key={card.id.id}>
                    <button
                        className="ChooseCardPrompt-cardButton"
                        disabled={!!card.disabledReason}
                        onClick={() => onSelectCards([card.id])}
                    >
                        {renderCard(card.id)}
                    </button>
                </li>;
            })}
            {prompt.optional
                ? <ChoiceButton
                    className="ChooseCardPrompt-pass"
                    onClick={() => onSelectCards([])}
                >
                    Pass
                  </ChoiceButton>
                : null}
        </ul>
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
