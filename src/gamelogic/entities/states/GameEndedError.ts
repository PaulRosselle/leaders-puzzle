/**
 * Internal signal used to unwind the game loop once a winner exists.
 */
export class GameEndedError extends Error {
    public readonly playerWon: boolean;

    public constructor(playerWon: boolean) {
        super("Game ended");
        this.name = "GameEndedError";
        this.playerWon = playerWon;
    }
}