import { SaveButton } from "./components/save-button"
import { Sidebar } from "./components/sidebar"
import { useHash } from "./components/use-hash"

export default function App() {
  const section = useHash("#home").slice(1)

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <h1>{section.charAt(0).toUpperCase() + section.slice(1)}</h1>
        <SaveButton />
      </main>
    </div>
  )
}
