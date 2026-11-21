import { Character } from "../entities/core/Character";
import { CharacterPath } from "../entities/core/CharacterPath";
import type { CharacterPosition } from "../entities/core/CharacterPosition";
import { TransformedState } from "../entities/projection/TransformedState";
import type { Game } from "../entities/projection/Game";
import { Action } from "../entities/actions/Action";
import type { GameHistory } from "../entities/actions/GameHistory";
import { AbilityType } from "../enums/AbilityType";
import { CharacterType } from "../enums/CharacterType";
import { BoardQuery } from "./BoardQuery";
import { GameQuery } from "./GameQuery";

/**
 * Centralizes read-only queries related to character abilities
 * whose scope goes beyond a single character's own action resolution.
 *
 * All methods are static and side-effect free.
 */
export class AbilityQuery {
    public static readonly LEADER_CAPTURE_VALUE = 2;

    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * Returns the distance between a leader cell and another cell.
     */
    private static getLeaderDistance(leaderPos: CharacterPosition, pos: CharacterPosition): number {
        return leaderPos.position.distanceTo(pos.position);
    }

    /**
     * Checks whether a cell is aligned with the leader's cell.
     */
    private static isLeaderAligned(leaderPos: CharacterPosition, pos: CharacterPosition): boolean {
        return leaderPos.position.isAligned(pos.position);
    }

    /**
     * Returns the contribution of a character to the capture of an enemy leader.
     */
    public static getCaptureContribution(enemyLeaderPos: CharacterPosition, characterPos: CharacterPosition): number {
        const character = characterPos.character;

        if (character === null) {
            throw new Error(`Invalid capture cell, no character: ${characterPos.position}`);
        }

        const characterType = character.characterType;

        if (!CharacterType.canCapture(characterType)) {
            return 0;
        }

        switch (characterType) {
            // Archer: aligned with the leader, at exactly two cells.
            case CharacterType.Archer: {
                return (
                    this.isLeaderAligned(enemyLeaderPos, characterPos) &&
                    this.getLeaderDistance(enemyLeaderPos, characterPos) === 2
                ) ? 1 : 0;
            }

            // Assassin: captures the leader alone when adjacent.
            case CharacterType.Assassin: {
                return this.getLeaderDistance(enemyLeaderPos, characterPos) === 1
                    ? this.LEADER_CAPTURE_VALUE : 0;
            }

            // Elite Archer: aligned with the leader, at a distance of one or two.
            case CharacterType.EliteArcher: {
                return (
                    this.isLeaderAligned(enemyLeaderPos, characterPos) &&
                    this.getLeaderDistance(enemyLeaderPos, characterPos) <= 2
                ) ? 1 : 0;
            }

            // Default: a character contributes one point when adjacent.
            default: {
                return this.getLeaderDistance(enemyLeaderPos, characterPos) === 1 ? 1 : 0;
            }
        }
    }

    /**
     * Determines whether a character can act during the current actions phase.
     *
     * Hermit and Cub can only act immediately after one another.
     */
    public static canAct(game: Game, gameHistory: GameHistory, character: Character): boolean {
        const currentTeam = GameQuery.getPlayerTeam();
        if (character.team !== currentTeam) {
            return false;
        }

        // Nemesis only acts through its forced reaction.
        if (character.characterType === CharacterType.Nemesis) {
            return false;
        }

        const characterActions = gameHistory.actions;

        // A character can only perform one action per turn.
        for (const action of characterActions) {
            if (action.srcCharacter.id === character.id) {
                return false;
            }
        }

        // Hermit and Cub must act immediately after one another.
        if (this.isHermitOrCub(game, character)) {

            let foundAction: Action | null = null;

            for (const action of characterActions) {
                if (this.isHermitOrCub(game, action.srcCharacter)) {
                    foundAction = action;
                    break;
                }
            }

            return (
                foundAction === null ||
                foundAction === characterActions[characterActions.length - 1]
            );
        }

        return true;
    }

    /**
     * Checks whether a character is a Hermit or a Cub,
     * either in its current form or in its original form.
     */
    private static isHermitOrCub(game: Game, character: Character): boolean {

        if (this.isHermitOrCubCharacter(character)) {
            return true;
        }

        const transformedState = game.getTransformedState(character.id);

        return (
            transformedState !== null &&
            this.isHermitOrCubCharacter(transformedState.characterBefore)
        );
    }

    /**
     * Checks whether a character belongs to the Hermit and Cub card.
     */
    private static isHermitOrCubCharacter(character: Character): boolean {
        return (
            character.characterType === CharacterType.Hermit ||
            character.characterType === CharacterType.Cub
        );
    }

