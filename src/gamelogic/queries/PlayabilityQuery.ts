
import type { Character } from "../entities/core/Character";
import { PlayableCharacter } from "../entities/core/PlayableCharacter";
import type { Game } from "../entities/projection/Game";
import type { GameHistory } from "../entities/actions/GameHistory";
import { AbilityQuery } from "./AbilityQuery";
import { BoardQuery } from "./BoardQuery";
import { CharacterPosition } from "../entities/core/CharacterPosition";

export class PlayabilityQuery {

    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * Gets the next interaction request for a character.
     *
     * @param game The current game state.
     * @param gameHistory The game history.
     * @param character The character to evaluate.
     * @returns The next interaction request, or null if none exists.
     */
    // private static getCharacterActionRequest(game: Game, gameHistory: GameHistory, character: Character): InteractionRequest | null {
    //     const resolver = CharacterActionResolverFactory.create(game, gameHistory, character);
    //     const builder = new CharacterActionBuilder(character);

    //     return resolver.getNextInteraction(builder);
    // }

    /**
     * Checks whether a character has at least one valid action.
     *
     * @param game The current game state.
     * @param gameHistory The game history.
     * @param character The character to evaluate.
     * @returns True if the character has at least one legal target.
     */
    private static hasValidAction(game: Game, gameHistory: GameHistory, character: Character): boolean {
        // const request = this.getCharacterActionRequest(game, gameHistory, character);

        // return request !== null && request.legalTargets.length > 0;
        return false; // TODO
    }

    /**
     * Returns the playable characters for the current action phase.
     *
     * A character can only be playable during a valid ActionsPhase.
     *
     * If a character has an immediate action requirement, only that
     * character is returned. Otherwise, all characters currently
     * allowed to act are returned, with their mandatory status.
     *
     * @param game The current game state.
     * @param gameHistory The game history.
     * @returns The list of playable characters.
     * @throws Error if the current phase is not an ActionsPhase.
     */
    public static getPlayableCharacters(game: Game, gameHistory: GameHistory): PlayableCharacter[] {
        const playableCharacters: PlayableCharacter[] = [];

        const characterPositions = BoardQuery.findCharacterPositions(game.board, null, null);

        for (const characterPos of characterPositions) {
            const character = characterPos.character;

            // If a character is forced to play immediately, we return them alone.
            if (AbilityQuery.mustActNow(gameHistory, character) &&
                this.hasValidAction(game, gameHistory, character)) {
                return [new PlayableCharacter(characterPos, true)];
            }

            // If a character is allowed to act, we add them to the list.
            if (AbilityQuery.canAct(game, gameHistory, character)) {
                playableCharacters.push(new PlayableCharacter(characterPos, false));
            }
        }

        return playableCharacters;
    }
}