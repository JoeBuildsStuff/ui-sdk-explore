import { useState } from "react"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

import { AppSidebar } from "./components/app-sidebar"
import { SaveButton } from "./components/save-button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./components/ui/sidebar"
import { useHash } from "./components/use-hash"

type Side = "left" | "right"
type Variant = "sidebar" | "floating" | "inset"
type Collapsible = "offcanvas" | "icon" | "none"

function Option<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-(--ui-muted-foreground)">{label}</span>
      <SegmentedControl
        aria-label={label}
        value={value}
        onValueChange={(next) => next && onChange(next as T)}
      >
        <SegmentedControlIndicator />
        {options.map((option) => (
          <SegmentedControlItem key={option} value={option}>
            {option}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  )
}

function State() {
  const { state, open, isMobile, width } = useSidebar()
  return (
    <p className="text-sm text-(--ui-muted-foreground)">
      state: {state} · open: {String(open)} · mobile: {String(isMobile)} · width:{" "}
      {width.toFixed(1)}rem
    </p>
  )
}

export default function App() {
  const section = useHash("#home").slice(1)
  const [side, setSide] = useState<Side>("left")
  const [variant, setVariant] = useState<Variant>("sidebar")
  const [collapsible, setCollapsible] = useState<Collapsible>("icon")

  return (
    <SidebarProvider>
      <AppSidebar side={side} variant={variant} collapsible={collapsible} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b border-(--sidebar-border) px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <h1 className="text-2xl font-bold">
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </h1>
          <SaveButton />
          <section className="flex flex-col gap-3" aria-label="Sidebar options">
            <h2 className="text-lg font-semibold">Sidebar options</h2>
            <Option label="side" value={side} options={["left", "right"]} onChange={setSide} />
            <Option
              label="variant"
              value={variant}
              options={["sidebar", "floating", "inset"]}
              onChange={setVariant}
            />
            <Option
              label="collapsible"
              value={collapsible}
              options={["offcanvas", "icon", "none"]}
              onChange={setCollapsible}
            />
            <State />
            <p className="text-sm text-(--ui-muted-foreground)">
              Try Cmd/Ctrl+B, drag the sidebar edge to resize, click it to toggle, and
              press / to filter.
            </p>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
