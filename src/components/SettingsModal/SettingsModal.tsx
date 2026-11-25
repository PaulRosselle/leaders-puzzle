import { useTranslation } from 'react-i18next'
import {
  ANIMATION_SPEED_LEVELS,
  TOOLBAR_POSITIONS,
  type Language,
  type ToolbarPosition,
} from '../../settings/Settings'
import { useSettings } from '../../settings/useSettings'
import { Modal } from '../Modal/Modal'
import { SegmentedControl, type SegmentedOption } from '../controls/SegmentedControl'
import { Slider } from '../controls/Slider'
import { Switch } from '../controls/Switch'
import { SettingRow } from './SettingRow'
import './SettingsModal.css'
import { HighlightColor } from '../../data/highlight/HighlightColor'
import { HighlightColorControl, type HighlightColorOption } from '../controls/HighlightColorControl/HighlightColorControl'

// Each language is written in its own language, so that anyone can find theirs.
const LANGUAGE_OPTIONS: readonly SegmentedOption<Language>[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

const HIGHLIGHT_COLOR_OPTIONS: readonly HighlightColorOption[] = [
  { value: HighlightColor.Default, label: 'Default' },
  { value: HighlightColor.Blue, label: 'Blue' },
  { value: HighlightColor.Red, label: 'Red' },
  { value: HighlightColor.Green, label: 'Green' },
  { value: HighlightColor.Neon, label: 'Neon' },
]

/** "×0,75" in French, "×0.75" in English. */
function formatSpeed(speed: number, language: Language): string {
  return `×${new Intl.NumberFormat(language).format(speed)}`
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('settings')
  const { settings, updateSettings } = useSettings()
  const toolbarPositionOptions: readonly SegmentedOption<ToolbarPosition>[] = TOOLBAR_POSITIONS.map(
    (position) => ({ value: position, label: t(`toolbarPosition.${position}`) }),
  )
  const speedIndex = Math.max(0, ANIMATION_SPEED_LEVELS.indexOf(settings.animationSpeed))

  return (
    <Modal labelledBy="settings-modal-title" onClose={onClose} panelClassName="settings-modal">
      <header className="settings-modal__header">
        <h2 id="settings-modal-title" className="settings-modal__title">
          {t('title')}
        </h2>

        <button type="button" className="settings-modal__close" aria-label={t('close')} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="settings-modal__body">
        <SettingRow
          id="setting-coordinates"
          title={t('coordinates.title')}
          description={t('coordinates.description')}
        >
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
          title={t('animationSpeed.title')}
          layout="stacked"
        >
          {(a11y) => (
            <Slider
              min={0}
              max={ANIMATION_SPEED_LEVELS.length - 1}
              value={speedIndex}
              onChange={(index) => updateSettings({ animationSpeed: ANIMATION_SPEED_LEVELS[index] })}
              valueText={formatSpeed(ANIMATION_SPEED_LEVELS[speedIndex], settings.language)}
              minLabel={t('animationSpeed.slow')}
              maxLabel={t('animationSpeed.fast')}
              {...a11y}
            />
          )}
        </SettingRow>

        <SettingRow
          id="setting-playable-animation"
          title={t('playableAnimation.title')}
          description={t('playableAnimation.description')}
        >
          {(a11y) => (
            <Switch
              checked={settings.playableAnimation}
              onChange={(playableAnimation) => updateSettings({ playableAnimation })}
              {...a11y}
            />
          )}
        </SettingRow>

        <SettingRow
          id="setting-highlight-color"
          title={t('highlightColor.title')}
          layout="stacked"
        >
          {(a11y) => (
            <HighlightColorControl
              options={HIGHLIGHT_COLOR_OPTIONS}
              value={settings.highlightColor}
              onChange={(highlightColor) => updateSettings({ highlightColor })}
              {...a11y}
            />
          )}
        </SettingRow>

        {/* Only in landscape: in portrait the toolbar is at the bottom, whatever the setting. */}
        <SettingRow
          id="setting-toolbar-position"
          title={t('toolbarPosition.title')}
          description={t('toolbarPosition.description')}
          className="setting-row--landscape-only"
        >
          {(a11y) => (
            <SegmentedControl
              options={toolbarPositionOptions}
              value={settings.toolbarPosition}
              onChange={(toolbarPosition) => updateSettings({ toolbarPosition })}
              {...a11y}
            />
          )}
        </SettingRow>

        <SettingRow id="setting-language" title={t('language.title')}>
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