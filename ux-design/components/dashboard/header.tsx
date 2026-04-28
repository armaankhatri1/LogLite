"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, RefreshCw, Settings, Bell } from "lucide-react"

interface HeaderProps {
  lastUpdated: string
  onRefresh?: () => void
}

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">LogLite</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Lightweight Log Analysis
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden font-mono text-xs sm:flex">
            <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-chart-2" />
            Live
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground lg:block">
            Last updated: {lastUpdated}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh data</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
