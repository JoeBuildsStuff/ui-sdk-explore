import { useState } from "react"
import { Button } from "@ui-sdk/react/button"
import { Separator } from "@ui-sdk/react/separator"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { Toggle } from "@ui-sdk/react/toggle"

import { useHash } from "./use-hash"

const mainLinks = [
  { label: "Home", href: "#home" },
  { label: "Components", href: "#components" },
  { label: "Docs", href: "#docs" },
]

const otherLinks = [{ label: "Settings", href: "#settings" }]

function Sidebar() {
  const active = useHash("#home")
  const [collapsed, setCollapsed] = useState(false)
  const hint = useShortcutHint("mod+b")

  useShortcut("mod+b", () => setCollapsed((value) => !value), {
    description: "Toggle sidebar",
  })

  const renderLink = (link: { label: string; href: string }) => (
    <Button
      key={link.href}
      aria-label={link.label}
      title={link.label}
      aria-current={active === link.href ? "page" : undefined}
      data-active={active === link.href ? "" : undefined}
      render={<a href={link.href} />}
    >
      <span aria-hidden="true" className="sidebar-initial">
        {link.label[0]}
      </span>
      <span className="sidebar-label">{link.label}</span>
    </Button>
  )

  return (
    <aside className="sidebar" data-collapsed={collapsed ? "" : undefined}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">ui-sdk-explore</h2>
        <Toggle
          aria-label="Collapse sidebar"
          aria-keyshortcuts={hint.ariaKeyshortcuts}
          title={`Collapse sidebar (${hint.text})`}
          pressed={collapsed}
          onPressedChange={setCollapsed}
        >
          {collapsed ? "»" : "«"}
        </Toggle>
      </div>
      <nav aria-label="Main">
        {mainLinks.map(renderLink)}
        <Separator />
        {otherLinks.map(renderLink)}
      </nav>
    </aside>
  )
}

export { Sidebar }
