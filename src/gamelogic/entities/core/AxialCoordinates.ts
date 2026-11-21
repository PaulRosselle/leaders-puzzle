export class AxialCoordinates {
  public readonly q: number;
  public readonly r: number;
  public readonly s: number;

  constructor(q: number, r: number, s: number) {
    if (q + r + s !== 0) {
      throw new Error("Invalid axial coordinates: q + r + s must equal 0");
    }

    this.q = q;
    this.r = r;
    this.s = s;

    Object.freeze(this);
  }

  public equals(other: AxialCoordinates): boolean {
    return (
      this.q === other.q &&
      this.r === other.r &&
      this.s === other.s
    );
  }

  public toString(): string {
    return `(${this.q}, ${this.r}, ${this.s})`;
  }
}