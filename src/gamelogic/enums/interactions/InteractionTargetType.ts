import { InteractionResultType } from "./InteractionResultType";

export enum InteractionTargetType {
    PlayableCharacter,
    MovementDestination,
    ActiveAbilityDestination,
    ActiveAbilityTargetPosition,
}

export namespace InteractionTargetType {
    export function getResultType(targetType: InteractionTargetType): InteractionResultType {
        if (targetType === InteractionTargetType.PlayableCharacter) {
            return InteractionResultType.PlayableCharacterChosen;
        }
        return InteractionResultType.PositionChosen;
    } 
}