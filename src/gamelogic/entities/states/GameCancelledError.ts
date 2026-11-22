/**
 * Internal signal used to unwind the game loop when the game is stopped.
 */
export class GameCancelledError extends Error {
    public constructor() {
        super("Game cancelled");
        this.name = "GameCancelledError";
    }
}