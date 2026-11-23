import { GameHistoryFactory } from "./GameHistoryFactory";
import { GameStateParser } from "./GameStateParser";

/**
 * A puzzle code is "white=...", "black=..." or both joined with "&" (any order),
 * e.g. "white=b5:2&black=c4:1,d4:3". It may sit in the middle of any text
 * (a full URL, a message...), so the characters allowed in a value are limited
 * to the ones of the format (positions, ids, ":" and ","): this leaves out
 * the punctuation around the code.
 */
const CODE_PATTERN =
    /white=[\w:,]+(?:&black=[\w:,]+)?|black=[\w:,]+(?:&white=[\w:,]+)?/g;

export class PuzzleCodeFinder {

    /**
     * Returns the first valid puzzle code found in `text` (without any leading "#"),
     * or null if there is none.
     */
    public static findFirstValid(text: string): string | null {
        for (const match of PuzzleCodeFinder.decode(text).matchAll(CODE_PATTERN)) {
            if (PuzzleCodeFinder.isValid(match[0])) {
                return match[0];
            }
        }

        return null;
    }

    /** Codes copied from some places are URL-encoded ("%3A" for ":"). */
    private static decode(text: string): string {
        try {
            return decodeURIComponent(text);
        } catch {
            return text; // Stray "%": keep the text as is.
        }
    }

    /** Valid = same pipeline as the game loading, and at least one character. */
    private static isValid(code: string): boolean {
        try {
            const state = GameStateParser.parse(code);

            if (state.characters.length === 0) {
                return false;
            }

            // Throws on an unknown character id.
            GameHistoryFactory.fromParsedState(state);
            return true;
        } catch {
            return false;
        }
    }
}