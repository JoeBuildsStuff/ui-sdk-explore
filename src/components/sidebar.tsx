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
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
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
      className="justify-start gap-2 group-data-collapsed:justify-center data-active:bg-(--ui-muted) data-active:font-semibold"
      render={<a href={link.href} />}
    >
      <link.icon aria-hidden className="size-4 shrink-0" />
      <span className="group-data-collapsed:hidden">{link.label}</span>
    </Button>
  )

  return (
    <aside
      className="group flex w-64 shrink-0 flex-col border-r border-(--ui-border) p-4 transition-[width] duration-150 data-collapsed:w-14 data-collapsed:px-2"
      data-collapsed={collapsed ? "" : undefined}
    >
      <div className="mb-4 flex items-center justify-between gap-2 group-data-collapsed:flex-col">
        <h2 className="text-base font-semibold group-data-collapsed:hidden">ui-sdk-explore</h2>
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
      <InputGroup className="relative mb-3 flex items-center group-data-collapsed:hidden">
        <Input
          type="search"
          className="w-full pr-8 [&::-webkit-search-cancel-button]:hidden"
          controller={filter}
          aria-label="Filter links"
          aria-keyshortcuts={filterHint.ariaKeyshortcuts}
          placeholder={`Filter (${filterHint.text})`}
          value={query}
          onValueChange={setQuery}
        />
        <InputClear
          aria-label="Clear filter"
          className="absolute right-1 size-6 border-0 bg-transparent p-0"
        >
          <XIcon aria-hidden="true" className="size-3.5" />
        </InputClear>
      </InputGroup>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {visibleMain.map(renderLink)}
        {visibleMain.length > 0 && visibleOther.length > 0 && <Separator />}
        {visibleOther.map(renderLink)}
        {visibleMain.length + visibleOther.length === 0 && (
          <p
            className="my-2 text-sm text-(--ui-muted-foreground) group-data-collapsed:hidden"
            role="status"
          >
            No matching links
          </p>
        )}
      </nav>
    </aside>
  )
}

export { Sidebar }
