import type { GameHistory } from '../gamelogic/entities/actions/GameHistory'
import { Position } from '../gamelogic/entities/core/Position'
import { GameContext } from '../gamelogic/entities/states/GameContext'
import { CharacterType } from '../gamelogic/enums/CharacterType'
import { Team } from '../gamelogic/enums/Team'
import { GameFactory } from '../gamelogic/factories/GameFactory'
import { HighlightStatus } from './HighlightStatus'
import type { MarkerData } from './MarkerData'
import { GameLoader } from './parser/import/GameLoader'
import { createPieceData, type PieceData } from './PieceData'

export const DEMO_PIECES: PieceData[] = [
    { id: 'white-leader', character: CharacterType.LeaderKing, team: Team.White, position: Position.fromAxial(-3, 0, 3), highlightStatus: HighlightStatus.Disabled, transformedCharacter: null },
    { id: 'black-leader', character: CharacterType.LeaderQueen, team: Team.Black, position: Position.fromAxial(3, 0, -3), highlightStatus: HighlightStatus.Enabled, transformedCharacter: null },
    { id: 'white-1', character: CharacterType.Assassin, team: Team.White, position: Position.fromAxial(0, 1, -1), highlightStatus: HighlightStatus.Disabled, transformedCharacter: null },
    { id: 'black-1', character: CharacterType.Acrobat, team: Team.Black, position: Position.fromAxial(1, 1, -2), highlightStatus: HighlightStatus.Enabled, transformedCharacter: null },
    { id: 'white-2', character: CharacterType.Bruiser, team: Team.White, position: Position.fromAxial(2, -2, 0), highlightStatus: HighlightStatus.Disabled, transformedCharacter: null },
    { id: 'black-2', character: CharacterType.Wisp, team: Team.Black, position: Position.fromAxial(-1, -1, 2), highlightStatus: HighlightStatus.Enabled, transformedCharacter: null },
    { id: 'white-3', character: CharacterType.RoyalGuard, team: Team.White, position: Position.fromAxial(0, 0, 0), highlightStatus: HighlightStatus.Disabled, transformedCharacter: null },
]

export const DEMO_MARKERS: MarkerData[] = [
]

export class DemoSetup {
    public static getPieces(): PieceData[] {
        const gameHistory = GameLoader.fromUrl();

        if (!gameHistory) {
            return DEMO_PIECES;
        }

        return this.fromGameHistory(gameHistory);
    }

    private static fromGameHistory(gameHistory: GameHistory): PieceData[] {
        const game = GameFactory.create(gameHistory);
        const gameContext = new GameContext(game, gameHistory);

        return gameContext.getCharacterStates().map(characterState =>
            createPieceData(characterState, false)
        );
    }
}