import { Direction } from "../../enums/Direction";
import { AxialCoordinates } from "./AxialCoordinates";

export class Position {
    public static readonly HEX_RADIUS = 3;

    public readonly coordinates;

    private constructor(coordinates: AxialCoordinates) {
        const { q, r, s } = coordinates;

        if (!Position.isWithinHexagon(q, r, s)) {
            throw new Error(`Out of range position: (${q}, ${r}, ${s})`);
        }

        this.coordinates = new AxialCoordinates(q, r, s);
        Object.freeze(this);
    }

    /**
     * Creates a position from axial/cubic coordinates.
     */
    public static fromAxial(q: number, r: number, s: number): Position {
        return new Position(new AxialCoordinates(q, r, s));
    }

    public translated(coordinates: AxialCoordinates): Position | null {
        const { q, r, s } = this.coordinates;

        const translatedQ = q + coordinates.q;
        const translatedR = r + coordinates.r;
        const translatedS = s + coordinates.s;

        if (!Position.isWithinHexagon(translatedQ, translatedR, translatedS)) {
            return null;
        }

        return Position.fromAxial(translatedQ, translatedR, translatedS);
    }

    public adjacent(direction: Direction): Position | null {
        const dirCoordinates = Direction.getCoordinates(direction);

        return this.translated(dirCoordinates);
    }

    public isAligned(other: Position): boolean {
        const delta = this.deltaTo(other);

        return delta.q === 0 || delta.r === 0 || delta.s === 0;
    }

    public distanceTo(other: Position): number {
        const delta = this.deltaTo(other);
        return (Math.abs(delta.q) + Math.abs(delta.r) + Math.abs(delta.s)) / 2;
    }

    private deltaTo(other: Position): AxialCoordinates {
        return new AxialCoordinates(
            other.coordinates.q - this.coordinates.q,
            other.coordinates.r - this.coordinates.r,
            other.coordinates.s - this.coordinates.s
        );
    }

    public equals(other: Position): boolean {
        return (
            this.coordinates.q === other.coordinates.q &&
            this.coordinates.r === other.coordinates.r &&
            this.coordinates.s === other.coordinates.s
        );
    }

    public static isWithinHexagon(q: number, r: number, s: number): boolean {
        return (
            q + r + s === 0 &&
            Math.abs(q) <= Position.HEX_RADIUS &&
            Math.abs(r) <= Position.HEX_RADIUS &&
            Math.abs(s) <= Position.HEX_RADIUS
        );
    }

    public toString(): string {
        const { q, r, s } = this.coordinates;
        return `Position{q=${q}, r=${r}, s=${s}}`;
    }

    public getQ(): number {
        return this.coordinates.q;
    }

    public getR(): number {
        return this.coordinates.r;
    }

    public getS(): number {
        return this.coordinates.s;
    }
}
