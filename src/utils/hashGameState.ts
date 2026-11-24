import type { GameHistory } from "../gamelogic/entities/actions/GameHistory";
import type { CharacterPosition } from "../gamelogic/entities/core/CharacterPosition";
import { Position } from "../gamelogic/entities/core/Position";
import type { Game } from "../gamelogic/entities/projection/Game";
import { GameFactory } from "../gamelogic/factories/GameFactory";
import { AbilityQuery } from "../gamelogic/queries/AbilityQuery";
import { BoardQuery } from "../gamelogic/queries/BoardQuery";
import { PlayabilityQuery } from "../gamelogic/queries/PlayabilityQuery";

const GLOBAL_SEPARATOR = ";";

const CHARACTER_HASH_RANGE = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const POSITION_HASH_RANGE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const POSITION_COLUMN_OFFSETS = [0, 4, 9, 15, 22, 28, 33];

/**
 * Creates a hash representing the complete game state:
 * - Board state
 * - Characters that can still act during the turn
 * - Characters that can currently be played
 */
export function createHash(gameHistory: GameHistory): string {
    const game = GameFactory.create(gameHistory);
    const boardHash = createBoardHash(game);
    const turnHash = createTurnHash(game, gameHistory);
    const playabilityHash = createPlayabilityHash(game, gameHistory);

    return [boardHash, turnHash, playabilityHash].join(GLOBAL_SEPARATOR);
}

/**
 * Creates the hash representing the board.
 *
 * Each occupied cell contributes:
 * - Character type
 * - Character position
 */
function createBoardHash(game: Game): string {
    const characterPositions = BoardQuery.findCharacterPositions(game.board, null, null);

    return characterPositions
        .map(characterPosition =>
            createCharacterPositionHash(characterPosition)
        )
        .join("");
}

/**
 * Creates the hash representing characters that can still act.
 *
 * Each character contributes:
 * - Character type
 * - Character position
 */
function createTurnHash(game: Game, gameHistory: GameHistory): string {
    const characterPositions = BoardQuery.findCharacterPositions(game.board, null, null);

    return characterPositions
        .filter(({ character }) =>
            AbilityQuery.canAct(game, gameHistory, character)
        )
        .map(characterPosition =>
            createCharacterPositionHash(characterPosition)
        )
        .join("");
}

/**
 * Creates the hash representing playable characters.
 *
 * Each playable character contributes:
 * - Character type
 * - Character position
 * - Whether playing it is mandatory
 * - Whether its active ability can be used
 */
function createPlayabilityHash(game: Game, gameHistory: GameHistory): string {
    const playableCharacterPositions = PlayabilityQuery.getPlayableCharacterPositions(game, gameHistory);
    const characterPositions = BoardQuery.findCharacterPositions(game.board, null, null);

    return playableCharacterPositions.positions
        .map(position => {
            // Retrieve the character associated with this position.
            // Position.equals() avoids relying on object identity.
            const characterPosition = characterPositions.find(candidate => candidate.position.equals(position));

            if (!characterPosition) {
                throw new Error("Unable to find a character at a playable position.");
            }

            return createPlayableCharacterHash(
                game,
                gameHistory,
                characterPosition,
                playableCharacterPositions.isMandatory
            );
        })
        .join("");
}

/**
 * Creates the hash for one playable character.
 */
function createPlayableCharacterHash(game: Game, gameHistory: GameHistory, characterPosition: CharacterPosition, isMandatory: boolean): string {
    const characterHash = createCharacterHash(characterPosition.character);
    const positionHash = createPositionHash(characterPosition.position);
    const mandatoryHash = isMandatory ? "1" : "0";

    const activeAbilityHash =AbilityQuery.canUseActiveAbility(game, gameHistory, characterPosition.character) ? "1" : "0";

    return (
        characterHash +
        positionHash +
        mandatoryHash +
        activeAbilityHash
    );
}

/**
 * Creates the hash for a character and its position.
 */
function createCharacterPositionHash(characterPosition: CharacterPosition): string {
    return (
        createCharacterHash(characterPosition.character) +
        createPositionHash(characterPosition.position)
    );
}

/**
 * Converts a character type into its corresponding hash character.
 *
 * The numeric enum values must preserve the same order as the
 * Java CharacterType enum ordinals.
 */
function createCharacterHash(character: {characterType: number;}): string {
    const index = character.characterType;

    if (!Number.isInteger(index) || index < 0 || index >= CHARACTER_HASH_RANGE.length) {
        throw new Error(`Invalid character type for hash: ${index}`);
    }

    return CHARACTER_HASH_RANGE.charAt(index);
}

/**
 * Converts an axial position into the corresponding hash character.
 *
 * This reproduces the Java conversion from axial coordinates
 * to offset coordinates.
 */
function createPositionHash(position: Position): string {
    const { q, r } = position.coordinates;

    const x = q + Position.HEX_RADIUS;
    const y = r - Math.max(-Position.HEX_RADIUS, -q - Position.HEX_RADIUS);

    if (!Number.isInteger(x) || x < 0 || x >= POSITION_COLUMN_OFFSETS.length) {
        throw new Error(`Invalid position column for hash: ${x}`);
    }

    const index = POSITION_COLUMN_OFFSETS[x] + y + 1;

    if (!Number.isInteger(index) || index < 0 || index >= POSITION_HASH_RANGE.length) {
        throw new Error(`Invalid position index for hash: ${index}`);
    }

    return POSITION_HASH_RANGE.charAt(index);
}