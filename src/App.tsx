import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActionAnimator } from './animation/ActionAnimator'
import { Board } from './components/Board/Board'
import { applyMotions } from './data/applyMotions'
import { createMarkers } from './data/MarkerAsset'
import { createPieceData, type PieceData } from './data/PieceData'
import { GameLoader } from './data/parser/import/GameLoader'
import type { InteractionTarget } from './gamelogic/entities/interactions/InteractionTarget'
import { useGameController, type GameResult } from './hooks/useGameController'
import { useUndoShortcut } from './hooks/useUndoShortcut'
import { positionKey } from './utils/positionKey'
import { usePlayableShine } from './hooks/usePlayableShine'
import { HighlightStatus } from './data/HighlightStatus'
import { EndGameModal } from './components/EndGameModal/EndGameModal'
import { Toolbar } from './components/Toolbar/Toolbar'
import { openInEditor } from './utils/openInEditor'
import { GameUrlReader } from './data/parser/import/GameUrlReader'
import { reloadWithPuzzle } from './utils/reloadWithPuzzle'
import { ImportModal } from './components/ImportModal/ImportModal'
import { useSettings } from './settings/useSettings'
import { useLanguageSync } from './hooks/useLanguageSync'
import { getAnimationDurationMultiplier } from './settings/Settings'
import { SettingsModal } from './components/SettingsModal/SettingsModal'
import { CharacterNotification } from './components/CharacterNotification/CharacterNotification'
import { useCharacterNotification } from './hooks/useCharacterNotification'
import { createNotificationData } from './data/CharacterNotificationData'
import { OfficialPuzzlesModal } from './components/OfficialPuzzlesModal/OfficialPuzzlesModal'
import { PuzzleBadge } from './components/PuzzleBadge/PuzzleBadge'
import { findPlayerLeader } from './utils/findPlayerLeader'

// Created once, outside the component, so the references stay stable.
const puzzleRawState = GameUrlReader.getRawState()
const createGameHistory = () => GameLoader.fromRawState(puzzleRawState)
const animator = new ActionAnimator()

function compareForShine(a: PieceData, b: PieceData): number {
  return a.position.getQ() - b.position.getQ() || a.position.getR() - b.position.getR()
}

export default function App() {
  const [importOpen, setImportOpen] = useState(false)
  const { settings } = useSettings()
  useLanguageSync()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [puzzlesOpen, setPuzzlesOpen] = useState(false)
  const { data: notification, toggle: toggleNotification, hide: hideNotification } = useCharacterNotification()

  // Long press on a piece: shows (or hides) the description of its character.
  const handleCharacterLongPress = useCallback(
    (piece: PieceData) => toggleNotification(createNotificationData(piece)),
    [toggleNotification],
  )
  
  const { context, request, motions, gameResult, officialPuzzle, selectTarget, cancel, undo, canUndo, restart, canRestart } =
    useGameController(createGameHistory, animator)

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
  
  useEffect(() => {
    animator.setSpeedMultiplier(getAnimationDurationMultiplier(settings.animationSpeed))
  }, [settings.animationSpeed])
  usePlayableShine(request, shineIds, settings.playableAnimation)

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

  // The modal is dismissed per result, so a new game shows it again without any reset.
  const [dismissedResult, setDismissedResult] = useState<GameResult | null>(null)
  const playerLeader = useMemo(() => findPlayerLeader(context), [context])

  console.log(settings.highlightColor)

  return (
    <>
      <Board
        pieces={pieces}
        markers={markers}
        targetsByPosition={targetsByPosition}
        onSelectTarget={selectTarget}
        onCancel={cancel}
        onCharacterLongPress={handleCharacterLongPress}
        showCoordinates={settings.showBoardCoordinates}
        highlightColor={settings.highlightColor}>
          {officialPuzzle && <PuzzleBadge puzzle={officialPuzzle} />}
      </Board>
      <Toolbar
        position={settings.toolbarPosition}
        actions={{ undo, restart, edit: () => { if (context) openInEditor(context) }, 
          grid: () => setPuzzlesOpen(true),
          import: () => setImportOpen(true ), 
          settings: () => setSettingsOpen(true) 
        }}
        disabled={{ undo: !canUndo, restart: !canRestart, edit: context === null }}
      />
      <CharacterNotification data={notification} onClose={hideNotification} />
      {importOpen && (
        <ImportModal onSubmit={reloadWithPuzzle} onClose={() => setImportOpen(false)} />
      )}
      {puzzlesOpen && (
        <OfficialPuzzlesModal
          currentPuzzleId={officialPuzzle?.id ?? null}
          onSelect={reloadWithPuzzle} 
          onClose={() => setPuzzlesOpen(false)}
        />
      )}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {gameResult !== null && gameResult !== dismissedResult && (
        <EndGameModal
          playerWon={gameResult.playerWon}
          leader={playerLeader}
          onClosed={() => setDismissedResult(gameResult)}
        />
      )}
    </>
  )
}