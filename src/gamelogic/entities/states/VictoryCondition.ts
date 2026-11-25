import type { Game } from "../projection/Game";

export interface VictoryCondition {
    /** @returns true if the player wins in the current state of the game. */
    isPlayerVictory(game: Game): boolean;
}