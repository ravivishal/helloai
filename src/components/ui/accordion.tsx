"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

type AccordionContextValue = {
  expandedItems: string[]
  toggleItem: (value: string) => void
  type?: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion")
  }
  return context
}

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

function Accordion({
  className,
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  ...props
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return []
  })

  const isControlled = controlledValue !== undefined
  const value = isControlled
    ? Array.isArray(controlledValue)
      ? controlledValue
      : [controlledValue]
    : expandedItems

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      const newValue =
        type === "single"
          ? value.includes(itemValue)
            ? []
            : [itemValue]
          : value.includes(itemValue)
          ? value.filter((v) => v !== itemValue)
          : [...value, itemValue]

      if (!isControlled) {
        setExpandedItems(newValue)
      }

      if (onValueChange) {
        onValueChange(type === "single" ? newValue[0] || "" : newValue)
      }
    },
    [type, value, isControlled, onValueChange]
  )

  return (
    <AccordionContext.Provider value={{ expandedItems: value, toggleItem, type }}>
      <div
        data-slot="accordion"
        className={cn("flex w-full flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function AccordionItem({ className, value, children, ...props }: AccordionItemProps) {
  return (
    <div
      data-slot="accordion-item"
      data-value={value}
      className={cn("border-b last:border-b-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, value, ...props }, ref) => {
    const { expandedItems, toggleItem } = useAccordionContext()

    // Get value from parent AccordionItem if not provided directly
    const itemValue = value || (props as any)["data-value"]
    const isExpanded = expandedItems.includes(itemValue)

    return (
      <div className="flex">
        <button
          ref={ref}
          type="button"
          data-slot="accordion-trigger"
          aria-expanded={isExpanded}
          className={cn(
            "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          onClick={() => toggleItem(itemValue)}
          {...props}
        >
          {children}
          <ChevronDownIcon
            data-slot="accordion-trigger-icon"
            className={cn(
              "pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      </div>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
}

function AccordionContent({ className, children, value, ...props }: AccordionContentProps) {
  const { expandedItems } = useAccordionContext()
  const itemValue = value || (props as any)["data-value"]
  const isExpanded = expandedItems.includes(itemValue)

  return (
    <div
      data-slot="accordion-content"
      data-state={isExpanded ? "open" : "closed"}
      className={cn(
        "overflow-hidden text-sm transition-all duration-200",
        isExpanded ? "animate-accordion-down" : "animate-accordion-up"
      )}
      style={{
        height: isExpanded ? "auto" : 0,
      }}
    >
      <div className={cn("pt-0 pb-2.5", className)} {...props}>
        {children}
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
