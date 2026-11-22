import { Board } from './components/Board/Board'
import { GameLoader } from './data/parser/import/GameLoader'
import { createPieceData } from './data/PieceData'
import { useGameController } from './hooks/useGameController'

const gameHistory = GameLoader.fromUrl()

export default function App() {
  const { context } = useGameController(gameHistory)

  const pieces = context
    ? context.getCharacterStates().map(s => createPieceData(s, false))
    : []

  return <Board pieces={pieces} markers={[]} />
}
