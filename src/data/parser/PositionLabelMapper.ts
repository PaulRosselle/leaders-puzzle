import { Position } from "../../gamelogic/entities/core/Position";

const POSITION_LABELS = (() => {
    const labels = new Map<string, string>();

    const radius = Position.HEX_RADIUS;

    for (let q = -radius; q <= radius; q++) {
        const cells: number[] = [];

        for (
            let r = Math.max(-radius, -q - radius);
            r <= Math.min(radius, -q + radius);
            r++
        ) {
            cells.push(r);
        }

        // Same ordering as the original editor.
        cells.sort((a, b) => b - a);

        cells.forEach((r, index) => {
            const label = `${"ABCDEFG"[q + radius]}${index + 1}`;

            labels.set(`${q},${r}`, label);
        });
    }

    return labels;
})();

export class PositionLabelMapper {
    public static toLabel(position: Position): string {
        const q = position.getQ();
        const r = position.getR();

        const label = POSITION_LABELS.get(`${q},${r}`);

        if (!label) {
            throw new Error(`Unable to find label for position: ${position}`);
        }

        return label.toLowerCase();
    }

    public static fromLabel(label: string): Position | null {
        const normalizedLabel = label.toLowerCase();

        for (const [coordinates, positionLabel] of POSITION_LABELS.entries()) {
            if (positionLabel.toLowerCase() === normalizedLabel) {
                const [q, r] = coordinates.split(",").map(Number);

                return Position.fromAxial(q, r, -q - r);
            }
        }

        return null;
    }
}