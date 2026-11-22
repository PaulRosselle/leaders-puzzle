import type { CharacterState } from "../../../gamelogic/entities/states/CharacterState";
import { GameStateSerializer } from "./GameStateSerializer";

export class GameUrlWriter {
    public static writer(characterStates: CharacterState[],
                         baseUrl: string = window.location.origin + window.location.pathname): string {
        const state = GameStateSerializer.serialize(characterStates);

        return `${baseUrl}#${state}`;
    }
}
