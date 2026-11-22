import { Board } from './components/Board/Board'
import { DEMO_MARKERS, DemoSetup } from './data/demoSetup'

export default function App() {
  return <Board pieces={DemoSetup.getPieces()} markers={DEMO_MARKERS} />
}
