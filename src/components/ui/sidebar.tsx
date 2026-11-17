import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerTitle,
} from "@ui-sdk/react/drawer"
import { Input } from "@ui-sdk/react/input"
import { Separator } from "@ui-sdk/react/separator"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "../../hooks/use-is-mobile"

const SIDEBAR_STORAGE_KEY = "sidebar-open"
const SIDEBAR_WIDTH_KEY = "sidebar-width"
const SIDEBAR_SHORTCUT = "mod+b"
const SIDEBAR_MIN_WIDTH = 12
const SIDEBAR_MAX_WIDTH = 24
const SIDEBAR_DEFAULT_WIDTH = 16

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ")

type ClassName<State> = string | ((state: State) => string | undefined) | undefined

function withClass<State>(base: string, className: ClassName<State>) {
  if (typeof className === "function") {
    return (state: State) => cn(base, className(state))
  }
  return cn(base, className)
}

type SidebarContextValue = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  width: number
  setWidth: (width: number) => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}

function readStoredOpen(fallback: boolean) {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored === null ? fallback : stored === "true"
  } catch {
    return fallback
  }
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [openState, setOpenState] = React.useState(() =>
    readStoredOpen(defaultOpen)
  )
  const open = openProp ?? openState
  const [width, setWidthState] = React.useState(() => {
    try {
      const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY))
      return stored >= SIDEBAR_MIN_WIDTH && stored <= SIDEBAR_MAX_WIDTH
        ? stored
        : SIDEBAR_DEFAULT_WIDTH
    } catch {
      return SIDEBAR_DEFAULT_WIDTH
    }
  })

  const setWidth = React.useCallback((next: number) => {
    const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, next))
    setWidthState(clamped)
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(clamped))
    } catch {
      // Storage can be blocked; the width still applies for this visit.
    }
  }, [])

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (onOpenChange) onOpenChange(value)
      else setOpenState(value)
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value))
      } catch {
        // Storage can be blocked; the sidebar still works for this visit.
      }
    },
    [onOpenChange]
  )

  const toggleSidebar = React.useCallback(
    () => (isMobile ? setOpenMobile((value) => !value) : setOpen(!open)),
    [isMobile, open, setOpen]
  )

  useShortcut(SIDEBAR_SHORTCUT, toggleSidebar, { description: "Toggle sidebar" })

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      width,
      setWidth,
    }),
    [open, setOpen, openMobile, isMobile, toggleSidebar, width, setWidth]
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": `${width}rem`,
            "--sidebar-width-icon": "3rem",
            ...style,
          } as React.CSSProperties
        }
        className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

