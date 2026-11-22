import type { InteractionFeedback } from "./entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "./entities/interactions/InteractionRequest";
import type { InteractionResult } from "./entities/interactions/InteractionResult";
import type { GameContext } from "./entities/states/GameContext";

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
     * @param gameContext The current game context.
     * @returns A promise completed when the caller has finished handling the event.
     */
    onGameStarted(gameContext: GameContext): Promise<void>;

    /**
     * Fired once when the game session ends.
     *
     * @param gameContext The current game context.
     * @param playerWon true if the player won the game.
     * @returns A promise completed when the caller has finished handling the event.
     */
    onGameEnded(gameContext: GameContext, playerWon: boolean): Promise<void>;

    /**
     * Fired whenever an action is undone.
     *
     * @param gameContext The current game context.
     * @returns A promise completed when the undo handling is complete.
     */
    onActionUndone(gameContext: GameContext): Promise<void>;

    /**
     * Fired whenever the game requires an input from the caller.
     *
     * The InteractionRequest carries the expected input type,
     * legal values, and accepted response types.
     * The caller must return an InteractionResult
     * that satisfies the request contract.
     *
     * @param gameContext The current game context.
     * @param request The requested interaction context.
     * @returns A promise completed with the caller's response.
     */
    onInputRequired(gameContext: GameContext, request: InteractionRequest): Promise<InteractionResult>;

    /**
     * Fired whenever the game produces feedback that must be handled
     * by the caller.
     *
     * The game flow waits for the returned promise to complete
     * before continuing.
     *
     * @param gameContext The current game context.
     * @param feedback The feedback to handle.
     * @returns A promise completed when the caller has finished handling the feedback.
     */
    onFeedback(gameContext: GameContext, feedback: InteractionFeedback): Promise<void>;
}
