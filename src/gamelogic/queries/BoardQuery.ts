import { Board } from "../entities/projection/Board";
import { Cell } from "../entities/projection/Cell";
import { Character } from "../entities/core/Character";
import { CharacterPath } from "../entities/core/CharacterPath";
import { Position } from "../entities/core/Position";
import { CharacterType } from "../enums/CharacterType";
import { Direction } from "../enums/Direction";
import { Team } from "../enums/Team";
import { CharacterPosition } from "../entities/core/CharacterPosition";

export class BoardQuery {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * Returns whether the specified character matches the given criteria.
     *
     * @param character the character to test.
     * @param team the team to match, or null for any team.
     * @param characterType the character type to match, or null for any type.
     */
    private static characterMatches(character: Character, 
                                    team: Team | null, 
                                    characterType: CharacterType | null): boolean {
        return (
            (team === null || character.team === team) &&
            (characterType === null || character.characterType === characterType)
        );
    }

    /**
     * Returns all positions containing a character matching the specified criteria.
     */
    public static findCharacterPositions(board: Board,
                                         characterTeam: Team | null,
                                         characterType: CharacterType | null): CharacterPosition[] {
        const matchingCharacterPositions: CharacterPosition[] = [];

        for (const cell of board.getCells()) {
            const character = cell.getCharacter();

            if (character !== null &&
                BoardQuery.characterMatches(character, characterTeam, characterType)) {
                matchingCharacterPositions.push(new CharacterPosition(character, cell.getPosition()));
            }
        }

        return matchingCharacterPositions;
    }

    /**
     * Returns the first visible character position in the given direction
     * whose character matches the specified criteria.
     *
     * Empty cells are skipped. The first encountered character stops the search.
     */
    public static findVisibleCharacterPosition(board: Board, 
                                               position: Position, 
                                               direction: Direction,
                                               characterTeam: Team | null, 
                                               characterType: CharacterType | null): CharacterPosition | null {
        let currentPosition = position.adjacent(direction);

        while (currentPosition !== null) {
            const cell = board.getCell(currentPosition);
            const character = cell.getCharacter();

            if (character !== null) {
                return BoardQuery.characterMatches(character, characterTeam, characterType) ? 
                    new CharacterPosition(character, cell.getPosition()) : null;
            }

            currentPosition = currentPosition.adjacent(direction);
        }

        return null;
    }

    /**
     * Finds visible characters in each direction from the given position.
     */
    public static findVisibleCharacterPositions(board: Board, position: Position,
                                                characterTeam: Team | null,
                                                characterType: CharacterType | null,
                                                ignoreAdjacentCells: boolean): CharacterPosition[] {
        const visibleCharacterPositions: CharacterPosition[] = [];

        for (const direction of Direction.ALL) {
            let startPosition = position;

            if (ignoreAdjacentCells) {
                const adjacentCell = BoardQuery.findAdjacentCell(board, position, direction);

                if (adjacentCell === null || adjacentCell.getCharacter() !== null) {
                    continue;
                }

                startPosition = adjacentCell.getPosition();
            }

            const visibleCharacterPosition = BoardQuery.findVisibleCharacterPosition(
                board, startPosition, direction, characterTeam, characterType
            );

            if (visibleCharacterPosition !== null) {
                visibleCharacterPositions.push(visibleCharacterPosition);
            }
        }

        return visibleCharacterPositions;
    }

    /**
     * Returns the position occupied by the leader of the specified team.
     */
    public static findLeaderPosition(board: Board, team: Team): CharacterPosition | null {
        for (const cell of board.getCells()) {
            const character = cell.getCharacter();

            if (character !== null &&
                character.team === team &&
                CharacterType.isLeader(character.characterType)) {
                return new CharacterPosition(character, cell.getPosition());
            }
        }

        return null;
    }

    /**
     * Returns the cell adjacent to the given position in the specified direction.
     */
    public static findAdjacentCell(board: Board, position: Position, direction: Direction): Cell | null {
        const adjacentPosition = position.adjacent(direction);

        return adjacentPosition !== null ? board.getCell(adjacentPosition) : null;
    }

