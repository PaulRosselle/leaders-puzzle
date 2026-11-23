import { Game } from "../entities/projection/Game";
import { Direction } from "../enums/Direction";
import { Team } from "../enums/Team";
import { AbilityQuery } from "./AbilityQuery";

import { BoardQuery } from "./BoardQuery";

export class GameQuery {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * Checks whether the specified team's leader has been captured.
     *
     * @param game the game to evaluate.
     * @param currentGamePhase the current game phase.
     * @param leaderTeam the team whose leader is checked.
     * @returns true if the leader has been captured; false otherwise.
     */
    public static isLeaderCaptured(game: Game, leaderTeam: Team): boolean {
        const leaderPos = BoardQuery.findLeaderPosition(game.getBoard(), leaderTeam);

        if (leaderPos === null) {
            return false;
        }

        let totalCaptureValue = 0;

        const opponentTeam = Team.getOpposite(leaderTeam);
        for (const characterPos of BoardQuery.findCharacterPositions(game.getBoard(), opponentTeam, null)) {
            totalCaptureValue += AbilityQuery.getCaptureContribution(leaderPos, characterPos);

            if (totalCaptureValue >= AbilityQuery.LEADER_CAPTURE_VALUE) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether the specified team's leader is surrounded.
     *
     * @param game the game to evaluate.
     * @param leaderTeam the team whose leader is checked.
     * @returns true if all adjacent cells around the leader are occupied.
     */
    public static isLeaderSurrounded(game: Game, leaderTeam: Team): boolean {
        const leaderPos = BoardQuery.findLeaderPosition(game.getBoard(), leaderTeam);

        if (leaderPos === null) {
            return false;
        }

        for (const direction of Direction.ALL) {
            const adjacentCell = BoardQuery.findAdjacentCell(game.getBoard(), leaderPos.position, direction);

            // At least one adjacent cell is empty.
            if (adjacentCell !== null && adjacentCell.getCharacter() === null) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns the winning team, if the game has ended.
     *
     * @param game the current game.
     * @returns the winning team, or null if the game has no winner yet.
     */
    public static getWinnerTeam(game: Game): Team | null {
        // Get the teams of both players.
        const currentPhaseTeam = GameQuery.getPlayerTeam();
        const opponentTeam = Team.getOpposite(currentPhaseTeam);
       
        // Check the current player's leader first to stay consistent
        // with the "don't capture your own leader" rule.
        if (GameQuery.isLeaderCaptured(game, currentPhaseTeam) ||
            GameQuery.isLeaderSurrounded(game, currentPhaseTeam)) {
            return opponentTeam;
        }

        // Then check the opponent's leader.
        if (GameQuery.isLeaderCaptured(game, opponentTeam) ||
            GameQuery.isLeaderSurrounded(game, opponentTeam)) {
            return currentPhaseTeam;
        }

        return null;
    }


    /**
     * Returns the player team during the game.
     */
    public static getPlayerTeam(): Team {
        return Team.Black;
    }
}