    /**
     * Determines whether a character must act immediately,
     * in reaction to the last action of the phase.
     *
     * Nemesis must act immediately after an enemy leader movement.
     */
    public static mustActNow(gameHistory: GameHistory, character: Character): boolean {

        if (character.characterType !== CharacterType.Nemesis || gameHistory.actions.length === 0) {
            return false;
        }

        const characterActions = gameHistory.actions;
        const lastAction = characterActions[characterActions.length - 1];

        for (const motion of lastAction.motions) {
            for (const target of motion.targets) {

                if (
                    CharacterType.isLeader(target.character.characterType) &&
                    target.character.team !== character.team &&
                    target.originPos !== null &&
                    target.destPos !== null
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks whether a character can use its active ability.
     *
     * An active ability cannot be used if the character does not have one
     * or if it is prevented by an opposing passive ability.
     */
    public static canUseActiveAbility(game: Game, gameHistory: GameHistory, character: Character): boolean {
        const abilityTypes = CharacterType.getCharacterTypes(character.characterType);
        if (!abilityTypes.includes(AbilityType.Active)) {
            return false;
        }

        return (!this.isBlockedByJailer(game, character) &&
            !this.isBlockedByTactician(gameHistory, character));
    }

    /**
     * Checks whether the character's active ability is blocked
     * by an opposing Jailer.
     */
    private static isBlockedByJailer(game: Game, character: Character): boolean {
        const characterPosition = BoardQuery.getPositionByCharacterId(game.board, character.id);

        const adjacentCells = BoardQuery.getAdjacentCells(
            game.board,
            characterPosition.position,
            cell => {
                const adjacentCharacter = cell.getCharacter();

                return (
                    adjacentCharacter !== null &&
                    adjacentCharacter.characterType === CharacterType.Jailer &&
                    adjacentCharacter.team !== character.team
                );
            }
        );

        return adjacentCells.length > 0;
    }

    /**
     * Checks whether the character was moved by a friendly Tactician
     * during the current phase.
     */
    private static isBlockedByTactician(gameHistory: GameHistory, character: Character): boolean {
        for (const action of gameHistory.actions) {
            const sourceCharacter = action.srcCharacter;

            if (sourceCharacter.characterType !== CharacterType.Tactician ||
                sourceCharacter.team !== character.team ||
                action.motions.length !== 1) {
                continue;
            }

            const motion = action.motions[0];

            if (
                motion.targets.length === 1 &&
                motion.targets[0].character.id === character.id
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether a character can be moved by enemy abilities.
     *
     * A Protector protects itself and adjacent allies.
     */
    public static canBeMovedByEnemyAbilities(game: Game, character: Character): boolean {
        if (character.characterType === CharacterType.Protector) {
            return false;
        }

        const characterPosition = BoardQuery.getPositionByCharacterId(game.board, character.id);

        const adjacentProtectors = BoardQuery.getAdjacentCells(
            game.board,
            characterPosition.position,
            cell => {
                const adjacentCharacter = cell.getCharacter();

                return (
                    adjacentCharacter !== null &&
                    adjacentCharacter.characterType === CharacterType.Protector &&
                    adjacentCharacter.team === character.team
                );
            }
        );

        return adjacentProtectors.length === 0;
    }

    /**
     * Returns the transformed state of the character currently
     * transformed into a Frog.
     *
     * Throws if more than one transformed Frog exists.
     */
    public static getExistingTransformedFrogState(game: Game): TransformedState | null {
        let transformedFrogState: TransformedState | null = null;

        for (const transformedState of game.getTransformedCharacterStates()) {

            if (transformedState.characterAfter.characterType === CharacterType.Frog) {
                if (transformedFrogState !== null) {
                    throw new Error("There can be only one transformed frog on the board");
                }

                transformedFrogState = transformedState;
            }
        }

        return transformedFrogState;
    }

    /**
     * Returns the paths the specified character can take
     * using its normal movement.
     *
     * Handles passive abilities impacting other characters.
     * Nemesis uses its own movement algorithm.
     */
    public static getNormalMovementPaths(game: Game, character: Character): CharacterPath[] {
        if (character.characterType === CharacterType.Nemesis) {
            throw new Error(
                "Nemesis movement logic is handled apart from the generic movement function"
            );
        }

        // Leaders can move two cells if a friendly Vizier is present.
        const isEnhancedMovement = (
            CharacterType.isLeader(character.characterType) &&
            BoardQuery.findCharacterPositions(
                game.board,
                character.team,
                CharacterType.Vizier
            ).length > 0
        );

        const characterPosition = BoardQuery.getPositionByCharacterId(
            game.board,
            character.id
        );

        return BoardQuery.getEmptyPathsAround(
            game.board,
            characterPosition.position,
            isEnhancedMovement ? 2 : 1,
            true
        );
    }
}
