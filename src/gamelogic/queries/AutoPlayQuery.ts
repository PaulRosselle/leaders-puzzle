import type { Action } from "../entities/actions/Action";
import type { Character } from "../entities/core/Character";
import type { InteractionRequest } from "../entities/interactions/InteractionRequest";
import { InteractionResult } from "../entities/interactions/InteractionResult";
import type { PlayableCharacterPositions } from "../entities/states/PlayableCharacterPositions";
import { CharacterType } from "../enums/CharacterType";
import { InteractionRequestType } from "../enums/interactions/InteractionRequestType";
import { InteractionResultType } from "../enums/interactions/InteractionResultType";
import { GameQuery } from "./GameQuery";

/**
 * Rules deciding which characters are played automatically (puzzle mode only).
 * Only Nemesis characters are auto-controlled.
 */
export class AutoPlayQuery {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    public static getAutoSelectResult(request: InteractionRequest,
                                      playableCharacterPositions: PlayableCharacterPositions): InteractionResult | null {
        if (request.getRequestType() !== InteractionRequestType.PlayableCharacterExpected ||
            !playableCharacterPositions.isMandatory ||
            request.getLegalTargets().length !== 1) {
            return null;
        }

        return new InteractionResult(
            InteractionResultType.PositionChosen,
            request.getContext(),
            request.getLegalTargets()[0]
        )
    }

    /**
     * The request asks for a position for an action of an auto character
     * belonging to the opponent of the player.
     */
    public static canAutoPlayCharacter(request: InteractionRequest): boolean {
        return request.getRequestType() === InteractionRequestType.PositionExpected &&
            AutoPlayQuery.isAutoPlayableCharacter(request.getContext().getSourceCharacter(), false);
    }

    /**
     * An action made by an auto character is undone together with the player action that forced it.
     */
    public static isAutoCancellableAction(action: Action): boolean {
        return AutoPlayQuery.isAutoPlayableCharacter(action.srcCharacter, true);
    }

    public static isAutoPlayableCharacter(character: Character | null, ignoreTeam: boolean): boolean {
        return character !== null &&
            AutoPlayQuery.isAutoCharacterType(character) &&
            (ignoreTeam || character.team !== GameQuery.getPlayerTeam());
    }

    private static isAutoCharacterType(character: Character): boolean {
        return character.characterType === CharacterType.Nemesis;
    }
}