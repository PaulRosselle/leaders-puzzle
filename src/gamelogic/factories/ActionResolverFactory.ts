import type { GameHistory } from "../entities/actions/GameHistory";
import type { Character } from "../entities/core/Character";
import type { Game } from "../entities/projection/Game";
import { CharacterType } from "../enums/CharacterType";

import { ActionResolver } from "../resolvers/ActionResolver";
import { AcrobatActionResolver } from "../resolvers/characters/AcrobatActionResolver";
import { BrewmasterActionResolver } from "../resolvers/characters/BrewmasterActionResolver";
import { BruiserActionResolver } from "../resolvers/characters/BruiserActionResolver";
import { ClawLauncherActionResolver } from "../resolvers/characters/ClawLauncherActionResolver";
import { FrogActionResolver } from "../resolvers/characters/FrogActionResolver";
import { IllusionistActionResolver } from "../resolvers/characters/IllusionistActionResolver";
import { ManipulatorActionResolver } from "../resolvers/characters/ManipulatorActionResolver";
import { NemesisActionResolver } from "../resolvers/characters/NemesisActionResolver";
import { RiderActionResolver } from "../resolvers/characters/RiderActionResolver";
import { RoyalGuardActionResolver } from "../resolvers/characters/RoyalGuardActionResolver";
import { ShamanActionResolver } from "../resolvers/characters/ShamanActionResolver";
import { TacticianActionResolver } from "../resolvers/characters/TacticianActionResolver";
import { WandererActionResolver } from "../resolvers/characters/WandererActionResolver";
import { WispActionResolver } from "../resolvers/characters/WispActionResolver";

export class ActionResolverFactory {

    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    public static create(game: Game, gameHistory: GameHistory, character: Character): ActionResolver {
        switch (character.characterType) {
            case CharacterType.Acrobat: return new AcrobatActionResolver(game, gameHistory, character);
            case CharacterType.Brewmaster: return new BrewmasterActionResolver(game, gameHistory, character);
            case CharacterType.Bruiser: return new BruiserActionResolver(game, gameHistory, character);
            case CharacterType.ClawLauncher: return new ClawLauncherActionResolver(game, gameHistory, character);
            case CharacterType.Illusionist: return new IllusionistActionResolver(game, gameHistory, character);
            case CharacterType.Manipulator: return new ManipulatorActionResolver(game, gameHistory, character);
            case CharacterType.Nemesis: return new NemesisActionResolver(game, gameHistory, character);
            case CharacterType.Rider: return new RiderActionResolver(game, gameHistory, character);
            case CharacterType.RoyalGuard: return new RoyalGuardActionResolver(game, gameHistory, character);
            case CharacterType.Wanderer: return new WandererActionResolver(game, gameHistory, character);
            case CharacterType.Shaman: return new ShamanActionResolver(game, gameHistory, character);
            case CharacterType.Frog: return new FrogActionResolver(game, gameHistory, character);
            case CharacterType.Tactician: return new TacticianActionResolver(game, gameHistory, character);
            case CharacterType.Wisp: return new WispActionResolver(game, gameHistory, character);
            default: return new ActionResolver(game, gameHistory, character);
        }
    }
}