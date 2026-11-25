import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { GameController } from '../data/GameController'
import { OFFICIAL_PUZZLES, type OfficialPuzzle } from '../data/OfficialPuzzle'
import type { ActionMotion } from '../gamelogic/entities/actions/ActionMotion'
import type { GameHistory } from '../gamelogic/entities/actions/GameHistory'
import type { InteractionFeedback } from '../gamelogic/entities/interactions/InteractionFeedback'
import type { InteractionRequest } from '../gamelogic/entities/interactions/InteractionRequest'
import type { InteractionTarget } from '../gamelogic/entities/interactions/InteractionTarget'
import type { GameContext } from '../gamelogic/entities/states/GameContext'
import { GameCancelledError } from '../gamelogic/entities/states/GameCancelledError'
import { InteractionRequestType } from '../gamelogic/enums/interactions/InteractionRequestType'
import { InteractionResultType } from '../gamelogic/enums/interactions/InteractionResultType'
import { createHash } from '../utils/hashGameState'
import { AutoPlayer } from '../data/AutoPlayer'
import { loadNemesisMoves } from '../data/NemesisMoves'
import { markPuzzleCompleted } from '../data/CompletedPuzzles'

/** Anything able to play the animation of a motion (see CharacterActionAnimator). */
export type MotionAnimator = {
    /**
     * `commit` makes React render the state after the motion; the animator
     * calls it at the right moment of the animation.
     */
    animateMotion(motion: ActionMotion, commit: () => void): Promise<void>
}

export type GameResult = { readonly playerWon: boolean }

export function useGameController(createGameHistory: () => GameHistory | null, animator: MotionAnimator) {
    const [context, setContext] = useState<GameContext | null>(null)
    const [request, setRequest] = useState<InteractionRequest | null>(null)
    const [gameResult, setGameResult] = useState<GameResult | null>(null)
    const [officialPuzzle, setOfficialPuzzle] = useState<OfficialPuzzle | null>(null)

    // Motions already shown on screen during the current action, but not yet
    // part of `context`: the engine only applies the action to its state at the
    // very end, so `context` stays the "before" state while the action is built.
    const [motions, setMotions] = useState<readonly ActionMotion[]>([])

    const controllerRef = useRef<GameController | null>(null)
    // Incremented on each restart: animations of the previous game stop applying their motions.
    const generationRef = useRef(0)
    const restartingRef = useRef(false)

    useEffect(() => {
        const gameHistory = createGameHistory()
        if (gameHistory === null) {
            return
        }

        // We search for an official puzzle matching the game history
        const puzzle = findOfficialPuzzleMatch(gameHistory)
        setOfficialPuzzle(puzzle)

        let active = true
        // Replaced once the Nemesis moves of an official puzzle are loaded (before the game starts).
        let autoPlayer = new AutoPlayer(null)

        /** Plays each motion of a feedback, one after the other. */
        const playFeedback = async (feedback: InteractionFeedback): Promise<void> => {
            const generation = generationRef.current
            const isStale = (): boolean => !active || generationRef.current !== generation


            for (const motion of feedback.getActionsMotions()) {
                if (isStale()) return

                let committed = false
                const commit = (): void => {
                    if (committed || isStale()) return
                    committed = true
                    flushSync(() => setMotions((previous) => [...previous, motion]))
                }

                try {
                    await animator.animateMotion(motion, commit)
                } finally {
                    // Safety net: the motion is always applied, even if the animator
                    // did not handle it or failed (no-op if already committed).
                    commit()
                }
            }
        }

        const controller = new GameController({
            onGameStarted: () => {
                if (!active) return
                setContext(controller.getCurrentContext())
                setGameResult(null)
            },
            onGameEnded: (playerWon) => {
                if (!active) return
                if (playerWon && puzzle !== null) markPuzzleCompleted(puzzle.id)
                setContext(controller.getCurrentContext())
                setGameResult({ playerWon })
            },
            onActionUndone: () => {
                if (active) setContext(controller.getCurrentContext())
            },
            onInteractionRequired: (newRequest) => {
                if (!active) return
                const currentContext = controller.getCurrentContext()
                setContext(currentContext)

                // Requests answered automatically are never shown to the player.
                const autoTarget = autoPlayer.findTarget(newRequest, controller.getCurrentHistory())
                if (autoTarget !== null) {
                    controller.selectTarget(newRequest, autoTarget)
                    return
                }

                setRequest(newRequest)

                // A new action starts (after the previous one was done, cancelled or
                // undone): `context` is up to date again, so motions are dropped.
                if (newRequest.getRequestType() === InteractionRequestType.PlayableCharacterExpected) {
                    setMotions([])
                }
            },
            onInteractionCleared: () => {
                if (active) setRequest(null)
            },
            onFeedback: (feedback, completion) => {
                // The game resumes only when complete() is called, whatever happens.
                void playFeedback(feedback)
                    .catch((error) => console.error('Animation error', error))
                    .finally(() => completion.complete())
            },
            onError: (error) => {
                if (error instanceof GameCancelledError) return
                console.error('Game error', error)
            },
        })

        const start = async (): Promise<void> => {
            if (puzzle !== null) {
                try {
                    autoPlayer = new AutoPlayer(await loadNemesisMoves(puzzle.id))
                } catch (error) {
                    // The game remains playable, the Nemesis just has to be played manually.
                    console.error('Unable to load Nemesis moves', error)
                }
            }

            if (!active) return
            controllerRef.current = controller
            controller.startGame(gameHistory)
        }
        void start()

        return () => {
            active = false
            controllerRef.current = null
            setContext(null)
            setRequest(null)
            setMotions([])
            setGameResult(null)
            void controller.dispose()
        }
    }, [animator])

    const selectTarget = useCallback(
        (target: InteractionTarget) => {
            if (request !== null) controllerRef.current?.selectTarget(request, target)
        },
        [request],
    )

    const cancel = useCallback(() => {
        if (request !== null && request.getLegalResults().includes(InteractionResultType.CancelAction)) {
            controllerRef.current?.cancelAction(request);
        }
    }, [request])

    const undo = useCallback(() => {
        if (request !== null) controllerRef.current?.undoLastAction(request)
    }, [request])

    const canUndo = request?.getLegalResults().includes(InteractionResultType.UndoLastAction) ?? false

    const restart = useCallback(() => {
        const controller = controllerRef.current
        const gameHistory = createGameHistory() // Fresh history: never reuse a played one.

        // Also ignores a second click while the restart is in progress.
        if (controller === null || gameHistory === null || restartingRef.current) return

        restartingRef.current = true
        generationRef.current += 1
        setMotions([])

        controller
            .restartGame(gameHistory)
            .catch((error) => console.error('Restart error', error))
            .finally(() => {
                restartingRef.current = false
            })
    }, [createGameHistory])

    const canRestart = canUndo || gameResult !== null

    return { context, request, motions, gameResult, officialPuzzle, selectTarget, cancel, undo, canUndo, restart, canRestart }
}

function findOfficialPuzzleMatch(gameHistory: GameHistory): OfficialPuzzle | null {
    const hash = createHash(gameHistory)
    for (const officialPuzzle of OFFICIAL_PUZZLES) {
        if (hash === officialPuzzle.hash) {
            return officialPuzzle;
        }
    }

    return null;
}