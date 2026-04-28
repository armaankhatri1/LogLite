"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

export interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "WARN" | "ERROR"
  message: string
  source: string
}

interface LogsTableProps {
  logs: LogEntry[]
}

const levelConfig = {
  INFO: {
    className: "bg-chart-1/15 text-chart-1 hover:bg-chart-1/25 border-chart-1/30",
  },
  WARN: {
    className: "bg-chart-3/15 text-chart-3 hover:bg-chart-3/25 border-chart-3/30",
  },
  ERROR: {
    className: "bg-chart-4/15 text-chart-4 hover:bg-chart-4/25 border-chart-4/30",
  },
}

export function LogsTable({ logs }: LogsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Logs</CardTitle>
            <p className="text-sm text-muted-foreground">Live log stream from your application</p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {logs.length} entries
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                )}
              >
                <Badge
                  variant="outline"
                  className={cn("shrink-0 font-mono text-xs", levelConfig[log.level].className)}
                >
                  {log.level}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-card-foreground">{log.message}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{log.timestamp}</span>
                    <span className="text-border">|</span>
                    <span>{log.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