    /**
     * Finds all empty cells reachable from the given position
     * within the specified maximum distance.
     */
    public static findEmptyCellsAround(board: Board, position: Position, maxDistance: number): Cell[] {
        const emptyCells = new Map<string, Cell>();
        const visited = new Set<string>();

        let currentLevel: Position[] = [position];

        visited.add(position.toString());

        for (let distance = 1; distance <= maxDistance; distance++) {
            const nextLevel: Position[] = [];

            for (const currentPosition of currentLevel) {
                for (const direction of Direction.ALL) {
                    const adjacentPosition = currentPosition.adjacent(direction);

                    if (adjacentPosition === null) {
                        continue;
                    }

                    const key = adjacentPosition.toString();

                    if (visited.has(key)) {
                        continue;
                    }

                    visited.add(key);

                    const cell = board.getCell(adjacentPosition);

                    if (cell.getCharacter() === null) {
                        emptyCells.set(key, cell);
                        nextLevel.push(adjacentPosition);
                    }
                }
            }

            currentLevel = nextLevel;
        }

        return Array.from(emptyCells.values());
    }

    /**
     * Finds all possible empty paths around the given position.
     *
     * @param board the board to search.
     * @param position the starting position.
     * @param distance the maximum path distance.
     * @param avoidDuplicates whether each destination should appear only once.
     */
    public static getEmptyPathsAround(board: Board,
                                      position: Position,
                                      distance: number,
                                      avoidDuplicates: boolean): CharacterPath[] {
        if (distance <= 0) {
            return [];
        }

        const paths: CharacterPath[] = [];

        const destinations = new Set<string>();
        const visited = new Set<string>();

        let currentLevel: Position[][] = [[position]];

        visited.add(position.toString());

        for (let currentDistance = 1; currentDistance <= distance; currentDistance++) {
            const nextLevel: Position[][] = [];

            for (const currentPath of currentLevel) {
                const currentPosition = currentPath[currentPath.length - 1];

                for (const direction of Direction.ALL) {
                    const adjacentPosition = currentPosition.adjacent(direction);

                    if (adjacentPosition === null) {
                        continue;
                    }

                    const key = adjacentPosition.toString();

                    if (visited.has(key)) {
                        continue;
                    }

                    const cell = board.getCell(adjacentPosition);

                    if (cell.getCharacter() !== null) {
                        continue;
                    }

                    if (avoidDuplicates) {
                        visited.add(key);
                    }

                    const newPath = [...currentPath, adjacentPosition];

                    if (!position.equals(adjacentPosition) && 
                        (!avoidDuplicates || !destinations.has(key))) {
                        paths.push(new CharacterPath(newPath));

                        if (avoidDuplicates) {
                            destinations.add(key);
                        }
                    }

                    nextLevel.push(newPath);
                }
            }

            currentLevel = nextLevel;
        }

        return paths;
    }

    /**
     * Returns the position occupied by the character with the specified identifier.
     *
     * @throws Error if the character is not present on the board.
     */
    public static getPositionByCharacterId(board: Board, characterId: string): CharacterPosition {
        for (const cell of board.getCells()) {
            const character = cell.getCharacter();

            if (character !== null && character.id === characterId) {
                return new CharacterPosition(character, cell.getPosition());
            }
        }

        throw new Error("Character not found on the board");
    }

    /**
     * Gets the character at the given position.
     *
     * @throws Error if no character is present at the given position.
     */
    public static getNonNullCharacterAt(board: Board, characterPosition: Position): Character {
        const character = board.getCell(characterPosition).getCharacter();

        if (character === null) {
            throw new Error(`No character found at position: ${characterPosition}`);
        }

        return character;
    }

    /**
     * Gets the adjacent cells that match the given predicate.
     */
    public static getAdjacentCells(board: Board,
                                   position: Position,
                                   predicate: (cell: Cell) => boolean): Cell[] {
        const matchingAdjacentCells: Cell[] = [];

        for (const direction of Direction.ALL) {
            const adjacentCell = BoardQuery.findAdjacentCell(board, position, direction);

            if (adjacentCell !== null && predicate(adjacentCell)) {
                matchingAdjacentCells.push(adjacentCell);
            }
        }

        return matchingAdjacentCells;
    }

    /**
     * Returns the starting position of the specified team's leader.
     */
    public static getLeaderStartingPosition(team: Team): Position {
        return team === Team.Black ? Position.fromAxial(0, 3, -3) : Position.fromAxial(0, -3, 3);
    }
}
