"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Lock, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface SecurityAlert {
  id: string
  type: "auth_failure" | "rate_limit" | "suspicious" | "blocked"
  title: string
  description: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface SecurityAlertsProps {
  alerts: SecurityAlert[]
}

const alertIcons = {
  auth_failure: Lock,
  rate_limit: AlertTriangle,
  suspicious: AlertTriangle,
  blocked: Ban,
}

const severityConfig = {
  low: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-chart-4/15 text-chart-4 border-chart-4/30",
}

export function SecurityAlerts({ alerts }: SecurityAlertsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-chart-4/10 p-2">
            <Shield className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Security Patterns</CardTitle>
            <p className="text-sm text-muted-foreground">Detected anomalies and alerts</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="font-mono">
            {alerts.length} active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-chart-2/10 p-3">
              <Shield className="h-8 w-8 text-chart-2" />
            </div>
            <p className="mt-3 text-sm font-medium text-card-foreground">No active alerts</p>
            <p className="text-sm text-muted-foreground">Your application is running normally</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = alertIcons[alert.type]
            return (
              <div
                key={alert.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className={cn("rounded-lg p-2", severityConfig[alert.severity])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-card-foreground">{alert.title}</p>
                    <Badge
                      variant="outline"
                      className={cn("text-xs capitalize", severityConfig[alert.severity])}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                  <p className="mt-2 text-xs font-mono text-muted-foreground">{alert.timestamp}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
