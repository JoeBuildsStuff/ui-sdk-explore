import { useState, type ComponentType } from "react"
import { Button } from "@ui-sdk/react/button"
import { createInputController, Input, InputClear, InputGroup } from "@ui-sdk/react/input"
import { Separator } from "@ui-sdk/react/separator"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { Toggle } from "@ui-sdk/react/toggle"
import {
  BookOpenIcon,
  BoxesIcon,
  HomeIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"

import { useHash } from "./use-hash"

type NavLink = {
  label: string
  href: string
  icon: ComponentType<{ "aria-hidden"?: boolean }>
}

const mainLinks: NavLink[] = [
  { label: "Home", href: "#home", icon: HomeIcon },
  { label: "Components", href: "#components", icon: BoxesIcon },
  { label: "Docs", href: "#docs", icon: BookOpenIcon },
]

const otherLinks: NavLink[] = [
  { label: "Settings", href: "#settings", icon: SettingsIcon },
]

const storageKey = "sidebar-collapsed"

function readCollapsed() {
  try {
    return localStorage.getItem(storageKey) === "true"
  } catch {
    return false
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(storageKey, String(value))
  } catch {
    // Storage can be blocked; the sidebar still works for this visit.
  }
}

function Sidebar() {
  const active = useHash("#home")
  const [collapsed, setCollapsedState] = useState(readCollapsed)
  const [query, setQuery] = useState("")
  const [filter] = useState(createInputController)
  const toggleHint = useShortcutHint("mod+b")
  const filterHint = useShortcutHint("/")

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    writeCollapsed(value)
  }

  useShortcut("mod+b", () => setCollapsed(!collapsed), {
    description: "Toggle sidebar",
  })
  useShortcut(
    "/",
    () => {
      setCollapsed(false)
      filter.focus()
    },
    { description: "Filter sidebar links" }
  )

  const needle = collapsed ? "" : query.trim().toLowerCase()
  const matches = (link: NavLink) => link.label.toLowerCase().includes(needle)
  const visibleMain = mainLinks.filter(matches)
  const visibleOther = otherLinks.filter(matches)

  const renderLink = (link: NavLink) => (
    <Button
      key={link.href}
      aria-label={link.label}
      title={link.label}
      aria-current={active === link.href ? "page" : undefined}
      data-active={active === link.href ? "" : undefined}
      render={<a href={link.href} />}
    >
      <link.icon aria-hidden />
      <span className="sidebar-label">{link.label}</span>
    </Button>
  )

  return (
    <aside className="sidebar" data-collapsed={collapsed ? "" : undefined}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">ui-sdk-explore</h2>
        <Toggle
          aria-label="Collapse sidebar"
          aria-keyshortcuts={toggleHint.ariaKeyshortcuts}
          title={`Collapse sidebar (${toggleHint.text})`}
          pressed={collapsed}
          onPressedChange={setCollapsed}
        >
          {collapsed ? "»" : "«"}
        </Toggle>
      </div>
      <InputGroup className="sidebar-filter">
        <Input
          type="search"
          controller={filter}
          aria-label="Filter links"
          aria-keyshortcuts={filterHint.ariaKeyshortcuts}
          placeholder={`Filter (${filterHint.text})`}
          value={query}
          onValueChange={setQuery}
        />
        <InputClear aria-label="Clear filter">
          <XIcon aria-hidden="true" />
        </InputClear>
      </InputGroup>
      <nav aria-label="Main">
        {visibleMain.map(renderLink)}
        {visibleMain.length > 0 && visibleOther.length > 0 && <Separator />}
        {visibleOther.map(renderLink)}
        {visibleMain.length + visibleOther.length === 0 && (
          <p className="sidebar-empty" role="status">
            No matching links
          </p>
        )}
      </nav>
    </aside>
  )
}

export { Sidebar }
