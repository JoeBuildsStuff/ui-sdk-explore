import { useState } from "react"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { InputClear, InputGroup, createInputController } from "@ui-sdk/react/input"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import {
  BookOpenIcon,
  BoxesIcon,
  ChevronDownIcon,
  FolderIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"

import { ModeToggle } from "./mode-toggle"
import { useHash } from "./use-hash"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar"

type Props = React.ComponentProps<typeof Sidebar>

const platform = [
  { title: "Home", href: "#home", icon: HomeIcon },
  {
    title: "Components",
    href: "#components",
    icon: BoxesIcon,
    children: [
      { title: "Buttons", href: "#components/buttons" },
      { title: "Inputs", href: "#components/inputs" },
      { title: "Menus", href: "#components/menus" },
    ],
  },
  { title: "Docs", href: "#docs", icon: BookOpenIcon, badge: "24" },
]

const projects = [
  { title: "ui-sdk-explore", href: "#project/ui-sdk-explore" },
  { title: "Design system", href: "#project/design-system" },
]

function AppSidebar(props: Props) {
  const active = useHash("#home")
  const { state, setOpen } = useSidebar()
  const [query, setQuery] = useState("")
  const [filter] = useState(createInputController)
  const hint = useShortcutHint("/")

  useShortcut(
    "/",
    () => {
      setOpen(true)
      filter.focus()
    },
    { description: "Filter sidebar links" }
  )

  const needle = state === "collapsed" ? "" : query.trim().toLowerCase()
  const visible = platform.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) ||
      item.children?.some((child) => child.title.toLowerCase().includes(needle))
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-8 items-center justify-between gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            ui-sdk-explore
          </span>
          <SidebarTrigger />
        </div>
        <InputGroup className="relative flex items-center group-data-[collapsible=icon]:hidden">
          <SidebarInput
            type="search"
            className="pr-8 [&::-webkit-search-cancel-button]:hidden"
            controller={filter}
            aria-label="Filter links"
            aria-keyshortcuts={hint.ariaKeyshortcuts}
            placeholder={`Filter (${hint.text})`}
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu aria-label="Platform">
              {visible.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.href}
                    defaultOpen
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={<SidebarMenuButton tooltip={item.title} />}
                      className="group/trigger"
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="ml-auto transition-transform group-data-open/trigger:rotate-180 group-data-[collapsible=icon]:hidden"
                      />
                    </CollapsibleTrigger>
                    <CollapsiblePanel>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              isActive={active === child.href}
                              render={<a href={child.href} />}
                            >
                              <span>{child.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsiblePanel>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={active === item.href}
                      render={<a href={item.href} />}
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              )}
              {visible.length === 0 && (
                <li
                  role="status"
                  className="px-2 py-1.5 text-sm text-(--ui-muted-foreground)"
                >
                  No matching links
                </li>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen render={<SidebarGroup />}>
          <SidebarGroupLabel
            render={<CollapsibleTrigger className="group/label w-full cursor-pointer border-0 bg-transparent text-left hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground)" />}
          >
            Projects
            <ChevronDownIcon
              aria-hidden="true"
              className="ml-auto size-4 transition-transform group-data-open/label:rotate-180"
            />
          </SidebarGroupLabel>
          <SidebarGroupAction
            aria-label="Add project"
            title="Add project"
            className="right-8"
          >
            <PlusIcon aria-hidden="true" />
          </SidebarGroupAction>
          <CollapsiblePanel>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Projects">
                {projects.map((project) => (
                  <SidebarMenuItem key={project.href}>
                    <SidebarMenuButton
                      tooltip={project.title}
                      isActive={active === project.href}
                      render={<a href={project.href} />}
                    >
                      <FolderIcon aria-hidden="true" />
                      <span>{project.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction aria-label={`Add to ${project.title}`}>
                      <PlusIcon aria-hidden="true" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsiblePanel>
        </Collapsible>
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu aria-label="Account">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={active === "#settings"}
              render={<a href="#settings" />}
            >
              <SettingsIcon aria-hidden="true" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden">
          <ModeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export { AppSidebar }
