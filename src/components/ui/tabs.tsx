"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs")
  }
  return context
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

function Tabs({
  className,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "group/tabs flex gap-2",
          orientation === "horizontal" ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent rounded-none",
      },
      orientation: {
        horizontal: "h-8 flex-row",
        vertical: "h-fit flex-col",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
)

interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

function TabsList({ className, variant = "default", ...props }: TabsListProps) {
  const { orientation } = useTabsContext()

  return (
    <div
      data-slot="tabs-list"
      data-variant={variant}
      role="tablist"
      aria-orientation={orientation}
      className={cn(tabsListVariants({ variant, orientation }), className)}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, orientation } = useTabsContext()
    const isActive = selectedValue === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        data-slot="tabs-trigger"
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all",
          "text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "dark:text-muted-foreground dark:hover:text-foreground",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          orientation === "vertical" && "w-full justify-start",
          isActive && [
            "bg-background text-foreground shadow-sm",
            "dark:border-input dark:bg-input/30 dark:text-foreground",
            "after:absolute after:bg-foreground after:transition-opacity",
            orientation === "horizontal" &&
              "after:inset-x-0 after:bottom-[-5px] after:h-0.5 after:opacity-100",
            orientation === "vertical" &&
              "after:inset-y-0 after:-right-1 after:w-0.5 after:opacity-100",
          ],
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()
    const isActive = selectedValue === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        id={`panel-${value}`}
        role="tabpanel"
        aria-labelledby={`tab-${value}`}
        data-slot="tabs-content"
        data-state={isActive ? "active" : "inactive"}
        className={cn("flex-1 text-sm outline-none", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
