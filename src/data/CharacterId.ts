/**
 * Character Id : the numeric values are identical by the ones used by Mathieu for LBE.
 */
export enum CharacterId {
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

export namespace CharacterId {
    export function isLeader(characterId: CharacterId): boolean {
        return [
            CharacterId.LeaderKing,
            CharacterId.LeaderQueen,
            CharacterId.LeaderVermilion,
        ].includes(characterId);
    }
}
