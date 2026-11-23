import { useMemo } from 'react'
import { ActionAnimator } from './animation/ActionAnimator'
import { Board } from './components/Board/Board'
import { applyMotions } from './data/applyMotions'
import { createMarkers } from './data/MarkerAsset'
import { createPieceData, type PieceData } from './data/PieceData'
import { GameLoader } from './data/parser/import/GameLoader'
import type { InteractionTarget } from './gamelogic/entities/interactions/InteractionTarget'
import { useGameController } from './hooks/useGameController'
import { useUndoShortcut } from './hooks/useUndoShortcut'
import { positionKey } from './utils/positionKey'
import { usePlayableShine } from './hooks/usePlayableShine'
import { HighlightStatus } from './data/HighlightStatus'

// Created once, outside the component, so the references stay stable.
const gameHistory = GameLoader.fromUrl()
const animator = new ActionAnimator()

// TODO: to be driven by a UI setting.
const shineAnimationEnabled = true

function compareForShine(a: PieceData, b: PieceData): number {
  return a.position.getQ() - b.position.getQ() || a.position.getR() - b.position.getR()
}

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

  const shineIds = useMemo(
    () =>
      pieces
        .filter((piece) => piece.highlightStatus !== HighlightStatus.Disabled)
        .sort(compareForShine)
        .map((piece) => piece.id),
    [pieces],
  )
  usePlayableShine(request, shineIds, shineAnimationEnabled)

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