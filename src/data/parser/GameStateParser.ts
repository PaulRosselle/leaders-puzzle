import type { ParsedCharacter, ParsedGameState } from "./ParsedCharacter";
import { PositionLabelMapper } from "./PositionLabelMapper";

type TeamCode = "w" | "b";

export class GameStateParser {
    public static parse(raw: string): ParsedGameState {
        const params = new URLSearchParams(GameStateParser.normalize(raw));

        const characters: ParsedCharacter[] = [];

        this.parseTeam(params.get("white"), "w", characters);
        this.parseTeam(params.get("black"), "b", characters);

        return { characters };
    }

    private static normalize(raw: string): string {
        return raw.startsWith("état|") ? raw.slice("état|".length) : raw;
    }

    private static parseTeam(raw: string | null, team: TeamCode, result: ParsedCharacter[]): void {
        if (!raw) {
            return;
        }

        for (const entry of raw.split(",")) {
            const separatorIndex = entry.indexOf(":");

            if (separatorIndex === -1) {
                continue;
            }

            const position = entry.slice(0, separatorIndex).trim();
            let characterId = entry.slice(separatorIndex + 1).trim();

            // The trailing "f" indicates a transformed character.
            const isFrog = characterId.endsWith("f");

            if (isFrog) {
                characterId = characterId.slice(0, -1);
            }

            if (!characterId) {
                continue;
            }

            const parsedPosition = PositionLabelMapper.fromLabel(position);

            if (!parsedPosition) {
                continue;
            }

            result.push({
                characterId,
                team,
                position: {
                    q: parsedPosition.getQ(),
                    r: parsedPosition.getR(),
                    s: parsedPosition.getS()
                },
                isFrog
            });
        }
    }
}