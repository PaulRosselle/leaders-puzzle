import type { Position } from '../gamelogic/entities/core/Position'

// Same formulas as in Cell.css (--x / --y), in units of "cell spacing".
// Only the direction matters here, so the real pixel scale is irrelevant.
function planeX(position: Position): number {
  return 1.5 * position.getQ()
}

function planeY(position: Position): number {
  return Math.sqrt(3) * (position.getQ() / 2 + position.getR())
}

/**
 * Angle in degrees (0 to 360, clockwise, 0 = pointing up) of the direction
 * going from `origin` to `destination`. Matches the CSS `rotate` convention.
 */
export function angleBetween(origin: Position, destination: Position): number {
  const dx = planeX(destination) - planeX(origin)
  // The screen Y axis points down, so it is inverted to get "up" = 0 degrees.
  const dy = planeY(destination) - planeY(origin)

  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI

  // Normalize to [0, 360)
  return ((degrees % 360) + 360) % 360
}