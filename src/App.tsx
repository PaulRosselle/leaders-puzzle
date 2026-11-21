import { Board } from './components/Board/Board'
import { DEMO_MARKERS, DEMO_PIECES } from './data/demoSetup'

export default function App() {
  return <Board pieces={DEMO_PIECES} markers={DEMO_MARKERS} />
}
