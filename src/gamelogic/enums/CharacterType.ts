import { AbilityType } from "./AbilityType";

export enum CharacterType {
    Acrobat,
    Archer,
    Assassin,
    Brewmaster,
    Bruiser,
    ClawLauncher,
    Cub,
    Hermit,
    Illusionist,
    Jailer,
    LeaderKing,
    LeaderQueen,
    Manipulator,
    Nemesis,
    Protector,
    Rider,
    RoyalGuard,
    Vizier,
    Wanderer,
    LeaderVermilion,
    Shaman,
    Frog,
    Sniper,
    Tactician,
    Wisp,
    EliteArcher,
}

export namespace CharacterType {
    export function isLeader(characterType: CharacterType): boolean {
        return [
            CharacterType.LeaderKing,
            CharacterType.LeaderQueen,
            CharacterType.LeaderVermilion,
        ].includes(characterType);
    }

    export function canCapture(characterType: CharacterType): boolean {
        return ![
            CharacterType.Cub,
            CharacterType.Wisp,
            CharacterType.Frog,
        ].includes(characterType);
    }

    export function getCharacterTypes(characterType: CharacterType): AbilityType[] {
    switch (characterType) {
        case CharacterType.Acrobat:
        case CharacterType.Brewmaster:
        case CharacterType.Bruiser:
        case CharacterType.ClawLauncher:
        case CharacterType.Illusionist:
        case CharacterType.Manipulator:
        case CharacterType.Rider:
        case CharacterType.RoyalGuard:
        case CharacterType.Wanderer:
        case CharacterType.Shaman:
        case CharacterType.Tactician:
            return [AbilityType.Active];

        case CharacterType.Archer:
        case CharacterType.Assassin:
        case CharacterType.Jailer:
        case CharacterType.Protector:
        case CharacterType.Vizier:
        case CharacterType.Sniper:
        case CharacterType.EliteArcher:
            return [AbilityType.Passive];

        case CharacterType.Hermit:
        case CharacterType.Cub:
        case CharacterType.Nemesis:
        case CharacterType.Frog:
        case CharacterType.Wisp:
            return [AbilityType.Special];

        case CharacterType.LeaderKing:
        case CharacterType.LeaderQueen:
        case CharacterType.LeaderVermilion:
            return [];

        default:
            throw new Error(`No ability type found matching ${characterType}`);
    }
}
}
