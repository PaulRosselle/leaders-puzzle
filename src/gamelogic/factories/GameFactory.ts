import type { Action } from "../entities/actions/Action";
import { ActionHandler } from "../entities/actions/ActionHandler";
import type { GameHistory } from "../entities/actions/GameHistory";
import { Board } from "../entities/projection/Board";
import { Game } from "../entities/projection/Game";

export class GameFactory {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    public static create(gameHistory: GameHistory): Game {
        const game = new Game(new Board(), new Map());

        GameFactory.doActions(game, gameHistory.initialActions);
        GameFactory.doActions(game, gameHistory.actions);

        return game;
    }

    private static doActions(game: Game, actions: readonly Action[]) {
        for (const action of actions) {
            new ActionHandler(game, action).doAction();
        }
    }
}