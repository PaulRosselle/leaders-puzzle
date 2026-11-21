import type { CSSProperties } from 'react'
import type { Position } from '../data/Position'

export function cellStyle({ q, r }: Position): CSSProperties {
  return { '--q': q, '--r': r } as CSSProperties
}