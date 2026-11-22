import { Position } from '../gamelogic/entities/core/Position'

function buildCells(radius: number): Position[] {
    const cells: Position[] = []
    for (let q = -radius; q <= radius; q++) {
        const rMin = Math.max(-radius, -q - radius)
        const rMax = Math.min(radius, -q + radius)
        for (let r = rMin; r <= rMax; r++) {
            cells.push(getPosition(q, r))
        }
    }
    return cells
}

function getPosition(q: number, r: number): Position {
    return Position.fromAxial(q, r, 0 - q - r);
}

export const BOARD_CELLS: Position[] = buildCells(Position.HEX_RADIUS)
