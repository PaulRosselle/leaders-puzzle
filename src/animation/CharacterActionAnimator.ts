import type { ActionMotion } from '../gamelogic/entities/actions/ActionMotion'
import type { ActionTarget } from '../gamelogic/entities/actions/ActionTarget'
import { ActionMotionType } from '../gamelogic/enums/ActionMotionType'
import { accelerateDecelerate, toCssEasing } from './Easings'

const DURATION_ADD = 200
const DURATION_REMOVE = 200
const DURATION_MOVE = 400

/**
 * Plays the animation of one action motion on the board.
 *
 * The animator receives a `commit` function which makes React render the
 * state AFTER the motion. Each animation decides when to call it:
 *  - before animating, when the pieces are already in their final place
 *    (Add, Move): the animation only plays the way from the old state to the new one;
 *  - after animating, when pieces must stay on screen until the end of
 *    their animation (Remove).
 */
export class CharacterActionAnimator {
    private readonly speedMultiplier: number

    /** @param speedMultiplier Equivalent of AnimationSpeed.getMultiplier() (1 = normal). */
    public constructor(speedMultiplier = 1) {
        this.speedMultiplier = speedMultiplier
    }

    public async animateMotion(motion: ActionMotion, commit: () => void): Promise<void> {
        if (motion.targets.length === 0) {
            throw new Error('Invalid motion : missing target')
        }

        switch (motion.motionType) {
            case ActionMotionType.Add:
                await this.animateAddCharacter(motion.targets, commit)
                break
            case ActionMotionType.Move:
            case ActionMotionType.Swap:
                await this.animateMoveCharacter(motion.targets, commit)
                break
            case ActionMotionType.Remove:
                await this.animateRemoveCharacter(motion.targets, commit)
                break
            default:
                // Not animated yet: the pieces simply appear in their final state.
                console.warn(`Motion animation not handled yet: ${ActionMotionType[motion.motionType]}`)
        }
    }

    // ---------------------------------------------------------------- Add

    private async animateAddCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
        // The new pieces are rendered right now, fully visible, then immediately
        // animated from invisible (same task, so the browser never paints the
        // fully visible state).
        commit()

        await Promise.all(targets.map((target) => this.animateFadeIn(target.character.id, DURATION_ADD)))
    }

    // ---------------------------------------------------------------- Remove

    private async animateRemoveCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
        // The pieces are still on screen: fade them out first...
        await Promise.all(targets.map((target) => this.animateFadeOut(target.character.id, DURATION_REMOVE)))

        // ...then remove them (equivalent of releaseCharacterDisplay).
        commit()
    }

    // ---------------------------------------------------------------- Move

    private async animateMoveCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
        // The pieces are rendered at their destination, then animated from their origin.
        commit()

        // All targets move at the same time; resolved when all of them are done.
        await Promise.all(targets.map((target) => this.animateMove(target)))
    }

    private async animateMove(target: ActionTarget): Promise<void> {
        const origin = target.originPos
        const dest = target.destPos
        if (origin === null || dest === null) {
            throw new Error('Invalid move target : missing origin or destination position')
        }

        const element = findPieceElement(target.character.id)
        if (element === null) {
            return
        }

        const restore = this.setupForMovement(element)

        try {
            // Animates the cell coordinates (--q / --r, see @property in Cell.css).
            const animation = element.animate(
                [
                    { '--q': origin.getQ(), '--r': origin.getR() },
                    { '--q': dest.getQ(), '--r': dest.getR() },
                ],
                {
                    duration: this.getAnimationDuration(DURATION_MOVE),
                    easing: toCssEasing(accelerateDecelerate),
                },
            )
            await animation.finished
        } finally {
            restore()
        }
    }

    /**
     * Prepares a piece for its movement and returns a function undoing it.
     * (The highlight is already off: applyMotions disables it for moved pieces.)
     */
    private setupForMovement(element: HTMLElement): () => void {
        // Equivalent of bringToFront(): the moving piece is drawn above the others.
        element.style.zIndex = '1'

        return () => {
            element.style.zIndex = ''
        }
    }

    // ---------------------------------------------------------------- Fades

    private async animateFadeIn(characterId: string, duration: number): Promise<void> {
        const content = findPieceContent(characterId)
        if (content === null) {
            return
        }

        // The scale is applied to the inner content so that it grows around the
        // center of the piece (the outer element is positioned with a translate).
        const animation = content.animate(
            [
                { transform: 'scale(0)', opacity: 0 },
                { transform: 'scale(1)', opacity: 1 },
            ],
            {
                duration: this.getAnimationDuration(duration),
                easing: toCssEasing(accelerateDecelerate),
            },
        )
        await animation.finished
    }

    private async animateFadeOut(characterId: string, duration: number): Promise<void> {
        const element = findPieceElement(characterId)
        const content = findPieceContent(characterId)
        if (element === null || content === null) {
            return
        }

        // Equivalent of setIsHighlighted(false): no highlight and default size
        // (the piece is about to be removed, so React never needs these back).
        const highlight = element.querySelector<HTMLElement>('.character-piece__highlight')
        if (highlight !== null) {
            highlight.style.display = 'none'
        }
        content.style.inset = '0'

        const animation = content.animate(
            [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(0)', opacity: 0 },
            ],
            {
                duration: this.getAnimationDuration(duration),
                easing: toCssEasing(accelerateDecelerate),
                // Stays invisible until the piece is removed from the DOM (no flash).
                fill: 'forwards',
            },
        )
        await animation.finished
    }

    private getAnimationDuration(duration: number): number {
        return duration * this.speedMultiplier
    }
}

/** Finds the DOM element of a piece (see data-piece-id in CharacterPiece). */
function findPieceElement(characterId: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-piece-id="${characterId}"]`)
}

/** Finds the inner element of a piece: the equivalent of Android's CharacterView. */
function findPieceContent(characterId: string): HTMLElement | null {
    return findPieceElement(characterId)?.querySelector<HTMLElement>('.character-piece__content') ?? null
}