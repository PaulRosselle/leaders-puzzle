import { useTranslation } from 'react-i18next'
import { getDescriptionKey, type CharacterPortrait } from '../../data/CharacterPortrait'
import { getPortraitSource } from '../../data/PortraitAsset'
import { getAbilitySource } from '../../data/AbilityAsset'
import { getPortraitAbilities } from '../../data/PortraitAbilities'

type PortraitDescriptionProps = {
  portrait: CharacterPortrait
}

/** Portrait, name and description of a character. */
export function PortraitDescription({ portrait }: PortraitDescriptionProps) {
  const { t } = useTranslation('portraits')
  const source = getPortraitSource(portrait)
  const abilities = getPortraitAbilities(portrait)
  // A blank line in the translation separates two paragraphs.
  const paragraphs = t(`descriptions.${getDescriptionKey(portrait)}`).split('\n\n')

  return (
    <div className="portrait-description">
      {source !== undefined && <img className="portrait-description__image" src={source} alt="" />}
      <div className="portrait-description__header">
        <h2 className="portrait-description__title">{t(`names.${portrait}`)}</h2>
        <ul className="portrait-description__abilities">
          {abilities.map((ability) => {
            const abilitySource = getAbilitySource(ability)
            return (
              abilitySource !== undefined && (
                <li key={ability}>
                  <img className="portrait-description__ability" src={abilitySource} alt={t(`abilities.${ability}`)} />
                </li>
              )
            )
          })}
        </ul>
      </div>
      <div className="portrait-description__info">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}
