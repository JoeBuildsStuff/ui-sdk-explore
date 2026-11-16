import { Button } from "@ui-sdk/react/button"
import { Separator } from "@ui-sdk/react/separator"

const mainLinks = [
  { label: "Home", href: "#home" },
  { label: "Components", href: "#components" },
  { label: "Docs", href: "#docs" },
]

const otherLinks = [{ label: "Settings", href: "#settings" }]

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">ui-sdk-explore</h2>
      <nav aria-label="Main">
        {mainLinks.map((link) => (
          <Button key={link.href} render={<a href={link.href} />}>
            {link.label}
          </Button>
        ))}
        <Separator />
        {otherLinks.map((link) => (
          <Button key={link.href} render={<a href={link.href} />}>
            {link.label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}

export { Sidebar }
