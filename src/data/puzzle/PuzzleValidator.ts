import type { Character } from "../../gamelogic/entities/core/Character";
import type { Game } from "../../gamelogic/entities/projection/Game";
import { CharacterType } from "../../gamelogic/enums/CharacterType";
import { Team } from "../../gamelogic/enums/Team";
import { BoardQuery } from "../../gamelogic/queries/BoardQuery";
import { GameQuery } from "../../gamelogic/queries/GameQuery";
import type { PuzzleError } from "./PuzzleError";

/**
 * Checks that a game built from a puzzle is a valid puzzle.
 *
 * A puzzle is invalid if:
 * 1. It is empty
 * 2. The enemy leader is missing
 * 3. A "one per team" character (Nemesis) is duplicated in a team
 * 4. A leader is already captured or surrounded
 * 5. Several hermits or several cubs are present in the player's team
 * 6. More than one character is transformed into a frog
 *    (or a leader is transformed into a frog)
 */
export class PuzzleValidator {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * @returns every error found, in a stable order (empty if the puzzle is valid).
     */
    public static validate(game: Game): PuzzleError[] {
        const errors: PuzzleError[] = [];

        const characterPositions = BoardQuery.findCharacterPositions(game.getBoard(), null, null);
        if (!characterPositions.some((cp) => cp.character.team === Team.Black)) {
            return [{ code: "emptyPlayerTeam" }];
        }

        PuzzleValidator.checkFrogs(game, errors);

        const playerTeam = GameQuery.getPlayerTeam();

        const leaders: Character[] = [];
        const onePerTeamCharacters: Character[] = [];
        const playerHermitsAndCubs: Character[] = [];

        for (const { character } of characterPositions) {
            if (CharacterType.isLeader(character.characterType)) {
                leaders.push(character);
            }

            if (PuzzleValidator.isRestrictedToOnePerTeam(character.characterType)) {
                onePerTeamCharacters.push(character);
            }

            if (character.team === playerTeam && PuzzleValidator.isHermitOrCub(character.characterType)) {
                playerHermitsAndCubs.push(character);
            }
        }

        for (const team of Team.ALL) {
            if (BoardQuery.findLeaderPosition(game.getBoard(), team) === null) {
                // A leader is not necessary for a puzzle to be valid in the player's team.
                if (team !== playerTeam) {
                    errors.push({ code: "leaderMissing", team });
                }
                continue;
            }

            if (GameQuery.isLeaderCaptured(game, team)) {
                errors.push({ code: "leaderCaptured", team });
            }
            if (GameQuery.isLeaderSurrounded(game, team)) {
                errors.push({ code: "leaderSurrounded", team });
            }
        }

        if (leaders.length > 2 ||
            (leaders.length === 2 && leaders[0].team === leaders[1].team)) {
            errors.push({ code: "oneLeaderPerTeam" });
        }

        PuzzleValidator.checkOnePerTeam(onePerTeamCharacters, errors);

        // At most one hermit and one cub (they come as a pair in the player's team).
        if (playerHermitsAndCubs.length > 2 ||
            (playerHermitsAndCubs.length === 2 &&
                playerHermitsAndCubs[0].characterType === playerHermitsAndCubs[1].characterType)) {
            errors.push({ code: "hermitAndCubLimit" });
        }

        return errors;
    }

    private static checkFrogs(game: Game, errors: PuzzleError[]): void {
        const frogStates = game.getTransformedCharacterStates()
            .filter(state => state.characterAfter.characterType === CharacterType.Frog);

        if (frogStates.length > 1) {
            errors.push({ code: "frogLimit" });
        }
        if (frogStates.some(state => CharacterType.isLeader(state.characterBefore.characterType))) {
            errors.push({ code: "leaderTransformedIntoFrog" });
        }
    }

    /** One error per duplicated character type, whatever the team. */
    private static checkOnePerTeam(characters: readonly Character[], errors: PuzzleError[]): void {
        const duplicatedTypes = new Set<CharacterType>();
        const seen = new Set<string>();

        for (const character of characters) {
            const key = `${character.team}:${character.characterType}`;

            if (seen.has(key)) {
                duplicatedTypes.add(character.characterType);
            }
            seen.add(key);
        }

        for (const characterType of duplicatedTypes) {
            errors.push({ code: "onePerTeamCharacter", characterType });
        }
    }

    private static isRestrictedToOnePerTeam(characterType: CharacterType): boolean {
        return characterType === CharacterType.Nemesis;
    }

    private static isHermitOrCub(characterType: CharacterType): boolean {
        return characterType === CharacterType.Hermit || characterType === CharacterType.Cub;
    }
}
