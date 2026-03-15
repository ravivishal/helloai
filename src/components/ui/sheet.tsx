"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

type SheetContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheetContext() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet")
  }
  return context
}

interface SheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: SheetProps) {
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
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, onClick, children, asChild, ...props }, ref) => {
    const { setOpen } = useSheetContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(true)
      onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
      })
    }

    return (
      <button
        ref={ref}
        data-slot="sheet-trigger"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ className, onClick, children, asChild, ...props }, ref) => {
    const { setOpen } = useSheetContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false)
      onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
      })
    }

    return (
      <button
        ref={ref}
        data-slot="sheet-close"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SheetClose.displayName = "SheetClose"

interface SheetPortalProps {
  children: React.ReactNode
}

function SheetPortal({ children }: SheetPortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return typeof document !== "undefined"
    ? createPortal(children, document.body)
    : null
}

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

const SheetOverlay = React.forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className, ...props }, ref) => {
    const { setOpen } = useSheetContext()

    return (
      <div
        ref={ref}
        data-slot="sheet-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-black/10 backdrop-blur-sm animate-in fade-in-0",
          className
        )}
        onClick={() => setOpen(false)}
        {...props}
      />
    )
  }
)
SheetOverlay.displayName = "SheetOverlay"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = "right", showCloseButton = true, ...props }, ref) => {
    const { open, setOpen } = useSheetContext()

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener("keydown", handleEscape)
        document.body.style.overflow = "hidden"
      }

      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = ""
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <SheetPortal>
        <SheetOverlay />
        <div
          ref={ref}
          data-slot="sheet-content"
          data-side={side}
          className={cn(
            "fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
            side === "right" && "animate-in slide-in-from-right",
            side === "left" && "animate-in slide-in-from-left",
            side === "top" && "animate-in slide-in-from-top",
            side === "bottom" && "animate-in slide-in-from-bottom",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <button
              data-slot="sheet-close"
              className="absolute top-3 right-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={() => setOpen(false)}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = "SheetContent"

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2", className)}
      {...props}
    />
  )
}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        data-slot="sheet-title"
        className={cn("text-base font-medium text-foreground", className)}
        {...props}
      />
    )
  }
)
SheetTitle.displayName = "SheetTitle"

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="sheet-description"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  }
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
