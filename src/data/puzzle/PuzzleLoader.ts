import { GameFactory } from "../../gamelogic/factories/GameFactory";
import { CHARACTER_ID_MAPPING } from "../parser/CharacterIdMapping";
import { GameHistoryFactory } from "../parser/import/GameHistoryFactory";
import { GameStateParser } from "../parser/import/GameStateParser";
import type { PuzzleError } from "./PuzzleError";
import { PuzzleValidator } from "./PuzzleValidator";

export type PuzzleCheckResult =
    /** No puzzle in the URL: nothing to start, nothing to report. */
    | { readonly status: "empty" }
    | { readonly status: "valid" }
    | { readonly status: "invalid"; readonly errors: readonly PuzzleError[] };

export class PuzzleLoader {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * Checks a raw puzzle (the URL hash without "#") before any game is started.
     *
     * Parsing errors only block the loading when no board can be built from them
     * (unknown character id, nothing recognized). Entries the parser ignores
     * (malformed entry, unknown position...) do not: the board is loaded without them.
     * Then the board built is checked against the rules of a puzzle.
     */
    public static check(rawState: string | null): PuzzleCheckResult {
        if (!rawState) {
            return { status: "empty" };
        }

        try {
            const parsedState = GameStateParser.parse(rawState);

            if (!parsedState.characters.some((character) => character.team === 'b')) {
                return PuzzleLoader.invalid([{ code: "emptyPlayerTeam" }]);
            }

            const unknownIds = new Set<string>();
            for (const { characterId } of parsedState.characters) {
                if (!Object.prototype.hasOwnProperty.call(CHARACTER_ID_MAPPING, characterId)) {
                    unknownIds.add(characterId);
                }
            }
            if (unknownIds.size > 0) {
                return PuzzleLoader.invalid(
                    Array.from(unknownIds, characterId => ({ code: "unknownCharacter", characterId }))
                );
            }

            const game = GameFactory.create(GameHistoryFactory.fromParsedState(parsedState));

            return PuzzleLoader.invalid(PuzzleValidator.validate(game));
        } catch (error) {
            console.error("Unable to check the puzzle", error);
            return PuzzleLoader.invalid([{ code: "unexpected" }]);
        }
    }

    private static invalid(errors: readonly PuzzleError[]): PuzzleCheckResult {
        return errors.length === 0 ? { status: "valid" } : { status: "invalid", errors };
    }
}