type SidebarProps = React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-(--sidebar) text-(--sidebar-foreground)",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Drawer side={side} open={openMobile} onOpenChange={setOpenMobile}>
        <DrawerBackdrop />
        <DrawerContent
          data-slot="sidebar"
          data-mobile="true"
          className="w-72 bg-(--sidebar) p-0 text-(--sidebar-foreground)"
        >
          <DrawerTitle className="sr-only">Sidebar</DrawerTitle>
          <div className="flex h-full w-full flex-col">{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <div
      className="group peer hidden text-(--sidebar-foreground) data-[side=right]:order-last md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          variant === "sidebar"
            ? "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            : "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          "data-[side=left]:left-0 data-[side=right]:right-0",
          "group-data-[collapsible=offcanvas]:data-[side=left]:left-[calc(var(--sidebar-width)*-1)]",
          "group-data-[collapsible=offcanvas]:data-[side=right]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "sidebar"
            ? "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l"
            : "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]",
          className
        )}
        data-side={side}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className={cn(
            "flex size-full flex-col border-(--sidebar-border) bg-(--sidebar)",
            variant === "floating" && "rounded-lg border shadow-sm",
            variant === "inset" && "rounded-lg"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()
  const hint = useShortcutHint(SIDEBAR_SHORTCUT)

  return (
    <Button
      data-slot="sidebar-trigger"
      aria-label="Toggle sidebar"
      aria-keyshortcuts={hint.ariaKeyshortcuts}
      title={`Toggle sidebar (${hint.text})`}
      className={withClass("size-8 p-0", className)}
      onClick={(...args) => {
        onClick?.(...args)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon aria-hidden="true" className="size-4" />
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar, setWidth, state } = useSidebar()
  const drag = React.useRef<{ x: number; moved: boolean } | null>(null)

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    drag.current = { x: event.clientX, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current
    if (!current || state === "collapsed") return
    if (Math.abs(event.clientX - current.x) > 3) current.moved = true
    if (!current.moved) return
    const container = event.currentTarget.closest('[data-slot="sidebar-container"]')
    if (!container) return
    const rect = container.getBoundingClientRect()
    const side = container.getAttribute("data-side")
    const px = side === "right" ? rect.right - event.clientX : event.clientX - rect.left
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    setWidth(px / rem)
  }

  const onPointerUp = () => {
    const current = drag.current
    drag.current = null
    if (current && !current.moved) toggleSidebar()
  }

  return (
    <button
      type="button"
      data-slot="sidebar-rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      title="Click to toggle, drag to resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 touch-none -translate-x-1/2 cursor-col-resize transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-(--sidebar-border) group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "group-data-[collapsible=icon]:cursor-e-resize",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-svh w-full flex-1 flex-col bg-(--ui-background)",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[side=left]:ml-0 md:peer-data-[variant=inset]:peer-data-[side=right]:mr-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      className={withClass("w-full", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      className={withClass("mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

type RenderProps = { render?: React.ReactElement }

function SidebarGroupLabel({
  className,
  render,
  ...props
}: React.ComponentProps<"div"> & RenderProps) {
  const classes = cn(
    "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-(--sidebar-foreground)/70 transition-[margin,opacity] duration-200 ease-linear",
    "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
    className
  )
  if (render) {
    return React.cloneElement(render, {
      "data-slot": "sidebar-group-label",
      className: cn(classes, (render.props as { className?: string }).className),
      ...props,
    } as Record<string, unknown>)
  }
  return <div data-slot="sidebar-group-label" className={classes} {...props} />
}

function SidebarGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="sidebar-group-action"
      className={cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground) [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

type SidebarMenuButtonProps = React.ComponentProps<typeof Button> & {
  isActive?: boolean
  tooltip?: string
}

function SidebarMenuButton({
  isActive = false,
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state, setOpenMobile } = useSidebar()
  const { onClick } = props

  const button = (
    <Button
      data-slot="sidebar-menu-button"
      data-active={isActive ? "" : undefined}
      aria-current={isActive && props.render ? "page" : undefined}
      className={withClass(
        cn(
        "peer/menu-button h-8 w-full justify-start gap-2 no-underline overflow-hidden border-0 bg-transparent px-2 text-left text-sm font-normal hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground) data-active:bg-(--sidebar-accent) data-active:font-medium data-active:text-(--sidebar-accent-foreground) [&>svg]:size-4 [&>svg]:shrink-0 [&>span:last-child]:truncate",
        "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:[&>span]:hidden",
        ),
        className
      )}
      {...props}
      onClick={(...args) => {
        onClick?.(...args)
        if (isMobile && props.render) setOpenMobile(false)
      }}
    />
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent
        side="right"
        hidden={state !== "collapsed" || isMobile}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="sidebar-menu-action"
      className={cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-(--sidebar-foreground) hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground) [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        "pointer-events-none absolute top-1.5 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <div className="size-4 animate-pulse rounded-md bg-(--ui-muted)" />
      )}
      <div
        className="h-4 max-w-(--skeleton-width) flex-1 animate-pulse rounded-md bg-(--ui-muted)"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-(--sidebar-border) px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  isActive = false,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { onClick } = props

  return (
    <Button
      data-slot="sidebar-menu-sub-button"
      data-active={isActive ? "" : undefined}
      aria-current={isActive ? "page" : undefined}
      className={withClass(
        cn(
        "h-7 w-full justify-start gap-2 no-underline overflow-hidden border-0 bg-transparent px-2 text-sm font-normal hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground) data-active:bg-(--sidebar-accent) data-active:text-(--sidebar-accent-foreground) [&>svg]:size-4 [&>svg]:shrink-0",
        ),
        className
      )}
      {...props}
      onClick={(...args) => {
        onClick?.(...args)
        if (isMobile) setOpenMobile(false)
      }}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
