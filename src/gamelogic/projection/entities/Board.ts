
import { Position } from "./Position";
import { Cell } from "./Cell";

export class Board {
    /**
     * Maps cell positions to their corresponding cells.
     * String keys are used instead of Position objects because
     * JavaScript Map compares object keys by reference rather than by value.
     */
    private readonly cells: Map<string, Cell>;

    public constructor(refBoard?: Board) {
        this.cells = new Map<string, Cell>();

        const radius = Position.HEX_RADIUS;

        for (let q = -radius; q <= radius; q++) {
            for (let r = -radius; r <= radius; r++) {
                for (let s = -radius; s <= radius; s++) {
                    if (!Position.isWithinHexagon(q, r, s)) {
                        continue;
                    }

                    const position = Position.fromAxial(q, r, s);
                    const cell = new Cell(position);

                    if (refBoard !== undefined) {
                        cell.setCharacter(refBoard.getCell(position).getCharacter());
                    }

                    this.cells.set(position.toString(), cell);
                }
            }
        }

        if (this.cells.size !== 37) {
            throw new Error(`Invalid board size: expected 37 cells, got ${this.cells.size}`);
        }
    }

    public getCells(): IterableIterator<Cell> {
        return this.cells.values();
    }

    public getCell(position: Position): Cell {
        const cell = this.cells.get(position.toString());

        if (cell === undefined) {
            throw new Error(`No cell found matching position ${position.toString()}`);
        }

        return cell;
    }
}
