import type { ActionMotion } from '../gamelogic/entities/actions/ActionMotion'
import type { ActionTarget } from '../gamelogic/entities/actions/ActionTarget'
import type { Position } from '../gamelogic/entities/core/Position'
import { ActionMotionType } from '../gamelogic/enums/ActionMotionType'
import { HighlightStatus } from './HighlightStatus'
import type { PieceData } from './PieceData'

/**
 * Returns the pieces as they are displayed once the given motions are applied.
 * Pure function: the input is never modified.
 */
export function applyMotions(pieces: readonly PieceData[], motions: readonly ActionMotion[]): PieceData[] {
  let result = [...pieces]

  for (const motion of motions) {
    result = applyMotion(result, motion)
  }

  return result
}

function applyMotion(pieces: PieceData[], motion: ActionMotion): PieceData[] {
  switch (motion.motionType) {
    case ActionMotionType.Add:
      return [...pieces, ...motion.targets.map(createPiece)]

    case ActionMotionType.Remove: {
      const removedIds = new Set(motion.targets.map((target) => target.character.id))
      return pieces.filter((piece) => !removedIds.has(piece.id))
    }

    case ActionMotionType.Transform:
    case ActionMotionType.Untransform: {
      // First target = the character before, second target = the character after.
      const [source, destination] = motion.targets
      if (source === undefined || destination === undefined) {
        throw new Error('Invalid transform motion : expected exactly 2 targets')
      }
      return pieces.map((piece) =>
        piece.id === source.character.id ? createPiece(destination) : piece,
      )
    }

    default:
      // Move, Teleport, Push, Swap, Jump, Fly: the targets end at their destination.
      return moveTargets(pieces, motion.targets)
  }
}

function moveTargets(pieces: PieceData[], targets: readonly ActionTarget[]): PieceData[] {
  const destinations = new Map<string, Position>()
  for (const target of targets) {
    if (target.destPos !== null) {
      destinations.set(target.character.id, target.destPos)
    }
  }

  return pieces.map((piece) => {
    const destination = destinations.get(piece.id)
    if (destination === undefined) {
      return piece
    }

    // A moved piece loses its highlight (and therefore the 6.5% inset that
    // goes with it), like setIsHighlighted(false) in setupForMovement.
    return { 
      ...piece, 
      position: destination, 
      highlightStatus: HighlightStatus.Disabled, 
      ransformedCharacter: null, 
    }
  })
}

function createPiece(target: ActionTarget): PieceData {
  if (target.destPos === null) {
    throw new Error('Invalid motion target : missing destination position')
  }

  return {
    id: target.character.id,
    character: target.character.characterType,
    team: target.character.team,
    position: target.destPos,
    highlightStatus: HighlightStatus.Disabled,
    transformedCharacter: null,
  }
}