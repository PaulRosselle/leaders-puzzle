import { ANIMATION_SPEED_LEVELS, type Language, type ToolbarPosition } from '../../settings/Settings'
import { useSettings } from '../../settings/useSettings'
import { Modal } from '../Modal/Modal'
import { SegmentedControl, type SegmentedOption } from '../controls/SegmentedControl'
import { Slider } from '../controls/Slider'
import { Switch } from '../controls/Switch'
import { SettingRow } from './SettingRow'
import './SettingsModal.css'

// TODO - handle english (all the texts below)
const TEXTS = {
  title: 'Paramètres',
  close: 'Fermer',
  coordinates: {
    title: 'Indices plateau',
    description: 'Affiche les coordonnées de chaque case du plateau',
  },
  animationSpeed: {
    title: 'Vitesse d’animation',
    description: 'Vitesse de lecture des animations d’actions',
    slow: 'Lente',
    fast: 'Rapide',
  },
  playableAnimation: {
    title: 'Animation de jouabilité',
    description: 'Joue une animation sur les éléments avec lesquels le joueur peut interagir',
  },
  toolbarPosition: {
    title: 'Position de la barre d’actions',
    description: 'Place la barre d’actions à gauche ou à droite de l’écran',
    left: 'Gauche',
    right: 'Droite',
  },
  language: {
    title: 'Langue',
  },
}

const TOOLBAR_POSITION_OPTIONS: readonly SegmentedOption<ToolbarPosition>[] = [
  { value: 'left', label: TEXTS.toolbarPosition.left },
  { value: 'right', label: TEXTS.toolbarPosition.right },
]

// Each language is written in its own language, so that anyone can find theirs.
const LANGUAGE_OPTIONS: readonly SegmentedOption<Language>[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

/** "×0,75" (TODO - handle english: decimal separator). */
function formatSpeed(speed: number): string {
  return `×${String(speed).replace('.', ',')}`
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSettings()
  const speedIndex = Math.max(0, ANIMATION_SPEED_LEVELS.indexOf(settings.animationSpeed))

  return (
    <Modal labelledBy="settings-modal-title" onClose={onClose} panelClassName="settings-modal">
      <header className="settings-modal__header">
        <h2 id="settings-modal-title" className="settings-modal__title">
          {TEXTS.title}
        </h2>

        <button type="button" className="settings-modal__close" aria-label={TEXTS.close} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="settings-modal__body">
        <SettingRow id="setting-coordinates" {...TEXTS.coordinates}>
          {(a11y) => (
            <Switch
              checked={settings.showBoardCoordinates}
              onChange={(showBoardCoordinates) => updateSettings({ showBoardCoordinates })}
              {...a11y}
            />
          )}
        </SettingRow>

        <SettingRow
          id="setting-animation-speed"
          title={TEXTS.animationSpeed.title}
          description={TEXTS.animationSpeed.description}
          layout="stacked"
        >
          {(a11y) => (
            <Slider
              min={0}
              max={ANIMATION_SPEED_LEVELS.length - 1}
              value={speedIndex}
              onChange={(index) => updateSettings({ animationSpeed: ANIMATION_SPEED_LEVELS[index] })}
              valueText={formatSpeed(ANIMATION_SPEED_LEVELS[speedIndex])}
              minLabel={TEXTS.animationSpeed.slow}
              maxLabel={TEXTS.animationSpeed.fast}
              {...a11y}
            />
          )}
        </SettingRow>

        <SettingRow id="setting-playable-animation" {...TEXTS.playableAnimation}>
          {(a11y) => (
            <Switch
              checked={settings.playableAnimation}
              onChange={(playableAnimation) => updateSettings({ playableAnimation })}
              {...a11y}
            />
          )}
        </SettingRow>

        {/* Only in landscape: in portrait the toolbar is at the bottom, whatever the setting. */}
        <SettingRow
          id="setting-toolbar-position"
          title={TEXTS.toolbarPosition.title}
          description={TEXTS.toolbarPosition.description}
          className="setting-row--landscape-only"
        >
          {(a11y) => (
            <SegmentedControl
              options={TOOLBAR_POSITION_OPTIONS}
              value={settings.toolbarPosition}
              onChange={(toolbarPosition) => updateSettings({ toolbarPosition })}
              {...a11y}
            />
          )}
        </SettingRow>

        {/* TODO: no visible effect until the localization is implemented. */}
        <SettingRow id="setting-language" title={TEXTS.language.title}>
          {(a11y) => (
            <SegmentedControl
              options={LANGUAGE_OPTIONS}
              value={settings.language}
              onChange={(language) => updateSettings({ language })}
              {...a11y}
            />
          )}
        </SettingRow>
      </div>
    </Modal>
  )
}