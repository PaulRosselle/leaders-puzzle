import { Board } from './Board';
import { Character } from '../core/Character';
import { TransformedState } from './TransformedState';

export class Game {
    public readonly board: Board;

    private readonly charactersTransformedState: Map<string, TransformedState>;

    private constructor(board: Board, charactersTransformedState: Map<string, TransformedState>) {
        this.board = board;
        this.charactersTransformedState = charactersTransformedState;
    }

    /**
     * Creates a deep copy of an existing game.
     */
    public static copy(refGame: Game): Game {
        return new Game(
            new Board(refGame.board),
            new Map(refGame.charactersTransformedState)
        );
    }

    /**
     * Returns the game board.
     */
    public getBoard(): Board {
        return this.board;
    }

    /**
     * Returns the transformed state of a character.
     *
     * @param characterId the identifier of the character
     * @returns the transformed state, or undefined if the character is not transformed
     */
    public getTransformedState(characterId: string): TransformedState | undefined {
        return this.charactersTransformedState.get(characterId);
    }

    /**
     * Records that a character has been transformed.
     *
     * @param characterBefore the character before its transformation
     * @param characterAfter the character after its transformation
     */
    public addTransformedState(characterBefore: Character, characterAfter: Character): void {
        if (this.charactersTransformedState.has(characterBefore.id)) {
            throw new Error(`Already transformed character: ${characterBefore.id}`);
        }

        this.charactersTransformedState.set(
            characterAfter.id,
            new TransformedState(characterBefore, characterAfter)
        );
    }

    /**
     * Removes the transformed state associated with the given character.
     *
     * @param characterId the ID of the character whose transformed state should be removed
     */
    public removeTransformedState(characterId: string): void {
        if (!this.charactersTransformedState.has(characterId)) {
            throw new Error(`No transformed character found for ID: ${characterId}`);
        }

        this.charactersTransformedState.delete(characterId);
    }

    /**
     * Returns the transformed states of all characters.
     */
    public getTransformedCharacterStates(): readonly TransformedState[] {
        return Array.from(this.charactersTransformedState.values());
    }
}
