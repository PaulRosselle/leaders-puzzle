import { useState } from 'react'
import type { AnimationEvent, CSSProperties } from 'react'
import { END_GAME_LEADERS, END_GAME_STYLES, EndGameType } from '../../data/EndGameAsset'
import type { CharacterType } from '../../gamelogic/enums/CharacterType'
import './EndGameModal.css'

type Phase = 'showing' | 'shown' | 'hiding'

type EndGameModalProps = {
  playerWon: boolean
  /** Leader of the player (null if not found). */
  leader: CharacterType | null
  /** Called once the hide animation is over. */
  onClosed: () => void
}

export function EndGameModal({ playerWon, leader, onClosed }: EndGameModalProps) {
  const [phase, setPhase] = useState<Phase>('showing')

  const type = playerWon ? EndGameType.Victory : EndGameType.Defeat
  const style = END_GAME_STYLES[type]
  const leaderImage = leader !== null ? END_GAME_LEADERS[type][leader] : undefined

  const handleAnimationEnd = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) {
      return
    }
    if (phase === 'showing') {
      setPhase('shown')
    } else if (phase === 'hiding') {
      onClosed()
    }
  }

  // Not clickable while the show animation is playing.
  const handleClick = () => {
    if (phase === 'shown') {
      setPhase('hiding')
    }
  }

  return (
    <div
      className={`end-game end-game--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-game-title"
      style={{ '--end-color': style.color } as CSSProperties}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="end-game__stage">
        <div className="end-game__leader-box">
          {leaderImage !== undefined && (
            <img
              className="end-game__leader"
              src={leaderImage}
              alt=""
              style={{ backgroundImage: `url(${style.leaderBackground})` }}
            />
          )}
        </div>

        <div className="end-game__title-bar" />

        <div className="end-game__title-row">
          <img className="end-game__side" src={style.side} alt="" />
          <h1 id="end-game-title" className="end-game__title">
            {style.title}
          </h1>
          <img className="end-game__side end-game__side--right" src={style.side} alt="" />
        </div>

        <p className="end-game__subtitle">{style.subtitle}</p>
      </div>
    </div>
  )
}