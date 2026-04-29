"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bug, ChevronRight } from "lucide-react"

interface ErrorGroup {
  id: string
  message: string
  count: number
  percentage: number
  lastOccurred: string
}

interface ErrorGroupsProps {
  errors: ErrorGroup[]
}

export function ErrorGroups({ errors }: ErrorGroupsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-chart-4/10 p-2">
            <Bug className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Recurring Errors</CardTitle>
            <p className="text-sm text-muted-foreground">Grouped by error message</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.map((error) => (
          <div
            key={error.id}
            className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {error.message}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last occurred: {error.lastOccurred}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="font-mono">
                  {error.count}x
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={error.percentage} className="h-1.5 bg-muted" />
              <p className="mt-1 text-xs text-muted-foreground text-right">
                {error.percentage}% of total errors
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
