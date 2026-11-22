import { CharacterType } from "../../gamelogic/enums/CharacterType";

/**
 * Maps the original editor character IDs to the application's CharacterType enum.
 */
export const CHARACTER_ID_MAPPING: Record<string, CharacterType> = {
    "1": CharacterType.LeaderKing,
    "2": CharacterType.LeaderQueen,
    "3": CharacterType.Acrobat,
    "4": CharacterType.Archer,
    "5": CharacterType.Assassin,
    "6": CharacterType.Rider,
    "7": CharacterType.Bruiser,
    "8": CharacterType.RoyalGuard,
    "9": CharacterType.Jailer,
    "10": CharacterType.Illusionist,
    "11": CharacterType.ClawLauncher,
    "12": CharacterType.Manipulator,
    "13": CharacterType.Nemesis,
    "14": CharacterType.Protector,
    "15": CharacterType.Wanderer,
    "16": CharacterType.Brewmaster,
    "17": CharacterType.Hermit,
    "18": CharacterType.Cub,
    "19": CharacterType.Vizier,
    "20": CharacterType.Wisp,
    "21": CharacterType.Shaman,
    "22": CharacterType.Frog,
    "23": CharacterType.Sniper,
    "24": CharacterType.Tactician,
    "25": CharacterType.LeaderVermilion,
    // Elite archer will be added once handled in LBE
};

const mapping: Partial<Record<CharacterType, string>> = {};

for (const [id, characterType] of Object.entries(CHARACTER_ID_MAPPING)) {
    if (mapping[characterType] !== undefined) {
        throw new Error(`Duplicate export ID for character type: ${CharacterType[characterType]}`);
    }

    mapping[characterType] = id;
}

export const CHARACTER_EXPORT_ID_MAPPING = mapping;

export function getCharacterExportId(characterType: CharacterType): string {
    const id = CHARACTER_EXPORT_ID_MAPPING[characterType];

    if (id === undefined) {
        throw new Error(`No export ID found for: ${CharacterType[characterType]}`);
    }

    return id;
}