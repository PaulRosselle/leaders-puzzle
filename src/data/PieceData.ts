import type { Position } from '../gamelogic/entities/core/Position'
import type { CharacterState } from '../gamelogic/entities/states/CharacterState'
import type { CharacterType } from '../gamelogic/enums/CharacterType'
import type { Team } from '../gamelogic/enums/Team'
import { HighlightStatus } from './HighlightStatus'

/** Board character piece representation. */
export type PieceData = {
    id: string
    character: CharacterType
    team: Team
    position: Position
    highlightStatus: HighlightStatus
}

export function createPieceData(
    characterState: CharacterState,
    isSelected: boolean
): PieceData {
    return {
        id: characterState.getCharacter().id,
        character: characterState.getCharacter().characterType,
        team: characterState.getCharacter().team,
        position: characterState.getPosition(),
        highlightStatus: isSelected ? HighlightStatus.Animated : 
            characterState.isPlayable() ? HighlightStatus.Enabled : HighlightStatus.Disabled
    }
}