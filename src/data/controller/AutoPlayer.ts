import type { GameHistory } from "../../gamelogic/entities/actions/GameHistory";
import type { InteractionRequest } from "../../gamelogic/entities/interactions/InteractionRequest";
import type { InteractionTarget } from "../../gamelogic/entities/interactions/InteractionTarget";
import { AutoPlayQuery } from "../../gamelogic/queries/AutoPlayQuery";
import type { NemesisMoves } from "./NemesisMoves";

/**
 * Answers the requests that must not be shown to the player (puzzle mode):
 * - the only selectable character is a mandatory Nemesis -> it is selected;
 * - an action of the opponent's Nemesis asks for a position -> the pre-computed move is played
 *   (only possible when Nemesis moves are available, i.e. official puzzles).
 *
 * Contains no state besides the Nemesis moves and never touches the game.
 */
export class AutoPlayer {
    private readonly nemesisMoves: NemesisMoves | null;

    public constructor(nemesisMoves: NemesisMoves | null) {
        this.nemesisMoves = nemesisMoves;
    }

    /**
     * @param gameHistory history of the game at the time of the request
     * @returns the target to answer with, or null if the player has to answer
     */
    public findTarget(request: InteractionRequest, gameHistory: GameHistory): InteractionTarget | null {
        if (this.nemesisMoves !== null && AutoPlayQuery.canAutoPlayCharacter(request)) {
            return this.nemesisMoves.getBlockingTarget(gameHistory, request);
        }

        return null;
    }
}