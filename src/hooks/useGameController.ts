import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { GameController } from '../data/GameController' // adapt the path
import type { ActionMotion } from '../gamelogic/entities/actions/ActionMotion'
import type { GameHistory } from '../gamelogic/entities/actions/GameHistory'
import type { InteractionFeedback } from '../gamelogic/entities/interactions/InteractionFeedback'
import type { InteractionRequest } from '../gamelogic/entities/interactions/InteractionRequest'
import type { InteractionTarget } from '../gamelogic/entities/interactions/InteractionTarget'
import type { GameContext } from '../gamelogic/entities/states/GameContext'
import { GameCancelledError } from '../gamelogic/entities/states/GameCancelledError'
import { InteractionRequestType } from '../gamelogic/enums/interactions/InteractionRequestType'
import { InteractionResultType } from '../gamelogic/enums/interactions/InteractionResultType'

/** Anything able to play the animation of a motion (see CharacterActionAnimator). */
export type MotionAnimator = {
    /**
     * `commit` makes React render the state after the motion; the animator
     * calls it at the right moment of the animation.
     */
    animateMotion(motion: ActionMotion, commit: () => void): Promise<void>
}

export type GameResult = { readonly playerWon: boolean }

export function useGameController(gameHistory: GameHistory | null, animator: MotionAnimator) {
    const [context, setContext] = useState<GameContext | null>(null)
    const [request, setRequest] = useState<InteractionRequest | null>(null)
    const [gameResult, setGameResult] = useState<GameResult | null>(null)

    // Motions already shown on screen during the current action, but not yet
    // part of `context`: the engine only applies the action to its state at the
    // very end, so `context` stays the "before" state while the action is built.
    const [motions, setMotions] = useState<readonly ActionMotion[]>([])

    const controllerRef = useRef<GameController | null>(null)

    useEffect(() => {
        if (gameHistory === null) {
            return
        }

        let active = true

        /** Plays each motion of a feedback, one after the other. */
        const playFeedback = async (feedback: InteractionFeedback): Promise<void> => {
            for (const motion of feedback.getActionsMotions()) {
                if (!active) return

                // Renders the state AFTER the motion. flushSync makes React update the
                // DOM right now, so the animator finds it up to date. Idempotent.
                let committed = false
                const commit = (): void => {
                    if (committed) return
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
                setContext(controller.getCurrentContext())
                setGameResult({ playerWon })
            },
            onActionUndone: () => {
                if (active) setContext(controller.getCurrentContext())
            },
            onInteractionRequired: (newRequest) => {
                if (!active) return
                setContext(controller.getCurrentContext())
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

        controllerRef.current = controller
        controller.startGame(gameHistory)

        return () => {
            active = false
            controllerRef.current = null
            setContext(null)
            setRequest(null)
            setMotions([])
            setGameResult(null)
            void controller.dispose()
        }
    }, [gameHistory, animator])

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

    const canUndo =
        request?.getLegalResults().includes(InteractionResultType.UndoLastAction) ?? false

    return { context, request, motions, gameResult, selectTarget, cancel, undo, canUndo }
}