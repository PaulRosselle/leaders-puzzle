import { useCallback, useEffect, useRef, useState } from 'react'
import { GameController } from '../data/GameController'
import type { GameHistory } from '../gamelogic/entities/actions/GameHistory'
import type { GameContext } from '../gamelogic/entities/states/GameContext'
import type { InteractionRequest } from '../gamelogic/entities/interactions/InteractionRequest'
import type { InteractionTarget } from '../gamelogic/entities/interactions/InteractionTarget'
import { GameCancelledError } from '../gamelogic/entities/states/GameCancelledError'
import { InteractionResultType } from '../gamelogic/enums/interactions/InteractionResultType'

export function useGameController(gameHistory: GameHistory | null) {
    const [context, setContext] = useState<GameContext | null>(null)
    const [request, setRequest] = useState<InteractionRequest | null>(null)

    // The game controller is not a state : changing its value should not create a new render.
    const controllerRef = useRef<GameController | null>(null)

    useEffect(() => {
        if (gameHistory === null) {
            return
        }

        // Disable all controller events for destroying it.
        let active = true

        const controller = new GameController({
            onGameStarted: () => {
                if (active) setContext(controller.getCurrentContext())
            },
            onGameEnded: () => {
                if (active) setContext(controller.getCurrentContext())
            },
            onActionUndone: () => {
                if (active) setContext(controller.getCurrentContext())
            },
            onInteractionRequired: (newRequest) => {
                if (!active) return
                setContext(controller.getCurrentContext())
                setRequest(newRequest)
            },
            onInteractionCleared: () => {
                if (active) setRequest(null)
            },
            onFeedback: (_feedback, completion) => {
                // TODO - add animations
                completion.complete()
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
            void controller.dispose()
        }
    }, [gameHistory])

    const selectTarget = useCallback(
        (target: InteractionTarget) => {
            if (request !== null) controllerRef.current?.selectTarget(request, target)
        },
        [request],
    )

    const cancel = useCallback(() => {
        if (request !== null) controllerRef.current?.cancelAction(request)
    }, [request])

    const undo = useCallback(() => {
        if (request !== null) controllerRef.current?.undoLastAction(request)
    }, [request])

    const canUndo =
        request?.getLegalResults().includes(InteractionResultType.UndoLastAction) ?? false

    return { context, request, selectTarget, cancel, undo, canUndo }
}