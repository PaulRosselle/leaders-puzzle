export interface ParsedCharacter {
    characterId: string;
    team: "w" | "b";
    position: {
        q: number;
        r: number;
        s: number;
    };
    isFrog: boolean;
}

export interface ParsedGameState {
    characters: ParsedCharacter[];
}