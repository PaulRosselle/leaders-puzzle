import { CharacterType } from '../gamelogic/enums/CharacterType'
import victoryKing from '../assets/endgame/end_game_victory_king.webp'
import victoryQueen from '../assets/endgame/end_game_victory_queen.webp'
import victoryVermilion from '../assets/endgame/end_game_victory_vermilion.webp'
import defeatKing from '../assets/endgame/end_game_defeat_king.webp'
import defeatQueen from '../assets/endgame/end_game_defeat_queen.webp'
import defeatVermilion from '../assets/endgame/end_game_defeat_vermilion.webp'
import victoryBg from '../assets/endgame/end_game_victory_bg.webp'
import defeatBg from '../assets/endgame/end_game_defeat_bg.webp'
import victorySide from '../assets/endgame/end_game_victory_side.webp'
import defeatSide from '../assets/endgame/end_game_defeat_side.webp'

export enum EndGameType {
  Victory,
  Defeat,
}

export type EndGameStyle = {
  color: string
  leaderBackground: string
  side: string
}

export const END_GAME_STYLES: Record<EndGameType, EndGameStyle> = {
  [EndGameType.Victory]: {
    color: 'var(--app-golden)',
    leaderBackground: victoryBg,
    side: victorySide,
  },
  [EndGameType.Defeat]: {
    color: 'var(--app-red)',
    leaderBackground: defeatBg,
    side: defeatSide,
  },
}

/** Leader illustration, by end type and leader character type. */
export const END_GAME_LEADERS: Record<EndGameType, Partial<Record<CharacterType, string>>> = {
  [EndGameType.Victory]: {
    [CharacterType.LeaderKing]: victoryKing,
    [CharacterType.LeaderQueen]: victoryQueen,
    [CharacterType.LeaderVermilion]: victoryVermilion,
  },
  [EndGameType.Defeat]: {
    [CharacterType.LeaderKing]: defeatKing,
    [CharacterType.LeaderQueen]: defeatQueen,
    [CharacterType.LeaderVermilion]: defeatVermilion,
  },
}