import type { Action } from "./Action";

export class GameHistory {
    public readonly initialActions: readonly Action[];
    public readonly actions: readonly Action[];

    public constructor(initialActions: readonly Action[], actions: readonly Action[]) {
        this.initialActions = initialActions;
        this.actions = actions;
    }

    /**
     * Creates a deep copy of an existing game history.
     */
    public static copy(refGameHistory: GameHistory): GameHistory {
        return new GameHistory(
            [...refGameHistory.initialActions],
            [...refGameHistory.actions]
        );
    }
}