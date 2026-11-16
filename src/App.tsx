import { SaveButton } from "./components/save-button"
import { ModeToggle } from "./components/mode-toggle"
import { Sidebar } from "./components/sidebar"
import { useHash } from "./components/use-hash"

export default function App() {
  const section = useHash("#home").slice(1)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </h1>
          <ModeToggle />
        </div>
        <SaveButton />
      </main>
    </div>
  )
}
