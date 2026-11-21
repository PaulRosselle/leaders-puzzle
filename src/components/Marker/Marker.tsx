import { MARKER_IMAGES } from '../../data/MarkerAsset'
import type { MarkerData } from '../../data/MarkerData'
import { cellStyle } from '../../utils/cellStyle'
import './Marker.css'
import '../Cell/Cell.css'

type MarkerProps = {
  marker: MarkerData
}

export function Marker({ marker }: MarkerProps) {
  return (
    <img
      className="marker cell"
      src={MARKER_IMAGES[marker.type]}
      alt=""
      style={cellStyle(marker.position)}
    />
  )
}
