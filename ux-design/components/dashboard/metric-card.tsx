"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "info" | "warning" | "error" | "success"
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: MetricCardProps) {
  const variantStyles = {
    default: "bg-card",
    info: "bg-[oklch(var(--log-info)/0.08)] border-[oklch(var(--log-info)/0.2)]",
    warning: "bg-[oklch(var(--log-warn)/0.08)] border-[oklch(var(--log-warn)/0.2)]",
    error: "bg-[oklch(var(--log-error)/0.08)] border-[oklch(var(--log-error)/0.2)]",
    success: "bg-[oklch(var(--log-success)/0.08)] border-[oklch(var(--log-success)/0.2)]",
  }

  const iconStyles = {
    default: "text-muted-foreground bg-secondary",
    info: "text-chart-1 bg-chart-1/15",
    warning: "text-chart-3 bg-chart-3/15",
    error: "text-chart-4 bg-chart-4/15",
    success: "text-chart-2 bg-chart-2/15",
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-chart-2" : "text-chart-4"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs last hour</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-xl p-3", iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
