import type { Position } from './Position'

const BOARD_RADIUS = 3

function buildCells(radius: number): Position[] {
  const cells: Position[] = []
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius)
    const rMax = Math.min(radius, -q + radius)
    for (let r = rMin; r <= rMax; r++) {
      cells.push({ q, r })
    }
  }
  return cells
}

export const BOARD_CELLS: Position[] = buildCells(BOARD_RADIUS)
