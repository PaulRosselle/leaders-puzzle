import type { ActionMotion } from '../gamelogic/entities/actions/ActionMotion'
import type { ActionTarget } from '../gamelogic/entities/actions/ActionTarget'
import type { Position } from '../gamelogic/entities/core/Position'
import { ActionMotionType } from '../gamelogic/enums/ActionMotionType'
import { accelerateDecelerate, toCssEasing } from './Easings'

const DURATION_ADD = 200
const DURATION_REMOVE = 200
const DURATION_MOVE = 400
const DURATION_JUMP = 400
const DURATION_FLY = 600
const DURATION_TELEPORT = 800

/**
 * Height of the arc of a flight. Android uses 50 px; here it is expressed as
 * a ratio of the cell size so that it scales with the board (50 and 97 are
 * in source image units: 97 is the cell diameter, see --cell_size in Board.css).
 */
const FLY_ARC_HEIGHT_RATIO = 50 / 97

/** Number of keyframes used to approximate the parabolic arc of a flight. */
const FLY_SAMPLES = 20

/**
 * Plays the animation of one action motion on the board.
 *
 * The animator receives a `commit` function which makes React render the
 * state AFTER the motion. Each animation decides when to call it:
 *  - before animating, when the pieces are already in their final place
 *    (Add, Move, Jump, Fly): the animation only plays the way from the old
 *    state to the new one;
 *  - after animating, when pieces must stay on screen until the end of
 *    their animation (Remove);
 *  - in the middle of the animation (Teleport: the pieces are moved while invisible).
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
      case ActionMotionType.Jump:
        await this.animateJumpCharacter(motion.targets, commit)
        break
      case ActionMotionType.Fly:
        await this.animateFlyCharacter(motion.targets, commit)
        break
      case ActionMotionType.Teleport:
        await this.animateTeleportCharacter(motion.targets, commit)
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

    const fadeIns = targets.map((target) => this.startFadeIn(target.character.id, DURATION_ADD))
    await Promise.all(fadeIns.map((animation) => animation?.finished))
  }

  // ---------------------------------------------------------------- Remove

  private async animateRemoveCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
    // The pieces are still on screen: fade them out first...
    const fadeOuts = targets.map((target) => this.startFadeOut(target.character.id, DURATION_REMOVE))
    await Promise.all(fadeOuts.map((animation) => animation?.finished))

    // ...then remove them (equivalent of releaseCharacterDisplay).
    commit()
  }

  // ---------------------------------------------------------------- Teleport

  private async animateTeleportCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
    // Same integer division as in Java.
    const respawnDelay = Math.floor(DURATION_TELEPORT / 6)
    const fadingDuration = DURATION_TELEPORT / 2 - respawnDelay

    // 1. Fade out the pieces at their origin positions.
    const fadeOuts = targets.map((target) => this.startFadeOut(target.character.id, fadingDuration))
    await Promise.all(fadeOuts.map((animation) => animation?.finished))

    // 2. Move the pieces to their destinations. They are still invisible: the
    //    fade out holds its last frame (fill: 'forwards') during the re-render.
    commit()

    // React now renders the pieces without highlight, so the inline styles
    // set by startFadeOut are no longer needed (and would hide a future highlight).
    for (const target of targets) {
      resetFadeOutStyles(target.character.id)
    }

    // 3. Fade in at the destinations after a short delay. The fade in holds its
    //    first frame during the delay (fill: 'backwards'), so the fade outs can
    //    be cancelled right away without the pieces flashing.
    const fadeIns = targets.map((target) =>
      this.startFadeIn(target.character.id, fadingDuration, respawnDelay),
    )
    for (const animation of fadeOuts) {
      animation?.cancel()
    }
    await Promise.all(fadeIns.map((animation) => animation?.finished))
  }

  // ---------------------------------------------------------------- Move, Jump, Fly

  private async animateMoveCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
    // The pieces are rendered at their destination, then animated from their origin.
    commit()

    // All targets move at the same time; resolved when all of them are done.
    await Promise.all(targets.map((target) => this.animateTravel(target, DURATION_MOVE)))
  }

  private async animateJumpCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
    commit()

    await Promise.all(
      targets.map((target) => this.animateTravel(target, DURATION_JUMP, createJumpEffect)),
    )
  }

  private async animateFlyCharacter(targets: readonly ActionTarget[], commit: () => void): Promise<void> {
    commit()

    await Promise.all(
      targets.map((target) => this.animateTravel(target, DURATION_FLY, createFlyEffect)),
    )
  }

  /**
   * Moves a piece in a straight line from its origin to its destination.
   * Optionally plays an effect (scale, rotation, arc...) at the same time
   * on the inner content of the piece (the equivalent of Android's CharacterView).
   */
  private async animateTravel(
    target: ActionTarget,
    duration: number,
    createEffect?: (origin: Position, dest: Position, cellSize: number) => Keyframe[],
  ): Promise<void> {
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

    // Same duration and easing for the position and the effect (as in the
    // Java AnimatorSets). The easing is applied BEFORE the keyframe offsets,
    // like an Android interpolator.
    const options: KeyframeAnimationOptions = {
      duration: this.getAnimationDuration(duration),
      easing: toCssEasing(accelerateDecelerate),
    }

    try {
      // The position: animates the cell coordinates (--q / --r, see @property in Cell.css).
      const animations: Animation[] = [
        element.animate(
          [
            { '--q': origin.getQ(), '--r': origin.getR() },
            { '--q': dest.getQ(), '--r': dest.getR() },
          ],
          options,
        ),
      ]

      // The effect, on the inner content so that it acts around the center of the piece.
      const content = findPieceContent(target.character.id)
      if (createEffect !== undefined && content !== null) {
        const cellSize = element.getBoundingClientRect().width
        animations.push(content.animate(createEffect(origin, dest, cellSize), options))
      }

      await Promise.all(animations.map((animation) => animation.finished))
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

  /**
   * Starts the appearance of a piece and returns its animation (null if the
   * piece is not on screen). The piece grows from nothing, with its opacity.
   */
  private startFadeIn(characterId: string, duration: number, delay = 0): Animation | null {
    const content = findPieceContent(characterId)
    if (content === null) {
      return null
    }

    // The scale is applied to the inner content so that it grows around the
    // center of the piece (the outer element is positioned with a translate).
    return content.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      {
        duration: this.getAnimationDuration(duration),
        delay: this.getAnimationDuration(delay),
        easing: toCssEasing(accelerateDecelerate),
        // Stays invisible during the delay.
        fill: 'backwards',
      },
    )
  }

  /**
   * Starts the disappearance of a piece and returns its animation (null if the
   * piece is not on screen). The piece stays invisible after the end of the
   * animation (fill: 'forwards') until the caller removes or cancels it.
   */
  private startFadeOut(characterId: string, duration: number): Animation | null {
    const element = findPieceElement(characterId)
    const content = findPieceContent(characterId)
    if (element === null || content === null) {
      return null
    }

    // Equivalent of setIsHighlighted(false): no highlight and default size.
    const highlight = element.querySelector<HTMLElement>('.character-piece__highlight')
    if (highlight !== null) {
      highlight.style.display = 'none'
    }
    content.style.inset = '0'

    return content.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0)', opacity: 0 },
      ],
      {
        duration: this.getAnimationDuration(duration),
        easing: toCssEasing(accelerateDecelerate),
        fill: 'forwards',
      },
    )
  }

  private getAnimationDuration(duration: number): number {
    return duration * this.speedMultiplier
  }
}

