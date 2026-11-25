import type { CharacterType } from "../../gamelogic/enums/CharacterType";
import type { Team } from "../../gamelogic/enums/Team";

/**
 * A reason why a puzzle cannot be played. Data only: the texts are resolved
 * at display time (see PuzzleErrorModal), so they follow the language setting.
 */
export type PuzzleError =
    /** Nothing playable was found (empty player team, or nothing recognized in the URL). */
    | { readonly code: "emptyPlayerTeam" }
    /** Parsing error that prevents building the board. */
    | { readonly code: "unknownCharacter"; readonly characterId: string }
    /** Unexpected failure while loading the puzzle. */
    | { readonly code: "unexpected" }
    | { readonly code: "frogLimit" }
    | { readonly code: "leaderTransformedIntoFrog" }
    | { readonly code: "leaderMissing"; readonly team: Team }
    | { readonly code: "leaderCaptured"; readonly team: Team }
    | { readonly code: "leaderSurrounded"; readonly team: Team }
    | { readonly code: "oneLeaderPerTeam" }
    | { readonly code: "onePerTeamCharacter"; readonly characterType: CharacterType }
    | { readonly code: "hermitAndCubLimit" };
