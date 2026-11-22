import { useMemo } from 'react'
import { Board } from './components/Board/Board'
import { createMarkers } from './data/MarkerAsset'
import { createPieceData } from './data/PieceData'
import { GameLoader } from './data/parser/import/GameLoader'
import type { InteractionTarget } from './gamelogic/entities/interactions/InteractionTarget'
import { useGameController } from './hooks/useGameController'
import { useUndoShortcut } from './hooks/useUndoShortcut'
import { positionKey } from './utils/positionKey'

// Computed once, outside the component, so the reference stays stable.
const gameHistory = GameLoader.fromUrl()

export default function App() {
  const { context, request, selectTarget, cancel, undo, canUndo } = useGameController(gameHistory)

  useUndoShortcut(canUndo, undo)

  // The character the player is currently acting with (null if none is selected yet).
  // At most one piece can be selected, so a single id is enough.
  const selectedCharacterId = request?.getContext().getTargetCharacter()?.id ?? null

  const pieces = context
    ? context
        .getCharacterStates()
        .map((state) =>
          createPieceData(state, state.getCharacter().id === selectedCharacterId),
        )
    : []

  // Both are derived from the current request, and recomputed only when it changes.
  const targetsByPosition = useMemo(() => {
    const map = new Map<string, InteractionTarget>()
    for (const target of request?.getLegalTargets() ?? []) {
      map.set(positionKey(target.getChosenPosition()), target)
    }
    return map
  }, [request])

  const markers = useMemo(() => createMarkers(request, context), [request, context])

  return (
    <Board
      pieces={pieces}
      markers={markers}
      targetsByPosition={targetsByPosition}
      onSelectTarget={selectTarget}
      onCancel={cancel}
    />
  )
}