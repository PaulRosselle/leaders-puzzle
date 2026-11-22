import { Action } from "../../../gamelogic/entities/actions/Action";
import { ActionMotion } from "../../../gamelogic/entities/actions/ActionMotion";
import { ActionTarget } from "../../../gamelogic/entities/actions/ActionTarget";
import { GameHistory } from "../../../gamelogic/entities/actions/GameHistory";
import { Character } from "../../../gamelogic/entities/core/Character";
import { Position } from "../../../gamelogic/entities/core/Position";
import { ActionMotionType } from "../../../gamelogic/enums/ActionMotionType";
import { CharacterType } from "../../../gamelogic/enums/CharacterType";
import { Team } from "../../../gamelogic/enums/Team";
import { CHARACTER_ID_MAPPING } from "../CharacterIdMapping";
import type { ParsedGameState } from "../ParsedCharacter";

export class GameHistoryFactory {

    public static fromParsedState(state: ParsedGameState): GameHistory {
        const initialActions: Action[] = [];

        for (const parsedCharacter of state.characters) {

            const characterType = CHARACTER_ID_MAPPING[parsedCharacter.characterId];

            if (characterType === undefined) {
                throw new Error(`Unknown character ID: ${parsedCharacter.characterId}`);
            }

            const team = parsedCharacter.team === "w" ? Team.White : Team.Black;

            const position = Position.fromAxial(
                parsedCharacter.position.q,
                parsedCharacter.position.r,
                parsedCharacter.position.s
            );

            const character = Character.create(characterType, team);

            // First motion: Add character to the board.
            const addMotion = new ActionMotion(
                ActionMotionType.Add,
                [new ActionTarget(character, null, position)]
            );

            const motions: ActionMotion[] = [addMotion];

            // Second motion: Transform character into a Frog.
            if (parsedCharacter.isFrog) {
                const transformedCharacter = Character.transform(
                    character, CharacterType.Frog, team
                );

                const transformMotion = new ActionMotion(
                    ActionMotionType.Transform,
                    [
                        new ActionTarget(character, position, null),
                        new ActionTarget(transformedCharacter, null, position)
                    ]
                );

                motions.push(transformMotion);
            }

            initialActions.push(new Action(character, motions));
        }

        return new GameHistory(initialActions, []);
    }
}