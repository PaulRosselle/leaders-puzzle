import { BoardQuery } from "../../queries/BoardQuery";
import { PlayabilityQuery } from "../../queries/PlayabilityQuery";
import type { GameHistory } from "../actions/GameHistory";
import type { Game } from "../projection/Game";
import { CharacterState } from "./CharacterState";

export class GameContext {
    private readonly characterStates: readonly CharacterState[];

    public constructor(game: Game, gameHistory: GameHistory) {
        const playableCharacterPositions = PlayabilityQuery.getPlayableCharacterPositions(game, gameHistory);

        const characterStates: CharacterState[] = [];

        for (const characterPosition of BoardQuery.findCharacterPositions(game.board, null, null)) {
            const transformedState = game.getTransformedState(characterPosition.character.id);
            
            characterStates.push(
                new CharacterState(
                    characterPosition.character,
                    characterPosition.position,
                    playableCharacterPositions.includes(characterPosition.position),
                    transformedState !== null ? transformedState.characterAfter : null
                )
            );
        }

        this.characterStates = Object.freeze(characterStates);

        Object.freeze(this);
    }

    public getCharacterStates(): readonly CharacterState[] {
        return this.characterStates;
    }
}