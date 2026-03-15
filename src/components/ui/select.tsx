"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

type SelectContextValue = {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  open: controlledOpen,
  onOpenChange,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlledValue = controlledValue !== undefined
  const isControlledOpen = controlledOpen !== undefined

  const value = isControlledValue ? controlledValue : internalValue
  const open = isControlledOpen ? controlledOpen : internalOpen

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlledValue) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)

      // Close the select after selection
      const newOpen = false
      if (!isControlledOpen) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlledValue, isControlledOpen, onValueChange, onOpenChange]
  )

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlledOpen) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlledOpen, onOpenChange]
  )

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return (
    <div
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

function SelectValue({ className, placeholder, ...props }: SelectValueProps) {
  const { value } = useSelectContext()

  return (
    <span
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    >
      {value || placeholder}
    </span>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default"
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        data-slot="select-trigger"
        data-size={size}
        aria-expanded={open}
        className={cn(
          "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  alignItemWithTrigger?: boolean
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
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
      data-slot="select-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "absolute z-50 mt-1 max-h-96 w-full min-w-36 origin-top overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
        side === "top" && "bottom-full mb-1 mt-0",
        className
      )}
      style={{ marginTop: side === "bottom" ? sideOffset : undefined }}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext()
  const isSelected = selectedValue === value

  return (
    <div
      data-slot="select-item"
      data-state={isSelected ? "checked" : "unchecked"}
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{children}</span>
      {isSelected && (
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          <CheckIcon className="pointer-events-none size-4" />
        </span>
      )}
    </div>
  )
}

interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <div
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
