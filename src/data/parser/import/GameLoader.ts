import { GameUrlReader } from "./GameUrlReader";
import { GameStateParser } from "./GameStateParser";
import { GameHistoryFactory } from "./GameHistoryFactory";
import type { GameHistory } from "../../../gamelogic/entities/actions/GameHistory";

export class GameLoader {

    public static fromUrl(url?: string): GameHistory | null {
        const rawState = GameUrlReader.getRawState(url);

        if (!rawState) {
            return null;
        }

        const parsedState = GameStateParser.parse(rawState);

        return GameHistoryFactory.fromParsedState(parsedState);
    }

    public static fromRawState(rawState: string | null): GameHistory | null {
        if (!rawState) {
            return null;
        }

        const parsedState = GameStateParser.parse(rawState);

        return GameHistoryFactory.fromParsedState(parsedState);
    }
}