import "./ChooseCardPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { ChooseCardPromptState } from "../../game-data/prompts/PromptState";
import { chooseCard } from "../../game-data/prompts/promptActions";
import { CardId } from "../../game-data/GameState";
import { vineCards } from "../../game-data/vineCards";
import { orderCards } from "../../game-data/orderCards";
import VineCard from "../cards/VineCard";
import OrderCard from "../cards/OrderCard";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import VisitorCard from "../cards/VisitorCard";
import PromptStructure from "./PromptStructure";

interface Props {
    prompt: ChooseCardPromptState;
    onSelectCard: (card: CardId) => void;
}

const ChooseCardPrompt: React.FunctionComponent<Props> = props => {
    const { prompt } = props;
    return <PromptStructure title={prompt.title}>
        <ul className="ChooseCardPrompt-cards">
            {prompt.cards.map((card, i) => {
                return <li className="ChooseCardPrompt-card" key={card.id}>
                    <button
                        className="ChooseCardPrompt-cardButton"
                        onClick={ () => props.onSelectCard(card)}
                    >
                        {renderCard(card, props)}
                    </button>
                </li>;
            })}
        </ul>
    </PromptStructure>;
};

const renderCard = (card: CardId, props: Props) => {
    switch (card.type) {
        case "vine":
            return <VineCard cardData={vineCards[card.id]} />;

        case "order":
            return <OrderCard cardData={orderCards[card.id]} />;

        case "visitor":
            return <VisitorCard cardData={visitorCards[card.id]} />;
    }
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string }) => {
    return {
        onSelectCard: (card: CardId) => dispatch(chooseCard(card, ownProps.playerId))
    };
}

export default connect(null, mapDispatchToProps)(ChooseCardPrompt);
