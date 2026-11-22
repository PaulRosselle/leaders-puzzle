import type { InteractionFeedback } from "./entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "./entities/interactions/InteractionRequest";
import type { InteractionResult } from "./entities/interactions/InteractionResult";
import type { Game } from "./entities/projection/Game";

/**
 * Observer interface to be implemented by an external component
 * orchestrating a game session.
 *
 * All methods are asynchronous, allowing the caller to control
 * timing for animations and UI transitions.
 */
export interface IGameListener {

    /**
     * Fired once when the game session starts, before the first turn.
     *
     * @param game The current game state at session start.
     * @returns A promise completed when the caller has finished handling the event.
     */
    onGameStarted(game: Game): Promise<void>;

    /**
     * Fired once when the game session ends.
     *
     * @param playerWon true if the player won the game.
     * @returns A promise completed when the caller has finished handling the event.
     */
    onGameEnded(playerWon: boolean): Promise<void>;

    /**
     * Fired whenever an action is undone.
     *
     * @param game The game in which the action was undone.
     * @returns A promise completed when the undo handling is complete.
     */
    onActionUndone(game: Game): Promise<void>;

    /**
     * Fired whenever the game requires an input from the caller.
     *
     * The InteractionRequest carries the expected input type,
     * legal values, and accepted response types.
     * The caller must return an InteractionResult
     * that satisfies the request contract.
     *
     * @param request The requested interaction context.
     * @returns A promise completed with the caller's response.
     */
    onInputRequired(request: InteractionRequest): Promise<InteractionResult>;

    /**
     * Fired whenever the game produces feedback that must be handled
     * by the caller.
     *
     * The game flow waits for the returned promise to complete
     * before continuing.
     *
     * @param feedback The feedback to handle.
     * @returns A promise completed when the caller has finished handling the feedback.
     */
    onFeedback(feedback: InteractionFeedback): Promise<void>;
}
