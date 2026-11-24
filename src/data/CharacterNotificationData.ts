import { CHARACTER_PORTRAITS, type CharacterPortrait } from './CharacterPortrait'
import type { PieceData } from './PieceData'

/** What the character notification displays. */
export type CharacterNotificationData = {
  main: CharacterPortrait
  /** Origin character of a transformed piece (e.g. the character behind a Frog). */
  additional: CharacterPortrait | null
}

export function createNotificationData(piece: PieceData): CharacterNotificationData {
  return {
    main: CHARACTER_PORTRAITS[piece.character],
    additional:
      piece.transformedCharacter !== null
        ? CHARACTER_PORTRAITS[piece.transformedCharacter.characterType]
        : null,
  }
}

export function isSameNotificationData(a: CharacterNotificationData, b: CharacterNotificationData): boolean {
  return a.main === b.main && a.additional === b.additional
}
