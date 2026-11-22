/** An easing maps a progress t in [0, 1] to an eased progress in [0, 1]. */
export type Easing = (t: number) => number

/** Same formula as Android's AccelerateDecelerateInterpolator. */
export const accelerateDecelerate: Easing = (t) => Math.cos((t + 1) * Math.PI) / 2 + 0.5

/**
 * Same formula as Android's AnticipateInterpolator: the value first goes
 * slightly backward (below 0) before going forward to 1.
 */
export const anticipate =
  (tension = 2): Easing =>
  (t) =>
    t * t * ((tension + 1) * t - tension)

/** Same formula as Android's AccelerateInterpolator. */
export const accelerate =
  (factor = 1): Easing =>
  (t) =>
    factor === 1 ? t * t : Math.pow(t, 2 * factor)

/** Same formula as Android's DecelerateInterpolator. */
export const decelerate =
  (factor = 1): Easing =>
  (t) =>
    factor === 1 ? 1 - (1 - t) * (1 - t) : 1 - Math.pow(1 - t, 2 * factor)

/**
 * Converts an easing function into a CSS `linear(...)` easing string,
 * which the Web Animations API understands. The curve is sampled, so
 * the result is a very close approximation of the original function.
 */
export function toCssEasing(easing: Easing, samples = 24): string {
  const points: string[] = []

  for (let i = 0; i <= samples; i++) {
    points.push(easing(i / samples).toFixed(4))
  }

  return `linear(${points.join(', ')})`
}