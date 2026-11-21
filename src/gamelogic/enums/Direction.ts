import { AxialCoordinates } from "../entities/core/AxialCoordinates";

export enum Direction {
    Top,
    TopRight,
    BottomRight,
    Bottom,
    BottomLeft,
    TopLeft,
}

export namespace Direction {
    export const ALL: Direction[] = [
        Direction.Top,
        Direction.TopRight,
        Direction.BottomRight,
        Direction.Bottom,
        Direction.BottomLeft,
        Direction.TopLeft
    ];

    const DIRECTION_COORDINATES: Record<Direction, AxialCoordinates> = {
        [Direction.Top]: new AxialCoordinates(0, -1, 1),
        [Direction.TopRight]: new AxialCoordinates(1, -1, 0),
        [Direction.BottomRight]: new AxialCoordinates(1, 0, -1),
        [Direction.Bottom]: new AxialCoordinates(0, 1, -1),
        [Direction.BottomLeft]: new AxialCoordinates(-1, 1, 0),
        [Direction.TopLeft]: new AxialCoordinates(-1, 0, 1),
    };

    const CLOCKWISE_DIRECTIONS: readonly Direction[] = Object.freeze([
        Direction.Top,
        Direction.TopRight,
        Direction.BottomRight,
        Direction.Bottom,
        Direction.BottomLeft,
        Direction.TopLeft,
    ]);

    export function getCoordinates(direction: Direction): AxialCoordinates {
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
}