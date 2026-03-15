"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, children, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        data-slot="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn("flex flex-wrap gap-3", className)}
        {...props}
      >
        {children}
        <div
          data-slot="progress-track"
          className="relative flex h-1 w-full items-center overflow-hidden rounded-full bg-muted"
        >
          <div
            data-slot="progress-indicator"
            className="h-full bg-primary transition-all duration-200 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

interface ProgressTrackProps extends React.HTMLAttributes<HTMLDivElement> {}

function ProgressTrack({ className, children, ...props }: ProgressTrackProps) {
  return (
    <div
      className={cn(
        "relative flex h-1 w-full items-center overflow-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    >
      {children}
    </div>
  )
}

interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

function ProgressIndicator({
  className,
  value = 0,
  max = 100,
  ...props
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all duration-200", className)}
      style={{ width: `${percentage}%` }}
      {...props}
    />
  )
}

interface ProgressLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  return (
    <div
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

interface ProgressValueProps extends React.HTMLAttributes<HTMLDivElement> {}

function ProgressValue({ className, ...props }: ProgressValueProps) {
  return (
    <div
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue }
