/** An easing maps a progress t in [0, 1] to an eased progress in [0, 1]. */
export type Easing = (t: number) => number

/** Same formula as Android's AccelerateDecelerateInterpolator. */
export const accelerateDecelerate: Easing = (t) => Math.cos((t + 1) * Math.PI) / 2 + 0.5

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