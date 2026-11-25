import type { GameHistory } from "../../gamelogic/entities/actions/GameHistory";
import type { Position } from "../../gamelogic/entities/core/Position";
import type { InteractionRequest } from "../../gamelogic/entities/interactions/InteractionRequest";
import type { InteractionTarget } from "../../gamelogic/entities/interactions/InteractionTarget";
import { GameFactory } from "../../gamelogic/factories/GameFactory";
import { BoardQuery } from "../../gamelogic/queries/BoardQuery";
import { GameQuery } from "../../gamelogic/queries/GameQuery";
import { getClosestTarget } from "../../utils/botUtils";
import { createHash } from "../../utils/hashGameState";
import { PositionLabelMapper } from "../parser/PositionLabelMapper";

type RawNemesisMoves = Readonly<Record<string, string>>;

// One file per official puzzle (see scripts/split-nemesis-moves.mjs), loaded only on demand.
const MOVES_LOADERS = import.meta.glob<RawNemesisMoves>("../resources/nemesis_moves/*.json", {
    import: "default",
});

/**
 * Pre-computed Nemesis destinations of an official puzzle, indexed by game state hash.
 */
export class NemesisMoves {
    private readonly rawMoves: RawNemesisMoves;

    public constructor(rawMoves: RawNemesisMoves) {
        this.rawMoves = rawMoves;
    }

    /** Destinations are only converted to positions when looked up. */
    public getDestination(stateHash: string): Position | null {
        if (!Object.hasOwn(this.rawMoves, stateHash)) {
            return null;
        }

        const label = this.rawMoves[stateHash];
        const position = PositionLabelMapper.fromLabel(label);
        if (position === null) {
            throw new Error(`Invalid Nemesis destination "${label}" for state "${stateHash}"`);
        }
        return position;
    }

    /**
     * Returns the target the Nemesis must choose: the pre-computed one when the state is known,
     * otherwise the target closest to the player's leader.
     */
    public getBlockingTarget(gameHistory: GameHistory, request: InteractionRequest): InteractionTarget {
        const nemesisTargets = request.getLegalTargets();
        if (nemesisTargets.length === 0) {
            throw new Error("Invalid request for Nemesis action: no target");
        }

        const existingDestination = this.getDestination(createHash(gameHistory));
        if (existingDestination !== null) {
            return getNemesisTargetFromDestination(nemesisTargets, existingDestination);
        }

        const game = GameFactory.create(gameHistory);
        const enemyLeader = BoardQuery.findLeaderPosition(game.board, GameQuery.getPlayerTeam());
        if (enemyLeader === null) {
            throw new Error("Enemy leader required to initiate a Nemesis action");
        }

        return getClosestTarget(nemesisTargets, enemyLeader.position);
    }
}

function getNemesisTargetFromDestination(targets: readonly InteractionTarget[], destination: Position): InteractionTarget {
    const target = targets.find(candidate => candidate.getChosenPosition().equals(destination));
    if (target === undefined) {
        throw new Error(`No target found matching Nemesis destination: ${destination}`);
    }
    return target;
}

/**
 * Loads the Nemesis moves of an official puzzle.
 *
 * @returns null if the puzzle has no Nemesis moves file
 */
export async function loadNemesisMoves(puzzleId: number): Promise<NemesisMoves | null> {
    const loader = MOVES_LOADERS[`../resources/nemesis_moves/${puzzleId}.json`];
    if (loader === undefined) {
        return null;
    }
    return new NemesisMoves(await loader());
}