// ---------------------------------------------------------------- Effects

/** Jump: the piece scales up to 1.15 at 45% of the jump, then back to 1. */
function createJumpEffect(): Keyframe[] {
  return [
    { offset: 0, transform: 'scale(1)' },
    { offset: 0.45, transform: 'scale(1.15)' },
    { offset: 1, transform: 'scale(1)' },
  ]
}

/**
 * Fly: same scale as the jump, plus a slight rotation (5 degrees toward the
 * direction of the flight at mid-flight) and a parabolic arc on the Y axis.
 */
function createFlyEffect(origin: Position, dest: Position, cellSize: number): Keyframe[] {
  const arcHeight = cellSize * FLY_ARC_HEIGHT_RATIO

  // Same as "destX >= originX" in Java (the screen X only depends on q).
  const direction = dest.getQ() >= origin.getQ() ? 1 : -1

  // A parabola is not linear: it is approximated with many keyframes.
  // 0.45 (scale peak) and 0.5 (rotation peak) are part of the sampled offsets.
  const keyframes: Keyframe[] = []

  for (let i = 0; i <= FLY_SAMPLES; i++) {
    const offset = i / FLY_SAMPLES

    const arc = 4 * offset * (1 - offset)
    const scale =
      offset <= 0.45 ? 1 + 0.15 * (offset / 0.45) : 1.15 - 0.15 * ((offset - 0.45) / 0.55)
    const rotation = 5 * direction * (offset <= 0.5 ? offset / 0.5 : (1 - offset) / 0.5)

    keyframes.push({
      offset,
      transform: `translateY(${(-arcHeight * arc).toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(3)}deg)`,
    })
  }

  return keyframes
}

// ---------------------------------------------------------------- DOM lookup

/** Finds the DOM element of a piece (see data-piece-id in CharacterPiece). */
function findPieceElement(characterId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-piece-id="${characterId}"]`)
}

/** Finds the inner element of a piece: the equivalent of Android's CharacterView. */
function findPieceContent(characterId: string): HTMLElement | null {
  return findPieceElement(characterId)?.querySelector<HTMLElement>('.character-piece__content') ?? null
}

/** Undoes the inline styles set by startFadeOut on a piece that stays on screen. */
function resetFadeOutStyles(characterId: string): void {
  const content = findPieceContent(characterId)
  if (content !== null) {
    content.style.inset = ''
  }
}