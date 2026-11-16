import { SaveButton } from "./components/save-button"
import { Sidebar } from "./components/sidebar"
import { useHash } from "./components/use-hash"

export default function App() {
  const section = useHash("#home").slice(1)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="mb-4 text-2xl font-bold">
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </h1>
        <SaveButton />
      </main>
    </div>
  )
}
