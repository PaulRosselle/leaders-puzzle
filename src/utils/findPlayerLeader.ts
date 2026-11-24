import type { GameContext } from "../gamelogic/entities/states/GameContext"
import { CharacterType } from "../gamelogic/enums/CharacterType"
import { GameQuery } from "../gamelogic/queries/GameQuery"

export const findPlayerLeader = (context: GameContext | null) => {
    const characters = context?.getCharacterStates().map((state) => state.getCharacter())

    if (!characters) return null

    const playerTeam = GameQuery.getPlayerTeam()

    const alliedLeader = characters.find(
        (character) =>
            character.team === playerTeam &&
            CharacterType.isLeader(character.characterType),
    )

    if (alliedLeader !== undefined) return alliedLeader.characterType;

    const enemyLeader = characters.find(
        (character) =>
            character.team !== playerTeam &&
            CharacterType.isLeader(character.characterType),
    )

    return enemyLeader !== undefined ? enemyLeader.characterType : null;
}