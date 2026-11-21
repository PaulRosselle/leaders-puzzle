export enum Direction {
  Top,
  TopRight,
  BottomRight,
  Bottom,
  BottomLeft,
  TopLeft,
}

type Coordinates = {
  q: number;
  r: number;
  s: number;
};

const DIRECTION_COORDINATES: Record<Direction, Coordinates> = {
  [Direction.Top]: { q: 0, r: -1, s: 1 },
  [Direction.TopRight]: { q: 1, r: -1, s: 0 },
  [Direction.BottomRight]: { q: 1, r: 0, s: -1 },
  [Direction.Bottom]: { q: 0, r: 1, s: -1 },
  [Direction.BottomLeft]: { q: -1, r: 1, s: 0 },
  [Direction.TopLeft]: { q: -1, r: 0, s: 1 },
};

const CLOCKWISE_DIRECTIONS: Direction[] = [
  Direction.Top,
  Direction.TopRight,
  Direction.BottomRight,
  Direction.Bottom,
  Direction.BottomLeft,
  Direction.TopLeft,
];

export function getCoordinates(direction: Direction): Coordinates {
  return DIRECTION_COORDINATES[direction];
}

export function getOpposite(direction: Direction): Direction {
  const index = CLOCKWISE_DIRECTIONS.indexOf(direction);
  return CLOCKWISE_DIRECTIONS[(index + 3) % 6];
}

export function getNext(direction: Direction, clockwise: boolean): Direction {
  const index = CLOCKWISE_DIRECTIONS.indexOf(direction);
  const offset = clockwise ? 1 : -1;

  return CLOCKWISE_DIRECTIONS[(index + offset + 6) % 6];
}