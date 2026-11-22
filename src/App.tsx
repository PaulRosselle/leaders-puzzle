import { useMemo } from 'react'
import { CharacterActionAnimator } from './animation/CharacterActionAnimator'
import { Board } from './components/Board/Board'
import { applyMotions } from './data/applyMotions'
import { createMarkers } from './data/MarkerAsset'
import { createPieceData } from './data/PieceData'
import { GameLoader } from './data/parser/import/GameLoader'
import type { InteractionTarget } from './gamelogic/entities/interactions/InteractionTarget'
import { useGameController } from './hooks/useGameController'
import { useUndoShortcut } from './hooks/useUndoShortcut'
import { positionKey } from './utils/positionKey'

// Created once, outside the component, so the references stay stable.
const gameHistory = GameLoader.fromUrl()
const animator = new CharacterActionAnimator()

export default function App() {
  const { context, request, motions, selectTarget, cancel, undo, canUndo } =
    useGameController(gameHistory, animator)

  useUndoShortcut(canUndo, undo)

  // The character the player is currently acting with (null if none is selected yet).
  const selectedCharacterId = request?.getContext().getTargetCharacter()?.id ?? null

  // Pieces as displayed: the state of the context, plus the motions already played.
  const pieces = useMemo(() => {
    const basePieces = context
      ? context
          .getCharacterStates()
          .map((state) => createPieceData(state, state.getCharacter().id === selectedCharacterId))
      : []

    return applyMotions(basePieces, motions)
  }, [context, motions, selectedCharacterId])

  const targetsByPosition = useMemo(() => {
    const map = new Map<string, InteractionTarget>()
    for (const target of request?.getLegalTargets() ?? []) {
      map.set(positionKey(target.getChosenPosition()), target)
    }
    return map
  }, [request])

  // Markers now use the displayed pieces (not the context) to find where the
  // moving character stands.
  const markers = useMemo(() => createMarkers(request, pieces), [request, pieces])

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