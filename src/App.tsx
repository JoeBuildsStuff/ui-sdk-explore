import { SaveButton } from "./components/save-button"
import { Sidebar } from "./components/sidebar"

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main>
        <h1>ui-sdk-explore</h1>
        <SaveButton />
      </main>
    </div>
  )
}
