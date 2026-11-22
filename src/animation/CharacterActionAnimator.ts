import type { ActionMotion } from '../gamelogic/entities/actions/ActionMotion'
import type { ActionTarget } from '../gamelogic/entities/actions/ActionTarget'
import { ActionMotionType } from '../gamelogic/enums/ActionMotionType'
import { accelerateDecelerate, toCssEasing } from './Easings'

const DURATION_MOVE = 400

/**
 * Plays the animation of one action motion on the board.
 *
 * Principle: when `animateMotion` is called, React has ALREADY rendered the
 * state after the motion (see useGameController). The animator only plays the
 * way from the old state to the new one, so when an animation ends, the DOM
 * is already correct and nothing needs to be cleaned up.
 */
export class CharacterActionAnimator {
  private readonly speedMultiplier: number

  /** @param speedMultiplier Equivalent of AnimationSpeed.getMultiplier() (1 = normal). */
  public constructor(speedMultiplier = 1) {
    this.speedMultiplier = speedMultiplier
  }

  public async animateMotion(motion: ActionMotion): Promise<void> {
    if (motion.targets.length === 0) {
      throw new Error('Invalid motion : missing target')
    }

    switch (motion.motionType) {
      case ActionMotionType.Move:
      case ActionMotionType.Swap:
        await this.animateMoveCharacter(motion.targets)
        break
      default:
        // Not animated yet: the pieces simply appear in their final state.
        console.warn(`Motion animation not handled yet: ${ActionMotionType[motion.motionType]}`)
    }
  }

  private async animateMoveCharacter(targets: readonly ActionTarget[]): Promise<void> {
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
      // The piece is already rendered at `dest`: we animate the cell
      // coordinates (--q / --r, see @property in Cell.css) from origin to dest.
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
   */
  private setupForMovement(element: HTMLElement): () => void {
    // Equivalent of bringToFront(): the moving piece is drawn above the others.
    element.style.zIndex = '1'

    // Equivalent of setIsHighlighted(false): no highlight ring while moving.
    const highlight = element.querySelector<HTMLElement>('.character-piece__highlight')
    if (highlight !== null) {
      highlight.style.visibility = 'hidden'
    }

    return () => {
      element.style.zIndex = ''
      if (highlight !== null) {
        highlight.style.visibility = ''
      }
    }
  }

  private getAnimationDuration(duration: number): number {
    return duration * this.speedMultiplier
  }
}

/** Finds the DOM element of a piece (see data-piece-id in CharacterPiece). */
function findPieceElement(characterId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-piece-id="${characterId}"]`)
}