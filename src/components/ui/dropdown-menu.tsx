"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

type DropdownMenuContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("DropdownMenu components must be used within a DropdownMenu")
  }
  return context
}

interface DropdownMenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function DropdownMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange]
  )

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuPortalProps {
  children: React.ReactNode
}

function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  return <>{children}</>
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, onClick, children, asChild, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open)
      onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
        "aria-expanded": open,
      })
    }

    return (
      <button
        ref={ref}
        data-slot="dropdown-menu-trigger"
        aria-expanded={open}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  alignOffset?: number
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  (
    {
      className,
      align = "start",
      alignOffset = 0,
      side = "bottom",
      sideOffset = 4,
      children,
      ...props
    },
    ref
  ) => {
    const { open, setOpen } = useDropdownMenuContext()
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <div
        ref={contentRef}
        data-slot="dropdown-menu-content"
        data-state={open ? "open" : "closed"}
        className={cn(
          "absolute z-50 min-w-32 origin-top overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
          side === "bottom" && "top-full mt-1",
          side === "top" && "bottom-full mb-1",
          side === "left" && "right-full mr-1",
          side === "right" && "left-full ml-1",
          align === "start" && (side === "bottom" || side === "top") && "left-0",
          align === "end" && (side === "bottom" || side === "top") && "right-0",
          align === "center" && (side === "bottom" || side === "top") && "left-1/2 -translate-x-1/2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuGroup({ ...props }: DropdownMenuGroupProps) {
  return <div data-slot="dropdown-menu-group" {...props} />
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground",
        inset && "pl-7",
        className
      )}
      {...props}
    />
  )
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  variant?: "default" | "destructive"
  disabled?: boolean
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  disabled,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      onClick?.(e)
      setOpen(false)
    }
  }

  return (
    <div
      data-slot="dropdown-menu-item"
      data-variant={variant}
      data-disabled={disabled}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        inset && "pl-7",
        variant === "destructive" && "text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive dark:focus:bg-destructive/20 dark:hover:bg-destructive/20",
        disabled && "pointer-events-none opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

// Additional exports for compatibility
interface DropdownMenuSubProps {
  children: React.ReactNode
}

function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return <>{children}</>
}

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <div
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
        inset && "pl-7",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <div
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "min-w-[96px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
        className
      )}
      {...props}
    />
  )
}

interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean
  inset?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  onCheckedChange,
  onClick,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onCheckedChange?.(!checked)
    onClick?.(e)
  }

  return (
    <div
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        inset && "pl-7",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      {checked && (
        <span
          className="pointer-events-none absolute right-2 flex items-center justify-center"
          data-slot="dropdown-menu-checkbox-item-indicator"
        >
          <CheckIcon className="size-4" />
        </span>
      )}
    </div>
  )
}

interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const DropdownMenuRadioContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
} | null>(null)

function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
  ...props
}: DropdownMenuRadioGroupProps) {
  return (
    <DropdownMenuRadioContext.Provider value={{ value, onValueChange }}>
      <div data-slot="dropdown-menu-radio-group" {...props}>
        {children}
      </div>
    </DropdownMenuRadioContext.Provider>
  )
}

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  inset?: boolean
}

function DropdownMenuRadioItem({
  className,
  children,
  value,
  inset,
  onClick,
  ...props
}: DropdownMenuRadioItemProps) {
  const context = React.useContext(DropdownMenuRadioContext)
  const isChecked = context?.value === value

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    context?.onValueChange?.(value)
    onClick?.(e)
  }

  return (
    <div
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        inset && "pl-7",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      {isChecked && (
        <span
          className="pointer-events-none absolute right-2 flex items-center justify-center"
          data-slot="dropdown-menu-radio-item-indicator"
        >
          <CheckIcon className="size-4" />
        </span>
      )}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
