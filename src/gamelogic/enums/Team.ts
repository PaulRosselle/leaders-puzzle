export enum Team {
    Black,
    White,
}

export namespace Team {
    export const ALL: Team[] = [Team.Black, Team.White];

    export function getOpposite(team: Team): Team {
        return team === Team.Black ? Team.White : Team.Black;
    }
}