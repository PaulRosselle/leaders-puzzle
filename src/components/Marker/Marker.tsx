import type { CSSProperties } from 'react'
import { MARKER_IMAGES } from '../../data/asset/MarkerAsset'
import type { MarkerData } from '../../data/marker/MarkerData'
import { cellStyle } from '../../utils/cellStyle'
import './Marker.css'
import '../Cell/Cell.css'

type MarkerProps = {
  marker: MarkerData
}

export function Marker({ marker }: MarkerProps) {
  // --rotation is read by .cell (see Cell.css). A CSS variable is used because
  // setting `transform` here would override the translation that positions the cell.
  const style = {
    ...cellStyle(marker.position),
    '--rotation': `${marker.rotation ?? 0}deg`,
  } as CSSProperties

  return (
    <img
      className="marker cell"
      src={MARKER_IMAGES[marker.type]}
      alt=""
      style={style}
    />
  )
}