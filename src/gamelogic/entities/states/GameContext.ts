import { BoardQuery } from "../../queries/BoardQuery";
import { PlayabilityQuery } from "../../queries/PlayabilityQuery";
import type { GameHistory } from "../actions/GameHistory";
import type { Game } from "../projection/Game";
import { CharacterState } from "./CharacterState";

export class GameContext {
    private readonly characterStates: readonly CharacterState[];

    public constructor(game: Game, gameHistory: GameHistory) {
        const playableCharacters = PlayabilityQuery.getPlayableCharacters(game, gameHistory);
        const characterPositions = BoardQuery.findCharacterPositions(game.board, null, null);

        const characterStates: CharacterState[] = [];

        for (const characterPosition of characterPositions) {
            const playable = playableCharacters.some(
                playableCharacter =>
                    playableCharacter.getPosition().equals(characterPosition.position)
            );

            characterStates.push(
                new CharacterState(
                    characterPosition.character,
                    characterPosition.position,
                    playable
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