import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"
import { usePreference } from "@ui-sdk/react/preferences"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { colorScheme } from "../lib/color-scheme"

const modes = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const

function ModeToggle() {
  const { value } = usePreference(colorScheme)

  return (
    <SegmentedControl
      aria-label="Color mode"
      value={value}
      onValueChange={(next) => {
        if (next) colorScheme.set(next as (typeof modes)[number]["value"])
      }}
    >
      <SegmentedControlIndicator />
      {modes.map(({ value, label, icon: Icon }) => (
        <SegmentedControlItem key={value} value={value} aria-label={label} title={label}>
          <Icon aria-hidden="true" className="size-4" />
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}

export { ModeToggle }
