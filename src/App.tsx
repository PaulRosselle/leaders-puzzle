import { useMemo } from 'react'
import { Board } from './components/Board/Board'
import { createPieceData } from './data/PieceData'
import { GameLoader } from './data/parser/import/GameLoader'
import type { InteractionTarget } from './gamelogic/entities/interactions/InteractionTarget'
import { useGameController } from './hooks/useGameController'
import { positionKey } from './data/positionKey'

// Computed once, outside the component, so the reference stays stable.
const gameHistory = GameLoader.fromUrl()

export default function App() {
  const { context, request, selectTarget } = useGameController(gameHistory)

  const pieces = context
    ? context.getCharacterStates().map((state) => createPieceData(state, false))
    : []

  // Index the legal targets of the current request by position.
  // Recomputed only when the request changes.
  const targetsByPosition = useMemo(() => {
    const map = new Map<string, InteractionTarget>()
    for (const target of request?.getLegalTargets() ?? []) {
      map.set(positionKey(target.getChosenPosition()), target)
    }
    return map
  }, [request])

  return (
    <Board
      pieces={pieces}
      markers={[]}
      targetsByPosition={targetsByPosition}
      onSelectTarget={selectTarget}
    />
  )
}